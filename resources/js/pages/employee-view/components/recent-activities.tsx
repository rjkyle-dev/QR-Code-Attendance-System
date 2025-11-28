import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, CalendarSync, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Activity {
    id: string;
    title: string;
    timeAgo: string;
    status: string;
    type?: string;
}

interface RecentActivitiesProps {
    activities: Activity[];
    employeeId?: number;
}

export function RecentActivities({ activities, employeeId }: RecentActivitiesProps) {
    const [localActivities, setLocalActivities] = useState<Activity[]>(activities);

    // Update local state when server data changes
    useEffect(() => {
        setLocalActivities(activities);
    }, [activities]);

    // Set up real-time updates using Echo (private channel per employee)
    useEffect(() => {
        const echo = (window as any).Echo;
        if (!echo || !employeeId) return;

        const channelName = `employee.${employeeId}`;
        // ReturnWorkStatusUpdated broadcasts on PrivateChannel('employee.{id}') with event name 'RequestStatusUpdated'
        const employeeChannel = echo.private(channelName);

        const handleStatusUpdated = (e: any) => {
            console.log('Received RequestStatusUpdated event (recent activities):', e);
            if (e?.type !== 'return_work_status') return;

            setLocalActivities((prev) => {
                const targetId = `return_work_${e.request_id}`;
                const idx = prev.findIndex((a) => a.id === targetId);
                if (idx >= 0) {
                    // Update existing activity
                    return prev.map((activity) =>
                        activity.id === targetId
                            ? {
                                  ...activity,
                                  status: String(e.status).toLowerCase(),
                                  title: `Return to Work request ${e.status}`,
                                  type: 'return_work',
                              }
                            : activity,
                    );
                }

                // Insert new activity if not present yet
                const newActivity: Activity = {
                    id: targetId,
                    title: `Return to Work request ${e.status}`,
                    timeAgo: 'just now',
                    status: String(e.status).toLowerCase(),
                    type: 'return_work',
                };
                return [newActivity, ...prev];
            });

            const normalized = String(e.status).toLowerCase();
            const statusText = normalized === 'approved' || normalized === 'rejected' ? normalized : normalized;
            toast.success(`Your return to work request has been ${statusText}!`);
        };

        // Listen on both employee private channel and public fallback notifications
        employeeChannel.listen('.RequestStatusUpdated', handleStatusUpdated);

        const notifications = echo.channel('notifications');
        notifications.listen('.RequestStatusUpdated', (e: any) => {
            // Only handle if this event is for this employee
            if (!e || e?.employee_id !== employeeId) return;
            handleStatusUpdated(e);
        });

        return () => {
            employeeChannel.stopListening('.RequestStatusUpdated');
            notifications.stopListening('.RequestStatusUpdated');
        };
    }, [employeeId]);
    const getStatusIcon = (status: string, type?: string) => {
        const normalizedStatus = status.toLowerCase();

        // Use specific icon for return work activities
        if (type === 'return_work') {
            switch (normalizedStatus) {
                case 'approved':
                    return <CalendarSync className="h-4 w-4 text-green-600" />;
                case 'pending':
                    return <CalendarSync className="h-4 w-4 text-yellow-600" />;
                case 'rejected':
                    return <CalendarSync className="h-4 w-4 text-red-600" />;
                default:
                    return <CalendarSync className="h-4 w-4 text-gray-600" />;
            }
        }

        // Default icons for other activity types
        switch (normalizedStatus) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-blue-600" />;
            default:
                return <CalendarDays className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        switch (normalizedStatus) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        switch (normalizedStatus) {
            case 'approved':
                return 'approved';
            case 'pending':
                return 'pending';
            case 'rejected':
                return 'rejected';
            case 'completed':
                return 'completed';
            default:
                return status.toLowerCase();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your latest requests and updates</CardDescription>
            </CardHeader>
            <CardContent>
                {localActivities.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <CalendarDays className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <p>No recent activities to display</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {localActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                <div className="flex-shrink-0">{getStatusIcon(activity.status, activity.type)}</div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{activity.title}</p>
                                    <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                                </div>
                                <Badge variant="secondary" className={`text-xs ${getStatusColor(activity.status)}`}>
                                    {getStatusText(activity.status)}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
