import { BackButton } from '@/components/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { AlertCircle, Camera, CameraOff, CheckCircle2, Clock, Loader2, QrCode, RefreshCw, User, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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

interface AttendanceRecord {
    id: number;
    employee_id: number;
    employeeid: string;
    employee_name: string;
    department: string | null;
    position: string | null;
    time_in: string | null;
    time_out: string | null;
    attendance_status: string;
    session: string;
    attendance_date: string;
}

export default function PublicAttendancePage() {
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement | null>(null);
    const [scanId] = useState<string>(() => `qr-reader-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const [containerKey, setContainerKey] = useState(0);
    const isUnmountingRef = useRef(false);
    const isStoppingRef = useRef(false);

    const [employeeId, setEmployeeId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('scanner');

    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

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
        if (showCameraModal) {
            setScanResult(null);
            setIsProcessing(false);
            setIsScanning(false);
            setContainerKey((prev) => prev + 1);
        }
    }, [showCameraModal]);

    const fetchTodayAttendance = useCallback(async () => {
        setIsLoadingAttendance(true);
        try {
            const response = await axios.get('/api/qr-attendance/today');
            if (response.data.success) {
                setAttendanceRecords(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setIsLoadingAttendance(false);
        }
    }, []);

    useEffect(() => {
        fetchTodayAttendance();
    }, [fetchTodayAttendance]);

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
            setScanResult(null);
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
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
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
                }
                scannerRef.current = null;
            }
        }
    }, [isScanning, scanId]);

    const handleScanSuccess = async (decodedText: string) => {
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
                    startScanning();
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
                fetchTodayAttendance();
                setTimeout(() => {
                    setShowCameraModal(false);
                    setScanResult(null);
                    setIsProcessing(false);
                }, 2000);
            } else {
                toast.error(result.message || 'Failed to record attendance');
                setIsProcessing(false);
                setTimeout(() => {
                    setScanResult(null);
                    startScanning();
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
                setScanResult(null);
                startScanning();
            }, 3000);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId.trim()) {
            toast.error('Please enter your Employee ID');
            return;
        }

        setIsSubmitting(true);
        setScanResult(null);

        try {
            const response = await axios.post('/api/qr-attendance/record-by-employeeid', {
                employeeid: employeeId.trim(),
            });

            const result: ScanResult = response.data;
            setScanResult(result);

            if (result.success) {
                toast.success(result.message || 'Attendance recorded successfully!');
                setEmployeeId('');
                fetchTodayAttendance();
            } else {
                toast.error(result.message || 'Failed to record attendance');
            }
        } catch (error: any) {
            console.error('Manual submission error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to record attendance. Please try again.';
            toast.error(errorMessage);

            setScanResult({
                success: false,
                message: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalOpenChange = async (open: boolean) => {
        if (!open) {
            await stopScanner();
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
        setShowCameraModal(open);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
            <Head title="Employee Attendance - CheckWise" />

            <div className="border-b bg-white shadow-sm">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <BackButton href="/" label="Back to Home" variant="ghost" className="text-gray-700 hover:text-gray-900" />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-cfar-400">CheckWise</h1>
                        <p className="text-sm text-gray-600">Employee Attendance System</p>
                    </div>
                    <div className="w-32"></div>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl px-4 py-8">
                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Clock className="h-6 w-6 text-cfar-400" />
                            Record Your Attendance
                        </CardTitle>
                        <CardDescription>Scan your QR code or enter your Employee ID to record attendance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="scanner" className="gap-2">
                                    <QrCode className="h-4 w-4" />
                                    QR Code Scanner
                                </TabsTrigger>
                                <TabsTrigger value="manual" className="gap-2">
                                    <User className="h-4 w-4" />
                                    Manual Entry
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="scanner" className="space-y-6">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="text-center">
                                        <p className="mb-4 text-muted-foreground">Click the button below to open the camera scanner</p>
                                        <Button onClick={() => setShowCameraModal(true)} size="lg" className="gap-2">
                                            <Camera className="h-5 w-5" />
                                            Start Camera Scanner
                                        </Button>
                                    </div>

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
                                                                    <p className="text-muted-foreground">
                                                                        Time Out: {scanResult.attendance.time_out}
                                                                    </p>
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

                                    <Card className="w-full border-blue-200 bg-blue-50/50">
                                        <CardContent className="pt-6">
                                            <div className="space-y-2 text-sm text-blue-900">
                                                <p className="font-semibold">Instructions:</p>
                                                <ul className="ml-2 list-inside list-disc space-y-1">
                                                    <li>Click "Start Camera Scanner" to open the camera</li>
                                                    <li>Allow camera permissions when prompted</li>
                                                    <li>Position your QR code within the frame</li>
                                                    <li>The scanner will automatically detect and process the QR code</li>
                                                    <li>Attendance will be recorded automatically</li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="manual" className="space-y-6">
                                <form onSubmit={handleManualSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employeeId">Employee ID</Label>
                                        <Input
                                            id="employeeId"
                                            type="text"
                                            placeholder="Enter your Employee ID (e.g., EMP10282001)"
                                            value={employeeId}
                                            onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                                            className="text-lg"
                                            disabled={isSubmitting}
                                        />
                                        <p className="text-sm text-muted-foreground">Enter your Employee ID to record attendance</p>
                                    </div>

                                    <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting || !employeeId.trim()}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="h-4 w-4" />
                                                Record Attendance
                                            </>
                                        )}
                                    </Button>
                                </form>

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
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                <Card className="border-blue-200 bg-blue-50/50">
                                    <CardContent className="pt-6">
                                        <div className="space-y-2 text-sm text-blue-900">
                                            <p className="font-semibold">Instructions:</p>
                                            <ul className="ml-2 list-inside list-disc space-y-1">
                                                <li>Enter your Employee ID in the field above</li>
                                                <li>Click "Record Attendance" to submit</li>
                                                <li>Your attendance will be recorded automatically</li>
                                                <li>Make sure you're within the attendance session hours</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card className="mt-6 shadow-xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <CheckCircle2 className="h-5 w-5 text-cfar-400" />
                                    Today's Attendance Records
                                </CardTitle>
                                <CardDescription>List of employees who have recorded attendance today</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchTodayAttendance} disabled={isLoadingAttendance} className="gap-2">
                                <RefreshCw className={`h-4 w-4 ${isLoadingAttendance ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingAttendance ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-cfar-400" />
                                <span className="ml-2 text-muted-foreground">Loading attendance records...</span>
                            </div>
                        ) : attendanceRecords.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <User className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-lg font-medium text-muted-foreground">No attendance records yet</p>
                                <p className="text-sm text-muted-foreground">Be the first to record your attendance!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">#</TableHead>
                                            <TableHead>Employee ID</TableHead>
                                            <TableHead>Employee Name</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Time In</TableHead>
                                            <TableHead>Time Out</TableHead>
                                            <TableHead>Session</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendanceRecords.map((record, index) => {
                                            const formatTime = (time: string | null) => {
                                                if (!time) return '-';
                                                const [hours, minutes, seconds] = time.split(':');
                                                const hour = parseInt(hours);
                                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                                const displayHour = hour % 12 || 12;
                                                return `${displayHour}:${minutes} ${ampm}`;
                                            };

                                            const getStatusBadge = (status: string) => {
                                                const statusLower = status.toLowerCase();
                                                if (statusLower === 'late' || statusLower === 'l') {
                                                    return (
                                                        <Badge variant="destructive" className="bg-orange-500">
                                                            Late
                                                        </Badge>
                                                    );
                                                } else if (statusLower === 'present' || statusLower === 'p') {
                                                    return (
                                                        <Badge variant="default" className="bg-green-500">
                                                            Present
                                                        </Badge>
                                                    );
                                                }
                                                return <Badge variant="secondary">{status}</Badge>;
                                            };

                                            return (
                                                <TableRow key={record.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell className="font-mono text-sm">{record.employeeid}</TableCell>
                                                    <TableCell className="font-medium">{record.employee_name}</TableCell>
                                                    <TableCell>{record.department || '-'}</TableCell>
                                                    <TableCell>{formatTime(record.time_in)}</TableCell>
                                                    <TableCell>{formatTime(record.time_out)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {record.session || '-'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(record.attendance_status)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showCameraModal} onOpenChange={handleModalOpenChange}>
                <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            QR Code Scanner
                        </DialogTitle>
                        <DialogDescription>Position your QR code within the camera frame</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="relative w-full">
                            <div
                                key={`scanner-container-${containerKey}`}
                                ref={scannerContainerRef}
                                id={scanId}
                                className={`overflow-hidden rounded-lg border-2 ${isScanning ? 'border-primary' : 'border-muted bg-muted/50'}`}
                                style={{ minHeight: '400px', width: '100%' }}
                            >
                                {!isScanning && !isProcessing && (
                                    <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center text-muted-foreground">
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
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
