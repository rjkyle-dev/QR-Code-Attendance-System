import { Building2, Clock, UserCheck, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCountUp } from '@/hooks/use-count-up';

interface SectionCardsProps {
    // Supervisor-specific data
    isSupervisor?: boolean;
    totalEmployee?: number;
    totalDepartment?: number;
    activeAccounts?: number;
    pendingCount?: number;
    // Role-based content labels
    roleContent?: {
        employeeLabel: string;
        departmentLabel: string;
        activeLabel: string;
        pendingLabel: string;
    };
}

export function SectionCards({
    isSupervisor = false,
    totalEmployee = 300,
    totalDepartment = 7,
    activeAccounts = 0,
    pendingCount = 0,
    roleContent,
}: SectionCardsProps) {
    const employeeCount = useCountUp(totalEmployee, 1000);
    const departmentCount = useCountUp(totalDepartment, 1000);
    const activeCount = useCountUp(activeAccounts, 1000);
    const pendingCountUp = useCountUp(pendingCount, 1000);

    // Default labels
    const labels = roleContent || {
        employeeLabel: 'Total Employee',
        departmentLabel: 'Department',
        activeLabel: 'Active Accounts',
        pendingLabel: 'Pendings',
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
                case 'pending':
                    return 'Your';
                default:
                    return 'Total';
            }
        }
        return type === 'pending' ? 'Pending' : 'Total';
    };

    return (
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-4 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
            {/* Total Employee Card */}
            <Card className="@container/card border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-green-100 p-2">
                            <Users className="size-6 text-green-600" />
                        </div>
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                            {getBadgeText('employee')}
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-green-700">{labels.employeeLabel}</CardDescription>
                    <CardTitle className="text-3xl font-bold text-green-800 tabular-nums @[250px]/card:text-4xl">{employeeCount}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-green-600">
                        <Users className="size-4" />
                        {isSupervisor ? 'Your supervised employees' : 'Total unique employees'}
                    </div>
                    <div className="text-green-500">{isSupervisor ? 'Your workforce' : 'Active workforce'}</div>
                </CardFooter>
            </Card>

            {/* Department Card */}
            <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <Building2 className="size-6 text-emerald-600" />
                        </div>
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            {getBadgeText('department')}
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.departmentLabel}</CardDescription>
                    <CardTitle className="text-3xl font-bold text-emerald-800 tabular-nums @[250px]/card:text-4xl">{departmentCount}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <Building2 className="size-4" />
                        {isSupervisor ? 'Your supervised departments' : 'Total unique departments'}
                    </div>
                    <div className="text-emerald-500">{isSupervisor ? 'Your areas of responsibility' : 'Organizational structure'}</div>
                </CardFooter>
            </Card>

            {/* Active Accounts Card */}
            <Card className="@container/card border-l-4 border-amber-500 bg-gradient-to-br from-amber-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-amber-100 p-2">
                            <UserCheck className="size-6 text-amber-600" />
                        </div>
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                            {getBadgeText('active')}
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-amber-700">{labels.activeLabel}</CardDescription>
                    <CardTitle className="text-3xl font-bold text-amber-800 tabular-nums @[250px]/card:text-4xl">{activeCount}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-amber-600">
                        <UserCheck className="size-4" />
                        {isSupervisor ? 'Your active team members' : 'Strong user retention'}
                    </div>
                    <div className="text-amber-500">{isSupervisor ? 'Your engaged workforce' : 'Engagement exceed targets'}</div>
                </CardFooter>
            </Card>

            {/* Pendings Card */}
            <Card className="@container/card border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Clock className="size-6 text-blue-600" />
                        </div>
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                            {getBadgeText('pending')}
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-blue-700">{labels.pendingLabel}</CardDescription>
                    <CardTitle className="text-3xl font-bold text-blue-800 tabular-nums @[250px]/card:text-4xl">{pendingCountUp}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-blue-600">
                        <Clock className="size-4" />
                        {isSupervisor ? 'Your pending evaluations' : 'Steady performance'}
                    </div>
                    <div className="text-blue-500">{isSupervisor ? 'Requires your review' : 'Meets growth projections'}</div>
                </CardFooter>
            </Card>
        </div>
    );
}
