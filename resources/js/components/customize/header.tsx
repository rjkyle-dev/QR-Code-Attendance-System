import { BellNotification } from '@/components/customize/bell-notification';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

import { AdminProfileDropdown } from '@/components/customize/admin-profile-dropdown';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import React from 'react';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
    fixed?: boolean;
    ref?: React.Ref<HTMLElement>;
}

export const Header = ({ className, fixed, children, ...props }: HeaderProps) => {
    const [offset, setOffset] = React.useState(0);
    const { notifications = [], unreadNotificationCount = 0, auth } = usePage<SharedData>().props;
    const [unreadCount, setUnreadCount] = React.useState(unreadNotificationCount);
    const [notificationList, setNotificationList] = React.useState(notifications);

    React.useEffect(() => {
        setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    }, []);
    React.useEffect(() => {
        const onScroll = () => {
            setOffset(document.body.scrollTop || document.documentElement.scrollTop);
        };

        // Add scroll listener to the body
        document.addEventListener('scroll', onScroll, { passive: true });

        // Clean up the event listener on unmount
        return () => document.removeEventListener('scroll', onScroll);
    }, []);
    React.useEffect(() => {
        const onResize = () => {
            setOffset(document.body.scrollTop || document.documentElement.scrollTop);
        };

        // Add resize listener to the body
        window.addEventListener('resize', onResize, { passive: true });

        // Clean up the event listener on unmount
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Update state when page props change
    React.useEffect(() => {
        setUnreadCount(unreadNotificationCount);
        setNotificationList(notifications);
    }, [notifications, unreadNotificationCount]);

    // Real-time notification updates via Echo
    React.useEffect(() => {
        const echo: any = (window as any).Echo;
        if (!echo) {
            console.warn('Echo not available for real-time notifications');
            return;
        }

        const currentUser = auth?.user;
        const isSupervisor = currentUser?.isSupervisor;
        const isSuperAdmin = currentUser?.isSuperAdmin;

        // Use supervisor-specific channel or general notifications channel based on user role
        const notificationChannel = isSupervisor && currentUser?.id ? echo.private(`supervisor.${currentUser.id}`) : echo.channel('notifications');

        notificationChannel.subscribed(() => {
            console.log(
                '[Header Bell] Successfully subscribed to notification channel:',
                isSupervisor && currentUser?.id ? `supervisor.${currentUser.id}` : 'notifications',
            );
            console.log('[Header Bell] User info:', {
                isSupervisor,
                isSuperAdmin,
                userId: currentUser?.id,
                userName: currentUser?.name,
            });
        });

        notificationChannel.error((error: any) => {
            console.error('[Header Bell] Error with notification channel:', error);
            console.error('[Header Bell] Error details:', JSON.stringify(error, null, 2));
        });

        notificationChannel
            .listen('.LeaveRequested', (e: any) => {
                console.log('[Header Bell] Received LeaveRequested event:', e);
                console.log('[Header Bell] Event payload:', JSON.stringify(e, null, 2));
                const leaveData = e.leave || e;
                const existingId = leaveData.leave_id || leaveData.id;

                setNotificationList((prev) => {
                    const exists = prev.some((n) => n.data?.leave_id === existingId);
                    if (exists) return prev;

                    const newNotification = {
                        id: Date.now(),
                        type: 'leave_request',
                        data: {
                            leave_id: leaveData.leave_id || leaveData.id,
                            employee_name: leaveData.employee_name || 'Employee',
                            leave_type: leaveData.leave_type,
                            leave_start_date: leaveData.leave_start_date,
                            leave_end_date: leaveData.leave_end_date,
                            department: leaveData.department,
                        },
                        read_at: null,
                        created_at: new Date().toISOString(),
                    };

                    setUnreadCount((prev) => prev + 1);
                    return [newNotification, ...prev];
                });
            })
            .listen('.AbsenceRequested', (e: any) => {
                console.log('[Header Bell] Received AbsenceRequested event:', e);
                console.log('[Header Bell] Event payload:', JSON.stringify(e, null, 2));
                const absenceData = e.absence || e;
                const existingId = absenceData.absence_id || absenceData.id;

                setNotificationList((prev) => {
                    const exists = prev.some((n) => n.data?.absence_id === existingId);
                    if (exists) return prev;

                    const newNotification = {
                        id: Date.now(),
                        type: 'absence_request',
                        data: {
                            absence_id: absenceData.absence_id || absenceData.id,
                            employee_name: absenceData.employee_name || absenceData.full_name || 'Employee',
                            absence_type: absenceData.absence_type,
                            from_date: absenceData.from_date,
                            to_date: absenceData.to_date,
                            department: absenceData.department,
                        },
                        read_at: null,
                        created_at: new Date().toISOString(),
                    };

                    setUnreadCount((prev) => prev + 1);
                    return [newNotification, ...prev];
                });
            })
            .listen('.ReturnWorkRequested', (e: any) => {
                console.log('[Header Bell] Received ReturnWorkRequested event:', e);
                console.log('[Header Bell] Event payload:', JSON.stringify(e, null, 2));
                const returnWorkData = e;
                const existingId = returnWorkData.return_work_id;

                setNotificationList((prev) => {
                    const exists = prev.some((n) => n.data?.return_work_id === existingId || n.data?.resume_id === existingId);
                    if (exists) return prev;

                    const newNotification = {
                        id: Date.now(),
                        type: 'resume_to_work',
                        data: {
                            resume_id: returnWorkData.return_work_id,
                            return_work_id: returnWorkData.return_work_id,
                            employee_name: returnWorkData.employee_name || 'Employee',
                            employee_id_number: returnWorkData.employee_id_number,
                            department: returnWorkData.department,
                            return_date: returnWorkData.return_date,
                            absence_type: returnWorkData.absence_type,
                            reason: returnWorkData.reason,
                        },
                        read_at: null,
                        created_at: new Date().toISOString(),
                    };

                    setUnreadCount((prev) => prev + 1);
                    return [newNotification, ...prev];
                });
            });

        return () => {
            notificationChannel.stopListening('.LeaveRequested');
            notificationChannel.stopListening('.AbsenceRequested');
            notificationChannel.stopListening('.ReturnWorkRequested');
            if (isSupervisor && currentUser?.id) {
                echo.leave(`supervisor.${currentUser.id}`);
            } else {
                echo.leave('notifications');
            }
        };
    }, [auth?.user?.id, auth?.user?.isSupervisor]);

    const handleNotificationRead = (id: number) => {
        setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    return (
        <header
            className={cn(
                'flex h-16 items-center gap-3 bg-background p-4 sm:gap-4',
                fixed && 'w-inherit header-fixed peer/header fixed z-50 rounded-md',
                offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
                className,
            )}
            {...props}
        >
            <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
            <Separator orientation="vertical" className="h-6" />
            <div className="mr-auto flex items-center space-x-4">
                <BellNotification notifications={notificationList} unreadCount={unreadCount} onNotificationRead={handleNotificationRead} />
                {auth?.user && <AdminProfileDropdown user={auth.user} />}
            </div>
            {children}
        </header>
    );
};

Header.displayName = 'Header';
