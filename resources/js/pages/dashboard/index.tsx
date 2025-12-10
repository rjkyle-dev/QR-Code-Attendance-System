'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import * as React from 'react';

import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentLoading } from '@/components/ui/loading';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarSeparator, useSidebar } from '@/components/ui/sidebar';
// import { Toaster } from '@/components/ui/toaster';
import { ChartAreaInteractive } from '@/components/chartareainteractive';
import { ChartLineLabel } from '@/components/chartlinelabel';
import { ChartLineLabelLeave } from '@/components/chartlinelabel-leave';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionCards } from './components/section-cards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Props {
    totalEmployee: number;
    totalDepartment: number;
    totalLeave: number;
    pendingLeave: number;
    leavesPerMonth: any[]; // or the correct type
    leaveTypes: string[];
    monthlyAbsenceStats?: Array<{
        month: string;
        year: number;
        absences: number;
        percentage: number;
        date: string;
    }>;
    monthlyLeaveStats?: Array<{
        month: string;
        year: number;
        leaves: number;
        percentage: number;
        date: string;
    }>;
    // New role-based props
    userRole: string;
    isSupervisor: boolean;
    isSuperAdmin: boolean;
    supervisedDepartments: string[];
    supervisorEmployees?: any[]; // Add this prop
    // Add notifications for admin bell
    notifications: any[];
    unreadNotificationCount: number;
}

