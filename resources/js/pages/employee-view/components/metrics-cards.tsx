import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, Star, TrendingUp } from 'lucide-react';

interface DashboardData {
    leaveBalance: number;
    absenceCount: number;
    evaluationRating: number;
    assignedArea: string;
    attendancePercentage: number;
    productivity: number;
    recentActivities: Array<{
        id: string;
        title: string;
        timeAgo: string;
        status: string;
    }>;
}

interface MetricsCardsProps {
    dashboardData: DashboardData;
}

export function MetricsCards({ dashboardData }: MetricsCardsProps) {
    const metrics = [
        {
            title: 'Leave Balance',
            value: `${dashboardData.leaveBalance} days`,
            description: 'Available leave days',
            icon: CalendarDays,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Attendance',
            value: `${dashboardData.attendancePercentage}%`,
            description: 'This month',
            icon: Clock,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Performance Rating',
            value: `${dashboardData.evaluationRating}/10`,
            description: 'Latest evaluation',
            icon: Star,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        {
            title: 'Productivity',
            value: `${dashboardData.productivity}%`,
            description: 'Overall performance',
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
                <Card key={metric.title} className="transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                        <div className={`rounded-full p-2 ${metric.bgColor}`}>
                            <metric.icon className={`h-4 w-4 ${metric.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
