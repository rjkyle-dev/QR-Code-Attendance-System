import { Badge } from '@/components/ui/badge';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCountUp } from '@/hooks/use-count-up';
import { Building2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    totalEmployee: number;
    totalDepartment: number;
    totalLeave: number;
    pendingLeave: number;
    isSupervisor?: boolean;
    roleContent?: {
        employeeLabel: string;
        departmentLabel: string;
        leaveLabel: string;
        pendingLabel: string;
    };
}

export function SectionCards({ totalEmployee, totalDepartment, totalLeave, pendingLeave, isSupervisor = false, roleContent }: Props) {
    const employeeCount = useCountUp(totalEmployee, 1000);
    const departmentCount = useCountUp(totalDepartment, 1000);
    const leaveCount = useCountUp(totalLeave, 1000);
    const pendingCount = useCountUp(pendingLeave, 1000);

    // Today's attendance (present includes late)
    const [todayAttendance, setTodayAttendance] = useState<{ present: number; late: number; absent: number }>({ present: 0, late: 0, absent: 0 });
    const presentTodayCount = useCountUp(todayAttendance.present + todayAttendance.late, 1000);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        async function loadTodayAttendance() {
            try {
                const res = await fetch('/api/attendance/all', { signal: controller.signal });
                if (!res.ok) return;
                const items: Array<{ attendanceDate: string; attendanceStatus: string }> = await res.json();
                const todayKey = new Date().toISOString().slice(0, 10);

                console.log('Today key:', todayKey);
                console.log('Total items:', items.length);
                console.log('Sample items:', items.slice(0, 3));

                let present = 0;
                let late = 0;
                for (const it of items) {
                    const dateKey = new Date(it.attendanceDate).toISOString().slice(0, 10);
                    if (dateKey !== todayKey) continue;
                    const status = (it.attendanceStatus || '').toLowerCase();
                    console.log('Processing item:', { dateKey, status, originalStatus: it.attendanceStatus });
                    // Handle different status formats from database
                    if (status === 'present' || status === 'attendance complete' || status === 'complete') {
                        present += 1;
                    } else if (status === 'late') {
                        late += 1;
                    } else if (status === 'absent') {
                        // Absent is handled separately in calculation
                    }
                }
                const absent = Math.max(0, totalEmployee - (present + late));
                console.log('Final counts:', { present, late, absent, totalEmployee });
                if (isMounted) setTodayAttendance({ present, late, absent });
            } catch (e) {
                // Only log errors that aren't intentional aborts
                if (e instanceof Error && e.name !== 'AbortError') {
                    console.error('Error loading attendance:', e);
                }
            }
        }
        loadTodayAttendance();
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [totalEmployee]);

    // Default labels
    const labels = roleContent || {
        employeeLabel: 'Total Employees',
        departmentLabel: 'Departments',
        leaveLabel: 'Leave Requests',
        pendingLabel: 'Pending Leaves',
    };

    // Get badge text based on role
    const getBadgeText = (type: string) => {
        if (isSupervisor) {
            switch (type) {
                case 'employee':
                    return 'Your';
                case 'department':
                    return 'Your';
                case 'leave':
                    return 'Your';
                case 'pending':
                    return 'Your';
                default:
                    return 'Total';
            }
        }
        return type === 'pending' ? 'Pending' : 'Total';
    };

    return (
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-3 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
            {/* Total Employees Card */}
            <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <Users className="size-6 text-emerald-600" />
                        </div>
                        {/* <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            {getBadgeText('employee')}
                        </Badge> */}
                    </div>
                    {/* <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.employeeLabel}</CardDescription> */}
                    <CardTitle className="text-3xl font-bold text-emerald-800 tabular-nums @[250px]/card:text-4xl">
                        {employeeCount.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    {/* <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <Users className="size-4" />
                        {isSupervisor ? 'Your supervised employees' : 'Total unique employees'}
                    </div>
                    <div className="text-emerald-500">{isSupervisor ? 'Your workforce' : 'Active workforce'}</div> */}
                    <div className="text-lg text-emerald-500">{labels.employeeLabel}</div>
                    {/* {labels.employeeLabel} */}
                </CardFooter>
            </Card>

            {/* Departments Card */}
            <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <Building2 className="size-6 text-emerald-600" />
                        </div>
                        {/* <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            {getBadgeText('department')}
                        </Badge> */}
                    </div>
                    {/* <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.departmentLabel}</CardDescription> */}
                    <CardTitle className="text-3xl font-bold text-emerald-800 tabular-nums @[250px]/card:text-4xl">
                        {departmentCount.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    {/* <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <Building2 className="size-4" />
                        {isSupervisor ? 'Your supervised departments' : 'Total unique departments'}
                    </div> */}
                    {/* <div className="text-emerald-500">{isSupervisor ? 'Your areas of responsibility' : 'Organizational structure'}</div> */}
                    <div className="text-lg text-emerald-500">{labels.departmentLabel}</div>
                </CardFooter>
            </Card>

            {/* Leave Requests Card */}
            <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <Users className="size-6 text-emerald-600" />
                        </div>
                        {/* <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            Today
                        </Badge> */}
                    </div>
                    <CardTitle className="text-3xl font-bold text-emerald-800 tabular-nums @[250px]/card:text-4xl">
                        {presentTodayCount.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Late: {todayAttendance.late.toLocaleString()} • Absent: {todayAttendance.absent.toLocaleString()}
                    </div>
                    <div className="text-lg text-emerald-500">Today's Attendance</div>
                </CardFooter>
            </Card>

            {/* <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <FileText className="size-6 text-emerald-600" />
                        </div>
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            {getBadgeText('leave')}
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.leaveLabel}</CardDescription>
                    <CardTitle className="text-3xl font-bold text-emerald-800 tabular-nums @[250px]/card:text-4xl">
                        {leaveCount.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <FileText className="size-4" />
                        {isSupervisor ? 'Your department leave requests' : 'All leave requests'}
                    </div>
                    <div className="text-emerald-500">{isSupervisor ? 'Your team applications' : 'Submitted applications'}</div>
                    <div className="text-lg text-emerald-500">{labels.leaveLabel}</div>
                </CardFooter>
            </Card> */}

            {/* Pending Leaves Card */}
            {/* <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <Clock className="size-6 text-emerald-600" />
                        </div>
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            {getBadgeText('pending')}
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.pendingLabel}</CardDescription>
                    <CardTitle className="text-3xl font-bold text-emerald-800 tabular-nums @[250px]/card:text-4xl">
                        {pendingCount.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <Clock className="size-4" />
                        {isSupervisor ? 'Your pending approvals' : 'Awaiting approval'}
                    </div>
                    <div className="text-emerald-500">{isSupervisor ? 'Requires your review' : 'Pending review'}</div>
                    <div className="text-lg text-emerald-500">{labels.pendingLabel}</div>
                </CardFooter>
            </Card> */}
        </div>
    );
}
