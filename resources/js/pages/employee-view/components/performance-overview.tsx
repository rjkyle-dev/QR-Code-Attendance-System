import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DashboardData {
    leaveBalance: number;
    absenceBalance: number;
    absenceCount: number;
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

interface PerformanceOverviewProps {
    dashboardData: DashboardData;
}

export function PerformanceOverview({ dashboardData }: PerformanceOverviewProps) {
    const performanceMetrics = [
        {
            label: 'Attendance',
            value: dashboardData.attendancePercentage,
            max: 100,
            color: 'bg-green-500',
        },
        {
            label: 'Overall Productivity',
            value: dashboardData.productivity,
            max: 100,
            color: 'bg-blue-500',
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Your current performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {performanceMetrics.map((metric) => (
                    <div key={metric.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{metric.label}</span>
                            <span className="text-muted-foreground">{Math.round(metric.value)}%</span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                    </div>
                ))}

                <div className="mt-6 rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-2 text-sm font-medium">Assigned Area</h4>
                    <p className="text-sm text-muted-foreground">{dashboardData.assignedArea}</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-2 text-sm font-medium">Monthly Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Absence Balance:</span>
                            <span className="ml-2 font-medium">{dashboardData.absenceBalance} credits</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Leave Balance:</span>
                            <span className="ml-2 font-medium">{dashboardData.leaveBalance} credits</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
