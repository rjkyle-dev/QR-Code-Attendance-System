import { Building2, TrendingUp, UserCheck, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { useCountUp } from '@/hooks/use-count-up';

interface SectionCardsProps {
    // Supervisor-specific data
    isSupervisor?: boolean;
    totalEmployee?: number;
    totalDepartment?: number;
    activeAccounts?: number;
    growthRate?: number;
    // Role-based content labels
    roleContent?: {
        employeeLabel: string;
        departmentLabel: string;
        activeLabel: string;
        growthLabel: string;
    };
}

export function SectionCards({
    isSupervisor = false,
    totalEmployee = 0,
    totalDepartment = 0,
    activeAccounts = 0,
    growthRate = 0,
    roleContent,
}: SectionCardsProps) {
    const employeeCount = useCountUp(totalEmployee, 1000);
    const departmentCount = useCountUp(totalDepartment, 1000);
    const activeCount = useCountUp(activeAccounts, 1000);
    const growthCount = useCountUp(growthRate, 100);

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
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-4 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
            {/* Total Employee Card */}
            <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <Users className="size-6 text-emerald-600" />
                        </div>
                        {/* <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                            {getBadgeText('employee')}
                        </Badge> */}
                    </div>
                    <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.employeeLabel}</CardDescription>
                    <CardTitle className="font-bold text-emerald-800 tabular-nums @[250px]/card:text-[3rem]">{employeeCount}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <Users className="size-4" />
                        {isSupervisor ? 'Your supervised employees' : 'Total unique employees'}
                    </div>
                    {/* <div className="text-green-500">{isSupervisor ? 'Your workforce' : 'Active workforce'}</div> */}
                </CardFooter>
            </Card>

            {/* Department Card */}
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
                    <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.departmentLabel}</CardDescription>
                    <CardTitle className="font-bold text-emerald-800 tabular-nums @[250px]/card:text-[3rem]">{departmentCount}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <Building2 className="size-4" />
                        {isSupervisor ? 'Your supervised departments' : 'Total unique departments'}
                    </div>
                    {/* <div className="text-green-500">{isSupervisor ? 'Your areas of responsibility' : 'Organizational structure'}</div> */}
                </CardFooter>
            </Card>

            {/* Active Accounts Card */}
            <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <UserCheck className="size-6 text-emerald-600" />
                        </div>
                        {/* <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                            {getBadgeText('active')}
                        </Badge> */}
                    </div>
                    <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.activeLabel}</CardDescription>
                    <CardTitle className="font-bold text-emerald-800 tabular-nums @[250px]/card:text-[3rem]">{activeCount.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <UserCheck className="size-4" />
                        {isSupervisor ? 'Your active team members' : 'Strong user retention'}
                    </div>
                    {/* <div className="text-amber-500">{isSupervisor ? 'Your engaged workforce' : 'Engagement exceed targets'}</div> */}
                </CardFooter>
            </Card>

            {/* Growth Rate Card */}
            <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <TrendingUp className="size-6 text-emerald-600" />
                        </div>
                        {/* <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                            {getBadgeText('growth')}
                        </Badge> */}
                    </div>
                    <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.growthLabel}</CardDescription>
                    <CardTitle className="font-bold text-emerald-800 tabular-nums @[250px]/card:text-[3rem]">{growthCount}%</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <TrendingUp className="size-4" />
                        {isSupervisor ? 'Your team performance' : 'Steady performance'}
                    </div>
                    {/* <div className="text-blue-500">{isSupervisor ? 'Your growth metrics' : 'Meets growth projections'}</div> */}
                </CardFooter>
            </Card>
        </div>
    );
}
