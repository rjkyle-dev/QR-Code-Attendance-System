import { Briefcase, Building2, Clock, Mars, UserPlus, Users, Venus } from 'lucide-react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Employee } from '@/hooks/employees';
import { useCountUp } from '@/hooks/use-count-up';

interface Props {
    employee: Employee[];
    totalDepartment: number;
    totalEmployee: number;
    workStatusCounts?: {
        Regular: number;
        'Add Crew': number;
        Probationary: number;
        // Sessional: number;
    };
    isSupervisor?: boolean;
    roleContent?: {
        employeeLabel: string;
        departmentLabel: string;
        activeLabel: string;
        growthLabel: string;
    };
}

export function SectionCards({ employee, totalDepartment, totalEmployee, workStatusCounts, isSupervisor = false, roleContent }: Props) {
    const employeeCount = useCountUp(totalEmployee, 1000);
    const departmentCount = useCountUp(totalDepartment, 1000);

    // Calculate gender statistics for the Total Employee card
    const employeeArray = employee || [];
    const maleCount = employeeArray.filter((emp) => emp.gender?.toLowerCase() === 'male').length;
    const femaleCount = employeeArray.filter((emp) => emp.gender?.toLowerCase() === 'female').length;

    // Default labels
    const labels = roleContent || {
        employeeLabel: 'Total Employee',
        departmentLabel: 'Department',
        activeLabel: 'Active Accounts',
        growthLabel: 'Growth Rate',
    };

    // Get badge text based on role
    const getBadgeText = (type: string) => {
        if (isSupervisor) {
            switch (type) {
                case 'employee':
                    return 'Your';
                case 'department':
                    return 'Your';
                case 'active':
                    return 'Your';
                case 'growth':
                    return 'Your';
                default:
                    return 'Total';
            }
        }
        return type === 'growth' ? 'Growth' : 'Total';
    };

    return (
        <div className="grid grid-cols-1 gap-4 overflow-hidden px-4 *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-2 @2xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
            {/* Total Employee Card */}
            <Card className="@container/card overflow-hidden border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <Users className="size-6 text-emerald-600" />
                        </div>
                        {/* <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            {getBadgeText('employee')}
                        </Badge> */}
                    </div>
                    <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.employeeLabel}</CardDescription>
                    <CardTitle className="font-bold text-emerald-800 tabular-nums @[250px]/card:text-[3rem]">
                        {employeeCount.toLocaleString()}
                    </CardTitle>

                    {/* Gender breakdown */}
                    <div className="mt-10 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-blue-100 p-1.5">
                                <Mars className="size-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-blue-700">{maleCount} Male</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-pink-100 p-1.5">
                                <Venus className="size-4 text-pink-600" />
                            </div>
                            <span className="text-sm font-medium text-pink-700">{femaleCount} Female</span>
                        </div>
                    </div>
                </CardHeader>
                {/* <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-green-600">
                        <Users className="size-4" />
                        {isSupervisor ? 'Your supervised employees' : 'Total unique employees'}
                    </div>
                    <div className="text-green-500">{isSupervisor ? 'Your workforce' : 'Active workforce'}</div>
                </CardFooter> */}
            </Card>

            {/* Department Card */}
            <Card className="@container/card overflow-hidden border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <Building2 className="size-6 text-emerald-600" />
                        </div>
                        {/* <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            {getBadgeText('department')}
                        </Badge> */}
                    </div>
                    <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.departmentLabel}</CardDescription>
                    <CardTitle className="font-bold text-emerald-800 tabular-nums @[250px]/card:text-[3rem]">
                        {departmentCount.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                {/* <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <Building2 className="size-4" />
                        {isSupervisor ? 'Your supervised departments' : 'Total unique departments'}
                    </div>
                    <div className="text-emerald-500">{isSupervisor ? 'Your areas of responsibility' : 'Organizational structure'}</div>
                </CardFooter> */}
            </Card>

            {/* Work Status Card */}
            <Card className="@container/card overflow-hidden border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <Briefcase className="size-6 text-emerald-600" />
                        </div>
                        {/* <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            {isSupervisor ? 'Your' : 'Total'}
                        </Badge> */}
                    </div>
                    <CardDescription className="mt-3 font-semibold text-emerald-700">Work Status Distribution</CardDescription>

                    {/* Work Status Breakdown */}
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-green-100 p-1.5">
                                    <Briefcase className="size-4 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-green-700">Regular</span>
                            </div>
                            <span className="text-lg font-bold text-green-800">{workStatusCounts?.Regular || 0}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-blue-100 p-1.5">
                                    <UserPlus className="size-4 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-blue-700">Add Crew</span>
                            </div>
                            <span className="text-lg font-bold text-blue-800">{workStatusCounts?.['Add Crew'] || 0}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-amber-100 p-1.5">
                                    <Clock className="size-4 text-amber-600" />
                                </div>
                                <span className="text-sm font-medium text-amber-700">Probationary</span>
                            </div>
                            <span className="text-lg font-bold text-amber-800">{workStatusCounts?.Probationary || 0}</span>
                        </div>

                        {/* <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-orange-100 p-1.5">
                                    <Calendar className="size-4 text-orange-600" />
                                </div>
                                <span className="text-sm font-medium text-orange-700">Sessional</span>
                            </div>
                            <span className="text-lg font-bold text-orange-800">{workStatusCounts?.Sessional || 0}</span>
                        </div> */}
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