export default function Index({
    totalEmployee,
    totalDepartment,
    totalLeave,
    pendingLeave,
    leavesPerMonth,
    leaveTypes,
    monthlyAbsenceStats = [],
    monthlyLeaveStats = [],
    months: monthsProp,
    userRole,
    isSupervisor,
    isSuperAdmin,
    supervisedDepartments,
    supervisorEmployees,
    notifications,
    unreadNotificationCount,
    auth,
}: Props & { months?: number; auth?: any }) {
    const [loading, setLoading] = useState(false);
    const [months, setMonths] = useState(monthsProp ?? 6);
    const [unreadCount, setUnreadCount] = useState<number>(unreadNotificationCount);
    const [notificationList, setNotificationList] = useState<any[]>(notifications);

    useEffect(() => {
        setTimeout(() => {
            setMonths(monthsProp ?? 6);
            setLoading(false);
        }, 500);
    }, [monthsProp]);

    useEffect(() => {
        // Listen on user-specific notification channels
        const echo: any = (window as any).Echo;
        if (!echo) {
            console.error('Echo not found in window object (dashboard)');
            return;
        }

        console.log('Setting up Echo listeners for user-specific notifications (dashboard)');

        // Get current user info
        const currentUser = auth?.user;

        // Use supervisor-specific channel or general notifications channel based on user role
        const notificationChannel = isSupervisor && currentUser?.id ? echo.private(`supervisor.${currentUser.id}`) : echo.channel('notifications');

        // Test connection
        notificationChannel.subscribed(() => {
            console.log('Successfully subscribed to notification channel (dashboard)');
        });

        notificationChannel.error((error: any) => {
            console.error('Error with notification channel (dashboard):', error);
        });

        notificationChannel
            .listen('.LeaveRequested', (e: any) => {
                console.log('Received LeaveRequested event (dashboard):', e);
                // Create a new notification object
                const newNotification = {
                    id: Date.now(), // Temporary ID
                    type: 'leave_request',
                    data: {
                        leave_id: e.leave_id,
                        employee_name: e.employee_name || 'Employee',
                        leave_type: e.leave_type,
                        leave_start_date: e.leave_start_date,
                        leave_end_date: e.leave_end_date,
                    },
                    read_at: null,
                    created_at: new Date().toISOString(),
                };

                // Add to notification list and increment count
                setNotificationList((prev) => [newNotification, ...prev]);
                setUnreadCount((prev) => prev + 1);
            })
            .listen('.AbsenceRequested', (e: any) => {
                console.log('Received AbsenceRequested event (dashboard):', e);
                // Create a new notification object
                const newNotification = {
                    id: Date.now(), // Temporary ID
                    type: 'absence_request',
                    data: {
                        absence_id: e.absence_id,
                        employee_name: e.employee_name || 'Employee',
                        absence_type: e.absence_type,
                        from_date: e.from_date,
                        to_date: e.to_date,
                    },
                    read_at: null,
                    created_at: new Date().toISOString(),
                };

                // Add to notification list and increment count
                setNotificationList((prev) => [newNotification, ...prev]);
                setUnreadCount((prev) => prev + 1);
            })
            .listen('.ReturnWorkRequested', (e: any) => {
                console.log('Received ReturnWorkRequested event (dashboard):', e);
                // Create a new notification object
                const newNotification = {
                    id: Date.now(), // Temporary ID
                    type: 'return_work_request',
                    data: {
                        return_work_id: e.return_work_id,
                        employee_name: e.employee_name || 'Employee',
                        employee_id_number: e.employee_id_number,
                        department: e.department,
                        return_date: e.return_date,
                        absence_type: e.absence_type,
                        reason: e.reason,
                    },
                    read_at: null,
                    created_at: new Date().toISOString(),
                };

                // Add to notification list and increment count
                setNotificationList((prev) => [newNotification, ...prev]);
                setUnreadCount((prev) => prev + 1);
            });

        return () => {
            console.log('Cleaning up Echo listeners (dashboard)');
            notificationChannel.stopListening('.LeaveRequested');
            notificationChannel.stopListening('.AbsenceRequested');
            notificationChannel.stopListening('.ReturnWorkRequested');
        };
    }, [auth?.user?.id, isSupervisor]);

    const handleMonthsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value, 10);
        setMonths(value);
        router.visit(`/dashboard?months=${value}`, {
            preserveScroll: true,
            preserveState: true,
            only: ['leavesPerMonth', 'months'],
        });
    };

    return (
        <SidebarProvider>
            <Head title="Dashboard" />
            <SidebarHoverLogic
                totalEmployee={totalEmployee}
                totalDepartment={totalDepartment}
                totalLeave={totalLeave}
                pendingLeave={pendingLeave}
                leavesPerMonth={leavesPerMonth}
                leaveTypes={leaveTypes}
                monthlyAbsenceStats={monthlyAbsenceStats}
                monthlyLeaveStats={monthlyLeaveStats}
                months={months}
                loading={loading}
                handleMonthsChange={handleMonthsChange}
                userRole={userRole}
                isSupervisor={isSupervisor}
                isSuperAdmin={isSuperAdmin}
                supervisedDepartments={supervisedDepartments}
                supervisorEmployees={supervisorEmployees}
                notifications={notificationList}
                unreadNotificationCount={unreadCount}
            />
        </SidebarProvider>
    );
}

