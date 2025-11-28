import { CheckCircle, Clock, TrendingUpIcon, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { useCountUp } from '@/hooks/use-count-up';
import { Attendance } from '../types/attendance';

interface SectionCardsProps {
    attendanceData: Attendance[];
    totalEmployee?: number;
    prevTotalEmployee?: number;
    totalDepartment?: number;
    prevTotalDepartment?: number;
    isSupervisor?: boolean;
    roleContent?: {
        attendanceLabel: string;
        presentLabel: string;
        lateLabel: string;
        leaveLabel: string;
    };
}

export function SectionCards({
    attendanceData = [],
    totalEmployee = 0,
    prevTotalEmployee = 0,
    totalDepartment = 0,
    prevTotalDepartment = 0,
    isSupervisor = false,
    roleContent,
}: SectionCardsProps) {
    // Function to count attendance for current day
    const getCurrentDayAttendance = () => {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

        // Debug: Log the data to see what we're working with
        console.log('Today:', todayString);
        console.log('Attendance Data:', attendanceData);
        console.log('Total Employees:', totalEmployee);

        // First, let's see what data we have
        console.log('Raw attendance data:', attendanceData);
        console.log('Total records:', attendanceData.length);

        // Check if we have any data at all
        if (attendanceData.length === 0) {
            console.log('No attendance data available');
            return {
                totalAttendance: 0,
                present: 0,
                late: 0,
                excuse: 0,
                leave: 0,
                absent: totalEmployee,
            };
        }

        const todayAttendance = attendanceData.filter((attendance) => {
            // Handle different date formats that might come from Laravel
            let attendanceDate = attendance.attendanceDate;

            console.log('Processing attendance:', attendance.id, 'Date:', attendanceDate, 'Type:', typeof attendanceDate);

            // If it's a Date object, convert to string
            if (attendanceDate && typeof attendanceDate === 'object' && 'toISOString' in attendanceDate) {
                attendanceDate = (attendanceDate as Date).toISOString().split('T')[0];
                console.log('Converted from Date object to:', attendanceDate);
            }

            // If it's already a string, check if it matches today
            if (typeof attendanceDate === 'string') {
                // Remove time part if it exists
                const dateOnly = attendanceDate.split('T')[0];
                console.log('Date comparison:', dateOnly, '===', todayString, 'Result:', dateOnly === todayString);
                return dateOnly === todayString;
            }

            console.log('No valid date found for attendance:', attendance.id);
            return false;
        });

        console.log('Today Attendance:', todayAttendance);

        // If no today's data, show all data for debugging
        if (todayAttendance.length === 0) {
            console.log('No today attendance found, showing all data for debugging');
            const allAttendance = attendanceData;
            const totalAttendance = allAttendance.length;
            const present = allAttendance.filter((att) => att.attendanceStatus === 'Present').length;
            const late = allAttendance.filter((att) => att.attendanceStatus === 'Late').length;
            const excuse = allAttendance.filter((att) => att.attendanceStatus === 'Excuse').length;
            const leave = allAttendance.filter((att) => att.attendanceStatus === 'Leave').length;

            return {
                totalAttendance,
                present,
                late,
                excuse,
                leave,
                absent: Math.max(0, totalEmployee - totalAttendance - excuse - leave),
            };
        }

        const totalAttendance = todayAttendance.length;
        const present = todayAttendance.filter((att) => att.attendanceStatus === 'Present').length;
        const late = todayAttendance.filter((att) => att.attendanceStatus === 'Late').length;
        const excuse = todayAttendance.filter((att) => att.attendanceStatus === 'Excuse').length;
        const leave = todayAttendance.filter((att) => att.attendanceStatus === 'Leave').length;
        const absent = totalEmployee - totalAttendance - excuse - leave;

        return {
            totalAttendance,
            present,
            late,
            excuse,
            leave,
            absent: Math.max(0, absent), // Ensure we don't show negative numbers
        };
    };

    const attendanceCounts = getCurrentDayAttendance();

    // Use count up animation for the numbers
    const totalAttendanceCount = useCountUp(attendanceCounts.totalAttendance, 1000);
    const presentCount = useCountUp(attendanceCounts.present, 1000);
    const lateCount = useCountUp(attendanceCounts.late, 1000);
    const leaveCount = useCountUp(attendanceCounts.excuse + attendanceCounts.leave, 1000);

    // Default labels
    const labels = roleContent || {
        attendanceLabel: 'Total Attendance',
        presentLabel: 'Present',
        lateLabel: 'Late Arrivals',
        leaveLabel: 'On Leave',
    };

    // Get badge text based on role
    const getBadgeText = (type: string) => {
        if (isSupervisor) {
            switch (type) {
                case 'attendance':
                    return 'Your';
                case 'present':
                    return 'Your';
                case 'late':
                    return 'Your';
                case 'leave':
                    return 'Your';
                default:
                    return 'Total';
            }
        }
        return type === 'leave' ? 'On Leave' : 'Today';
    };

    return (
        <>
            {/* Debug Information - Remove this after fixing */}
            {/* <div className="mb-4 rounded-lg bg-gray-100 p-4">
                <h3 className="mb-2 font-bold">Debug Info:</h3>
                <p>Total Records: {attendanceData.length}</p>
                <p>Total Employees: {totalEmployee}</p>
                <p>Today's Date: {new Date().toISOString().split('T')[0]}</p>
                <p>Sample Attendance Date: {attendanceData[0]?.attendanceDate || 'No data'}</p>
                <p>Sample Status: {attendanceData[0]?.attendanceStatus || 'No data'}</p>
            </div> */}

            <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-4 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
                {/* Total Attendance Card */}
                <Card className="@container/card border-l-4 border-emerald-400 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                    <CardHeader className="relative">
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-emerald-100 p-2">
                                <Users className="size-6 text-emerald-600" />
                            </div>
                            {/* <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                {getBadgeText('attendance')}
                            </Badge> */}
                        </div>
                        <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.attendanceLabel}</CardDescription>
                        <CardTitle className="font-bold text-emerald-800 tabular-nums @[250px]/card:text-[3rem]">
                            {totalAttendanceCount.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                            <TrendingUpIcon className="size-4" />
                            {totalEmployee > 0 ? `${((attendanceCounts.totalAttendance / totalEmployee) * 100).toFixed(1)}%` : '0%'} of{' '}
                            {isSupervisor ? 'your' : 'total'} employees
                        </div>
                        {/* <div className="text-green-500">{isSupervisor ? 'Your team attendance today' : 'Active attendance today'}</div> */}
                    </CardFooter>
                </Card>

                {/* Present Card */}
                <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                    <CardHeader className="relative">
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-emerald-100 p-2">
                                <CheckCircle className="size-6 text-emerald-600" />
                            </div>
                            {/* <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                {getBadgeText('present')}
                            </Badge> */}
                        </div>
                        <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.presentLabel}</CardDescription>
                        <CardTitle className="font-bold text-emerald-800 tabular-nums @[250px]/card:text-[3rem]">
                            {presentCount.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                            <CheckCircle className="size-4" />
                            {attendanceCounts.totalAttendance > 0
                                ? `${((attendanceCounts.present / attendanceCounts.totalAttendance) * 100).toFixed(1)}%`
                                : '0%'}{' '}
                            of {isSupervisor ? 'your' : 'attendees'}
                        </div>
                        {/* <div className="text-emerald-500">{isSupervisor ? 'Your team on time today' : 'Employees on time today'}</div> */}
                    </CardFooter>
                </Card>

                {/* Late Card */}
                <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                    <CardHeader className="relative">
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-emerald-100 p-2">
                                <Clock className="size-6 text-emerald-600" />
                            </div>
                            {/* <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                                {getBadgeText('late')}
                            </Badge> */}
                        </div>
                        <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.lateLabel}</CardDescription>
                        <CardTitle className="font-bold text-emerald-800 tabular-nums @[250px]/card:text-[3rem]">
                            {lateCount.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                            <Clock className="size-4" />
                            {attendanceCounts.totalAttendance > 0
                                ? `${((attendanceCounts.late / attendanceCounts.totalAttendance) * 100).toFixed(1)}%`
                                : '0%'}{' '}
                            of {isSupervisor ? 'your' : 'attendees'}
                        </div>
                        {/* <div className="text-amber-500">{isSupervisor ? 'Your team arrived late' : 'Employees arrived late'}</div> */}
                    </CardFooter>
                </Card>

                {/* On Leave Card */}
                <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                    <CardHeader className="relative">
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-emerald-100 p-2">
                                <Clock className="size-6 text-emerald-600" />
                            </div>
                            {/* <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                {getBadgeText('leave')}
                            </Badge> */}
                        </div>
                        <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.leaveLabel}</CardDescription>
                        <CardTitle className="font-bold text-emerald-800 tabular-nums @[250px]/card:text-[3rem]">
                            {leaveCount.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                            <Clock className="size-4" />
                            {totalEmployee > 0
                                ? `${(((attendanceCounts.excuse + attendanceCounts.leave) / totalEmployee) * 100).toFixed(1)}%`
                                : '0%'}{' '}
                            of {isSupervisor ? 'your' : 'total'} employees
                        </div>
                        {/* <div className="text-blue-500">{isSupervisor ? 'Your team on leave or excuse' : 'Employees on leave or excuse'}</div> */}
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
