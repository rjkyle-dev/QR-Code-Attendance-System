import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AppSidebarHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppSidebarHeader({ breadcrumbs = [] }: AppSidebarHeaderProps) {
    const { unreadNotificationCount = 0, notifications = [], employee } = usePage().props as any;
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState<number>(unreadNotificationCount);
    const [notificationList, setNotificationList] = useState<any[]>(notifications);

    useEffect(() => {
        if (!employee?.id) return;
        let stop = () => {};

        // Retry until Echo exists to avoid first-load race
        let tries = 0;
        const ensureEcho = (ready: () => void) => {
            if ((window as any).Echo) return ready();
            const tm = setInterval(() => {
                tries++;
                if ((window as any).Echo || tries > 20) {
                    clearInterval(tm);
                    ready();
                }
            }, 250);
        };

        ensureEcho(() => {
            const echo: any = (window as any).Echo;
            if (!echo) return;
            const channelName = `employee.${employee.id}`;
            const employeeChannel = echo.channel(channelName);
            employeeChannel.subscribed(() => console.log('[Bell] Subscribed to', channelName));
            employeeChannel.error((err: any) => console.error('[Bell] Channel error', err));
            employeeChannel.listen('.RequestStatusUpdated', (e: any) => {
                const notif = {
                    id: `${e.type}-${e.request_id}-${Date.now()}`,
                    type: e.type?.includes('leave') ? 'leave_request' : 'absence_request',
                    data: e,
                    read_at: null,
                    created_at: new Date().toISOString(),
                };
                setNotificationList((prev) => [notif, ...prev]);
                setUnreadCount((prev) => prev + 1);
            });
            stop = () => employeeChannel.stopListening('.RequestStatusUpdated');
        });

        return () => stop();
    }, [employee?.id]);

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            await router.post(
                '/employee/notifications/mark-read',
                { notification_id: notificationId },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Update local state immediately
                        setNotificationList((prev) => {
                            const next = prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n));
                            const unread = next.filter((n) => !n.read_at).length;
                            setUnreadCount(unread);
                            return next;
                        });
                    },
                },
            );
        } catch (error) {
            toast.error('Failed to mark notification as read');
            // Fallback: still update UI if it's a realtime-only item without DB id
            setNotificationList((prev) => {
                const next = prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n));
                const unread = next.filter((n) => !n.read_at).length;
                setUnreadCount(unread);
                return next;
            });
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            await router.post(
                '/employee/notifications/mark-all-read',
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('All notifications marked as read');
                        setNotificationList((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
                        setUnreadCount(0);
                    },
                },
            );
        } catch (error) {
            toast.error('Failed to mark all notifications as read');
            // Fallback UI update
            setNotificationList((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        }
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[sidebar-wrapper]:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                    {/* Notification Bell Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="hover:bg-sidebar-hover relative h-10 w-10 rounded-full p-0"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-12 right-0 z-[1000] w-80 rounded-lg border bg-white p-4 shadow-lg">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllNotificationsAsRead}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                            <div className="max-h-64 space-y-2 overflow-y-auto">
                                {notificationList && notificationList.length > 0 ? (
                                    notificationList.map((notification: any) => (
                                        <div
                                            key={notification.id}
                                            className={`cursor-pointer rounded-lg border p-3 ${
                                                notification.read_at ? 'bg-gray-50' : 'border-blue-200 bg-blue-50'
                                            }`}
                                            onClick={() => !notification.read_at && markNotificationAsRead(notification.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {notification.type === 'leave_request' && 'Leave Request Update'}
                                                        {notification.type === 'absence_request' && 'Absence Request Update'}
                                                        {notification.type === 'evaluation' && 'Evaluation Update'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-600">
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {!notification.read_at && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-gray-500">No notifications</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