function SidebarHoverLogic(
    props: Props & {
        months: number;
        loading: boolean;
        handleMonthsChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
        monthlyAbsenceStats?: Array<{
            month: string;
            year: number;
            absences: number;
            percentage: number;
            date: string;
        }>;
        monthlyLeaveStats?: Array<{
            month: string;
            year: number;
            leaves: number;
            percentage: number;
            date: string;
        }>;
        notifications: any[];
        unreadNotificationCount: number;
    },
) {
    // Debug logging
    console.debug("SidebarHoverLogic: Component rendering", {
        timestamp: new Date().toISOString(),
        hasProps: !!props,
    });
    
    let sidebarState;
    let hoverHandlers;
    
    try {
        console.debug("SidebarHoverLogic: Attempting to call useSidebar");
        sidebarState = useSidebar();
        console.debug("SidebarHoverLogic: useSidebar successful", { state: sidebarState.state });
    } catch (error) {
        console.error("SidebarHoverLogic: Error in useSidebar", {
            error,
            timestamp: new Date().toISOString(),
            stack: new Error().stack,
        });
        throw error;
    }
    
    try {
        console.debug("SidebarHoverLogic: Attempting to call useSidebarHover");
        hoverHandlers = useSidebarHover();
        console.debug("SidebarHoverLogic: useSidebarHover successful");
    } catch (error) {
        console.error("SidebarHoverLogic: Error in useSidebarHover", {
            error,
            timestamp: new Date().toISOString(),
            stack: new Error().stack,
        });
        throw error;
    }
    
    const { state } = sidebarState;
    const { handleMouseEnter, handleMouseLeave } = hoverHandlers;

    // Get role-specific labels and descriptions
    const getRoleSpecificContent = () => {
        if (props.isSupervisor) {
            return {
                title: 'Supervisor Dashboard',
                subtitle: `Managing ${props.supervisedDepartments.join(', ')} department${props.supervisedDepartments.length > 1 ? 's' : ''}`,
                employeeLabel: 'Your Employees',
                departmentLabel: 'Your Departments',
                leaveLabel: 'Your Department Leaves',
                pendingLabel: 'Pending Leaves',
            };
        } else if (props.isSuperAdmin) {
            return {
                title: 'Super Admin Dashboard',
                subtitle: 'Manage your entire organization',
                employeeLabel: 'Total Employees',
                departmentLabel: 'Total Departments',
                leaveLabel: 'Total Leaves',
                pendingLabel: 'Pending Leaves',
            };
        } else {
            return {
                title: 'Dashboard',
                subtitle: "Manage your organization's workforce",
                employeeLabel: 'Total Employees',
                departmentLabel: 'Total Departments',
                leaveLabel: 'Total Leaves',
                pendingLabel: 'Pending Leaves',
            };
        }
    };

    const roleContent = getRoleSpecificContent();

    return (
        <>
            <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <AppSidebar onMouseLeave={handleMouseLeave} />
            <SidebarInset>
                <SiteHeader breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]} title={''} />
                {props.loading ? (
                    <ContentLoading />
                ) : (
                    <>
                        <Main>
                            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                                <div>
                                    <div className="ms-2 flex items-center">
                                        <LayoutGrid className="size-11" />
                                        <div className="ms-2">
                                            <h2 className="flex text-2xl font-bold tracking-tight">{roleContent.title}</h2>
                                            <p className="text-muted-foreground">{roleContent.subtitle}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Role indicator badge */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                                            props.isSupervisor
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                : props.isSuperAdmin
                                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}
                                    >
                                        {props.userRole}
                                    </div>
                                    {props.isSupervisor && props.supervisedDepartments.length > 0 && (
                                        <div className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            {props.supervisedDepartments.length} Dept{props.supervisedDepartments.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                                <div className="mt-2 w-full overflow-x-auto pb-2">
                                    <TabsList className="gap-2">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="overview" className="space-y-4">
                                    <div className="flex flex-1 flex-col">
                                        <div className="relative flex flex-1 flex-col">
                                            <div className="@container/main flex flex-1 flex-col gap-2">
                                                <div className="flex flex-col">
                                                    <SectionCards
                                                        totalEmployee={props.totalEmployee}
                                                        totalDepartment={props.totalDepartment}
                                                        totalLeave={props.totalLeave}
                                                        pendingLeave={props.pendingLeave}
                                                        isSupervisor={props.isSupervisor}
                                                        roleContent={roleContent}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator className="shadow-sm" />
                                    <ChartAreaInteractive />
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                                        <div className="lg:col-span-2 lg:row-span-2">
                                            {/* <ChartBarLabels /> */}
                                            <ChartLineLabelLeave data={props.monthlyLeaveStats || []} />
                                        </div>
                                        <div className="lg:col-span-2 lg:row-span-2">
                                            <ChartLineLabel data={props.monthlyAbsenceStats || []} />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </Main>
                    </>
                )}
            </SidebarInset>
        </>
    );
}
