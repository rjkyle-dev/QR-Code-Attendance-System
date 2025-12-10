import { BackButton } from '@/components/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ArrowDown, ArrowUp, Camera, CheckCircle2, Loader2, RefreshCw, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ManualEntryModal } from './qr-code/ManualEntryModal';
import { QRCodeScannerModal } from './qr-code/QRCodeScannerModal';

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
    const [showManualModal, setShowManualModal] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
    const [previousStats, setPreviousStats] = useState<{
        total: number;
        late: number;
        absence: number;
        onLeave: number;
    } | null>(null);

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

    // Calculate statistics from attendance records
    const stats = useMemo(() => {
        const total = attendanceRecords.length;
        const late = attendanceRecords.filter(
            (record) => {
                const status = record.attendance_status?.toLowerCase() || '';
                return status === 'late' || status === 'l';
            }
        ).length;
        const onLeave = attendanceRecords.filter(
            (record) => {
                const status = record.attendance_status?.toLowerCase() || '';
                return status === 'leave' || status === 'on leave' || status === 'onleave';
            }
        ).length;
        // Absence would typically be employees who didn't check in, but we don't have that data
        // For now, we'll set it to 0 or you can fetch it from a separate endpoint
        const absence = 0;

        return { total, late, absence, onLeave };
    }, [attendanceRecords]);

    // Calculate percentage changes (mock data for now - you can fetch previous day's data)
    const calculatePercentageChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const percentageChanges = useMemo(() => {
        if (!previousStats) {
            // Mock percentage changes if no previous data
            return {
                total: 21.5,
                late: 3.0,
                absence: -7.0,
                onLeave: -3.0,
            };
        }
        return {
            total: calculatePercentageChange(stats.total, previousStats.total),
            late: calculatePercentageChange(stats.late, previousStats.late),
            absence: calculatePercentageChange(stats.absence, previousStats.absence),
            onLeave: calculatePercentageChange(stats.onLeave, previousStats.onLeave),
        };
    }, [stats, previousStats]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
            <Head title="Employee Attendance" />

            <div className="border-b bg-white shadow-sm">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <BackButton href="/" label="Back to Home" variant="ghost" className="text-gray-700 hover:text-gray-900" />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-cfar-400">AGB Enterprises</h1>
                        <p className="text-sm text-gray-600">Attendance System</p>
                    </div>
                    <div className="w-32"></div>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => setShowCameraModal(true)} size="lg" className="gap-2">
                        <Camera className="h-5 w-5" />
                        QR Code Scanner
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Attendance Card */}
                    <Card className="border-l-4 border-teal-500 bg-gradient-to-br from-teal-50 to-white shadow-lg">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm font-medium text-gray-600">Total Attendance</CardDescription>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-3xl font-bold text-gray-900">{stats.total}</CardTitle>
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 border-0 ${
                                        percentageChanges.total >= 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {percentageChanges.total >= 0 ? (
                                        <ArrowUp className="h-3 w-3" />
                                    ) : (
                                        <ArrowDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(percentageChanges.total).toFixed(1)}%
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Late Card */}
                    <Card className="border-l-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-white shadow-lg">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm font-medium text-gray-600">Late</CardDescription>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-3xl font-bold text-gray-900">{stats.late}</CardTitle>
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 border-0 ${
                                        percentageChanges.late >= 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {percentageChanges.late >= 0 ? (
                                        <ArrowUp className="h-3 w-3" />
                                    ) : (
                                        <ArrowDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(percentageChanges.late).toFixed(1)}%
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Absence Card */}
                    <Card className="border-l-4 border-pink-500 bg-gradient-to-br from-pink-50 to-white shadow-lg">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm font-medium text-gray-600">Absence</CardDescription>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-3xl font-bold text-gray-900">{stats.absence}</CardTitle>
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 border-0 ${
                                        percentageChanges.absence >= 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {percentageChanges.absence >= 0 ? (
                                        <ArrowUp className="h-3 w-3" />
                                    ) : (
                                        <ArrowDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(percentageChanges.absence).toFixed(1)}%
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* On Leave Card */}
                    <Card className="border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm font-medium text-gray-600">On Leave</CardDescription>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-3xl font-bold text-gray-900">{stats.onLeave}</CardTitle>
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 border-0 ${
                                        percentageChanges.onLeave >= 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {percentageChanges.onLeave >= 0 ? (
                                        <ArrowUp className="h-3 w-3" />
                                    ) : (
                                        <ArrowDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(percentageChanges.onLeave).toFixed(1)}%
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

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

            <QRCodeScannerModal open={showCameraModal} onOpenChange={setShowCameraModal} onAttendanceRecorded={fetchTodayAttendance} />
            <ManualEntryModal open={showManualModal} onOpenChange={setShowManualModal} onAttendanceRecorded={fetchTodayAttendance} />
        </div>
    );
}
