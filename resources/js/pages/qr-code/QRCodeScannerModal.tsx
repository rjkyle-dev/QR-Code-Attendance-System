import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { AlertCircle, Camera, CameraOff, CheckCircle2, Loader2, User, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ManualEntryModal } from './ManualEntryModal';

interface ScanResult {
    success: boolean;
    message: string;
    attendance?: {
        id: number;
        employee_id: number;
        employeeid: string;
        employee_name: string;
        time_in?: string;
        time_out?: string;
        attendance_date: string;
        session: string;
        status: string;
        action: string;
    };
    current_session?: string;
}

interface QRCodeScannerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAttendanceRecorded?: () => void;
}

export function QRCodeScannerModal({ open, onOpenChange, onAttendanceRecorded }: QRCodeScannerModalProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement | null>(null);
    const [scanId] = useState<string>(() => `qr-reader-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const [containerKey, setContainerKey] = useState(0);
    const isUnmountingRef = useRef(false);
    const isStoppingRef = useRef(false);

    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [showManualModal, setShowManualModal] = useState(false);

    const stopScanner = useCallback(async () => {
        if (isStoppingRef.current) {
            return;
        }

        isStoppingRef.current = true;

        if (!scannerRef.current) {
            setIsScanning(false);
            isStoppingRef.current = false;
            return;
        }

        const scanner = scannerRef.current;
        setIsScanning(false);

        try {
            try {
                await scanner.stop();
            } catch (stopError: any) {
                const errorMsg = stopError?.message || '';
                if (
                    !errorMsg.includes('not running') &&
                    !errorMsg.includes('not started') &&
                    !errorMsg.includes('already stopped') &&
                    !errorMsg.includes('scanner is not running')
                ) {
                    console.warn('Error stopping scanner:', stopError);
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 300));

            try {
                await scanner.clear();
            } catch (clearError: any) {
                const errorMsg = clearError?.message || '';
                if (!errorMsg.includes('Cannot clear while scan is ongoing') && !errorMsg.includes('not found')) {
                    console.warn('Error clearing scanner:', clearError);
                }
            }

            setContainerKey((prev) => prev + 1);

            await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error: any) {
            console.warn('Error during scanner cleanup:', error);
        } finally {
            scannerRef.current = null;
            isStoppingRef.current = false;
        }
    }, []);

    useEffect(() => {
        if (open) {
            setIsProcessing(false);
            setIsScanning(false);
            setContainerKey((prev) => prev + 1);
            setScanResult(null);
        }
    }, [open]);

    useEffect(() => {
        isUnmountingRef.current = false;
        return () => {
            isUnmountingRef.current = true;
            stopScanner();
        };
    }, [stopScanner]);

    const checkCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach((track) => track.stop());
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            toast.error('Camera permission is required to scan QR codes');
            return false;
        }
    };

    const startScanningRef = useRef<(() => Promise<void>) | null>(null);
    const handleScanSuccessRef = useRef<((decodedText: string) => Promise<void>) | null>(null);

    const handleScanSuccess = useCallback(async (decodedText: string) => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);
            await stopScanner();

            let qrData;
            try {
                qrData = JSON.parse(decodedText);
            } catch (e) {
                toast.error('Invalid QR code format');
                setIsProcessing(false);
                setTimeout(() => {
                    if (startScanningRef.current) {
                        startScanningRef.current();
                    }
                }, 2000);
                return;
            }

            const response = await axios.post('/api/qr-attendance/scan', {
                employee_id: qrData.employee_id,
                token: qrData.token,
                signature: qrData.signature,
                device_fingerprint: navigator.userAgent,
            });

            const result: ScanResult = response.data;
            setScanResult(result);

            if (result.success) {
                toast.success(result.message || 'Attendance recorded successfully!');
                onAttendanceRecorded?.();
                setTimeout(() => {
                    onOpenChange(false);
                    setIsProcessing(false);
                    setScanResult(null);
                }, 2000);
            } else {
                toast.error(result.message || 'Failed to record attendance');
                setIsProcessing(false);
                setTimeout(() => {
                    if (startScanningRef.current) {
                        startScanningRef.current();
                    }
                }, 3000);
            }
        } catch (error: any) {
            console.error('Scan processing error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to process QR code. Please try again.';
            toast.error(errorMessage);

            setScanResult({
                success: false,
                message: errorMessage,
            });

            setIsProcessing(false);
            setTimeout(() => {
                if (startScanningRef.current) {
                    startScanningRef.current();
                }
            }, 3000);
        }
    }, [isProcessing, stopScanner, onAttendanceRecorded, onOpenChange]);

    handleScanSuccessRef.current = handleScanSuccess;

    const startScanning = useCallback(async () => {
        if (isScanning || isStoppingRef.current) {
            return;
        }

        let waitAttempts = 0;
        while (isStoppingRef.current && waitAttempts < 20) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            waitAttempts++;
        }

        if (isStoppingRef.current) {
            toast.error('Please wait for the camera to stop completely before starting again.');
            return;
        }

        let attempts = 0;
        while (!scannerContainerRef.current && attempts < 15) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
        }

        if (!scannerContainerRef.current) {
            toast.error('Scanner container not available. Please try again.');
            return;
        }

        const hasPermissionResult = await checkCameraPermission();
        if (!hasPermissionResult) {
            return;
        }

        try {
            setIsScanning(true);
            setIsProcessing(false);

            await new Promise((resolve) => setTimeout(resolve, 400));

            let container = scannerContainerRef.current;
            let elementById = document.getElementById(scanId);

            if (!container || !elementById) {
                await new Promise((resolve) => setTimeout(resolve, 300));
                container = scannerContainerRef.current;
                elementById = document.getElementById(scanId);
            }

            if (!container || !elementById) {
                throw new Error('Scanner container element not found in DOM');
            }

            try {
                if (container.replaceChildren) {
                    container.replaceChildren();
                } else {
                    container.innerHTML = '';
                }
            } catch (e) {
                try {
                    container.innerHTML = '';
                } catch (e2) {
                    console.warn('Could not clear container:', e2);
                }
            }

            const html5QrCode = new Html5Qrcode(scanId);
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    disableFlip: false,
                },
                (decodedText) => {
                    if (handleScanSuccessRef.current) {
                        handleScanSuccessRef.current(decodedText);
                    }
                },
                (errorMessage) => {
                    // Silent error handling for scan attempts
                },
            );

            toast.success('Camera started. Position QR code in frame.');
        } catch (error: any) {
            console.error('Error starting scanner:', error);
            toast.error('Failed to start camera. Please check permissions.');
            setIsScanning(false);
            if (scannerRef.current) {
                try {
                    await scannerRef.current.clear();
                } catch (e) {
                    // Ignore clear errors
                }
                scannerRef.current = null;
            }
        }
    }, [isScanning, scanId]);

    startScanningRef.current = startScanning;

    const handleModalOpenChange = async (open: boolean) => {
        if (!open) {
            await stopScanner();
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
        onOpenChange(open);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleModalOpenChange}>
                <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            QR Code Scanner
                        </DialogTitle>
                        <DialogDescription>Position your QR code within the camera frame</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        {/* QR Code Scanner Section */}
                        <div className="space-y-4">
                            <div className="relative w-full">
                                <div
                                    key={`scanner-container-${containerKey}`}
                                    ref={scannerContainerRef}
                                    id={scanId}
                                    className={`overflow-hidden rounded-lg border-2 ${isScanning ? 'border-primary' : 'border-muted bg-muted/50'}`}
                                    style={{ minHeight: '300px', width: '100%' }}
                                >
                                    {!isScanning && !isProcessing && (
                                        <div className="flex h-[300px] flex-col items-center justify-center gap-4 text-center text-muted-foreground">
                                            <CameraOff className="h-16 w-16" />
                                            <p className="text-lg font-medium">Camera not active</p>
                                            <p className="text-sm">Click "Start Camera" to begin scanning</p>
                                        </div>
                                    )}
                                </div>

                                {isProcessing && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/90 backdrop-blur-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <p className="text-sm font-medium">Processing QR code...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    {!isScanning ? (
                                        <Button onClick={startScanning} size="lg" className="flex-1 gap-2" disabled={isProcessing}>
                                            <Camera className="h-4 w-4" />
                                            Start Camera
                                        </Button>
                                    ) : (
                                        <Button onClick={stopScanner} variant="destructive" size="lg" className="flex-1 gap-2" disabled={isProcessing}>
                                            <CameraOff className="h-4 w-4" />
                                            Stop Camera
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => {
                                            handleModalOpenChange(false);
                                        }}
                                        variant="outline"
                                        size="lg"
                                        disabled={isProcessing}
                                    >
                                        Close
                                    </Button>
                                </div>
                                <Button
                                    onClick={() => {
                                        setShowManualModal(true);
                                    }}
                                    variant="outline"
                                    size="lg"
                                    className="w-full gap-2"
                                    disabled={isProcessing || isScanning}
                                >
                                    <User className="h-4 w-4" />
                                    Manual Entry
                                </Button>
                            </div>
                        </div>

                        {/* Result Display */}
                        {scanResult && (
                            <Card
                                className={`w-full ${scanResult.success ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50'}`}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        {scanResult.success ? (
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                        ) : (
                                            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                                        )}
                                        <div className="flex-1">
                                            <p className={`font-semibold ${scanResult.success ? 'text-green-900' : 'text-red-900'}`}>
                                                {scanResult.message}
                                            </p>
                                            {scanResult.attendance && (
                                                <div className="mt-3 space-y-1 text-sm">
                                                    <p className="font-medium">{scanResult.attendance.employee_name}</p>
                                                    <p className="text-muted-foreground">
                                                        {scanResult.attendance.employeeid} • {scanResult.attendance.attendance_date}
                                                    </p>
                                                    {scanResult.attendance.time_in && (
                                                        <p className="text-muted-foreground">Time In: {scanResult.attendance.time_in}</p>
                                                    )}
                                                    {scanResult.attendance.time_out && (
                                                        <p className="text-muted-foreground">Time Out: {scanResult.attendance.time_out}</p>
                                                    )}
                                                    <p className="text-muted-foreground">
                                                        Session: {scanResult.attendance.session} • Status: {scanResult.attendance.status}
                                                    </p>
                                                </div>
                                            )}
                                            {scanResult.current_session && !scanResult.success && (
                                                <div className="mt-2 flex items-start gap-2 rounded bg-blue-50 p-2">
                                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                                                    <p className="text-xs text-blue-900">Current session: {scanResult.current_session}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <ManualEntryModal open={showManualModal} onOpenChange={setShowManualModal} onAttendanceRecorded={onAttendanceRecorded} />
        </>
    );
}

