import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { AlertCircle, Camera, CameraOff, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attendance',
        href: '/attendance',
    },
    {
        title: 'QR Scanner',
        href: '/attendance/qr-scanner',
    },
];

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

export default function QrScannerPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const qrCodeRegionId = 'qr-reader';

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (scannerRef.current && isScanning) {
                scannerRef.current
                    .stop()
                    .then(() => {
                        scannerRef.current = null;
                    })
                    .catch((err) => {
                        console.error('Error stopping scanner:', err);
                    });
            }
        };
    }, [isScanning]);

    const checkCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach((track) => track.stop());
            setHasPermission(true);
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            setHasPermission(false);
            toast.error('Camera permission is required to scan QR codes');
            return false;
        }
    };

    const startScanning = async () => {
        if (isScanning) return;

        const hasPermissionResult = await checkCameraPermission();
        if (!hasPermissionResult) {
            return;
        }

        try {
            setIsScanning(true);
            setScanResult(null);
            setIsProcessing(false);

            const html5QrCode = new Html5Qrcode(qrCodeRegionId);
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' }, // Use back camera on mobile
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore scanning errors (they're normal while scanning)
                }
            );

            toast.success('Camera started. Position QR code in frame.');
        } catch (error: any) {
            console.error('Error starting scanner:', error);
            toast.error('Failed to start camera. Please check permissions.');
            setIsScanning(false);
            setHasPermission(false);
        }
    };

    const stopScanning = async () => {
        if (!isScanning || !scannerRef.current) return;

        try {
            await scannerRef.current.stop();
            scannerRef.current.clear();
            scannerRef.current = null;
            setIsScanning(false);
            toast.info('Camera stopped');
        } catch (error) {
            console.error('Error stopping scanner:', error);
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        if (isProcessing) return; // Prevent multiple simultaneous scans

        try {
            setIsProcessing(true);
            stopScanning();

            // Parse QR code data
            let qrData;
            try {
                qrData = JSON.parse(decodedText);
            } catch (e) {
                toast.error('Invalid QR code format');
                setIsProcessing(false);
                setTimeout(() => {
                    startScanning();
                }, 2000);
                return;
            }

            // Send to API
            const response = await axios.post('/api/qr-attendance/scan', {
                token: qrData.token,
                signature: qrData.signature,
                device_fingerprint: navigator.userAgent,
            });

            const result: ScanResult = response.data;
            setScanResult(result);

            if (result.success) {
                toast.success(result.message || 'Attendance recorded successfully!');
            } else {
                toast.error(result.message || 'Failed to record attendance');
            }

            // Auto-restart scanning after 3 seconds
            setTimeout(() => {
                setScanResult(null);
                setIsProcessing(false);
                startScanning();
            }, 3000);
        } catch (error: any) {
            console.error('Scan processing error:', error);
            const errorMessage =
                error.response?.data?.message || 'Failed to process QR code. Please try again.';
            toast.error(errorMessage);

            setScanResult({
                success: false,
                message: errorMessage,
            });

            // Auto-restart scanning after 3 seconds
            setTimeout(() => {
                setScanResult(null);
                setIsProcessing(false);
                startScanning();
            }, 3000);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <SidebarHoverZone />
                <Main>
                    <Head title="QR Code Scanner - Attendance" />
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <div className="mx-auto w-full max-w-4xl">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        QR Code Attendance Scanner
                                    </CardTitle>
                                    <CardDescription>
                                        Scan employee QR codes to record attendance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center gap-6">
                                        {/* Camera Preview Area */}
                                        <div className="relative w-full max-w-md">
                                            <div
                                                id={qrCodeRegionId}
                                                className={`overflow-hidden rounded-lg border-2 ${
                                                    isScanning
                                                        ? 'border-primary'
                                                        : 'border-muted bg-muted/50'
                                                }`}
                                                style={{ minHeight: '300px' }}
                                            >
                                                {!isScanning && (
                                                    <div className="flex h-[300px] flex-col items-center justify-center gap-4 text-center text-muted-foreground">
                                                        <CameraOff className="h-12 w-12" />
                                                        <p>Camera not active</p>
                                                        <p className="text-sm">
                                                            Click "Start Camera" to begin scanning
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Processing Overlay */}
                                            {isProcessing && (
                                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                        <p className="text-sm font-medium">Processing...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Control Buttons */}
                                        <div className="flex gap-3">
                                            {!isScanning ? (
                                                <Button onClick={startScanning} size="lg" className="gap-2">
                                                    <Camera className="h-4 w-4" />
                                                    Start Camera
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={stopScanning}
                                                    variant="destructive"
                                                    size="lg"
                                                    className="gap-2"
                                                >
                                                    <CameraOff className="h-4 w-4" />
                                                    Stop Camera
                                                </Button>
                                            )}
                                        </div>

                                        {/* Scan Result */}
                                        {scanResult && (
                                            <Card
                                                className={`w-full ${
                                                    scanResult.success
                                                        ? 'border-green-500 bg-green-50/50'
                                                        : 'border-red-500 bg-red-50/50'
                                                }`}
                                            >
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start gap-3">
                                                        {scanResult.success ? (
                                                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                        )}
                                                        <div className="flex-1">
                                                            <p
                                                                className={`font-semibold ${
                                                                    scanResult.success
                                                                        ? 'text-green-900'
                                                                        : 'text-red-900'
                                                                }`}
                                                            >
                                                                {scanResult.message}
                                                            </p>
                                                            {scanResult.attendance && (
                                                                <div className="mt-3 space-y-1 text-sm">
                                                                    <p className="font-medium">
                                                                        {scanResult.attendance.employee_name}
                                                                    </p>
                                                                    <p className="text-muted-foreground">
                                                                        {scanResult.attendance.employeeid} •{' '}
                                                                        {scanResult.attendance.attendance_date}
                                                                    </p>
                                                                    {scanResult.attendance.time_in && (
                                                                        <p className="text-muted-foreground">
                                                                            Time In: {scanResult.attendance.time_in}
                                                                        </p>
                                                                    )}
                                                                    {scanResult.attendance.time_out && (
                                                                        <p className="text-muted-foreground">
                                                                            Time Out:{' '}
                                                                            {scanResult.attendance.time_out}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-muted-foreground">
                                                                        Session: {scanResult.attendance.session} •{' '}
                                                                        Status: {scanResult.attendance.status}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {scanResult.current_session && !scanResult.success && (
                                                                <div className="mt-2 flex items-start gap-2 rounded bg-blue-50 p-2">
                                                                    <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-xs text-blue-900">
                                                                        Current session: {scanResult.current_session}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Instructions */}
                                        <Card className="w-full border-blue-200 bg-blue-50/50">
                                            <CardContent className="pt-6">
                                                <div className="space-y-2 text-sm text-blue-900">
                                                    <p className="font-semibold">Instructions:</p>
                                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                                        <li>Click "Start Camera" to begin scanning</li>
                                                        <li>Position the employee's QR code within the frame</li>
                                                        <li>The scanner will automatically detect and process the QR
                                                            code</li>
                                                        <li>Attendance will be recorded automatically</li>
                                                        <li>The scanner will restart after each scan</li>
                                                    </ul>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </Main>
            </SidebarInset>
        </SidebarProvider>
    );
}

