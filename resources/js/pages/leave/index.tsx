import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentLoading } from '@/components/ui/loading';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddLeaveModal from './components/addleavemodal';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import EditEmployeeModal from './components/editemployeemodal';
import { SectionCards } from './components/section-cards';
import ViewLeaveDetails from './components/viewleavedetails';
import { Leave } from './types/leave';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Leave Management',
        href: '/leave',
    },
];

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    department?: string;
    position?: string;
    remaining_credits?: number;
    used_credits?: number;
    total_credits?: number;
}

interface Props {
    leave: Leave[];
    employees: Employee[];
    leaveStats: {
        totalLeaves: number;
        pendingLeaves: number;
        approvedLeaves: number;
        rejectedLeaves: number;
        cancelledLeaves: number;
        approvalRate: number;
    };
    leavesPerMonth: any[];
    leaveTypes: string[];
    user_permissions?: {
        is_super_admin: boolean;
        is_supervisor: boolean;
        supervised_departments: string[];
    };
}

export default function Index({ leave, employees, leaveStats, leavesPerMonth, leaveTypes, user_permissions }: Props) {
    const [data, setData] = useState<Leave[]>(leave);
    const [editModelOpen, setEditModalOpen] = useState(false);
    const [isModelOpen, setIsModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewLeave, setViewLeave] = useState<Leave | null>(null);
    const [loading, setLoading] = useState(true);
    const { props } = usePage<{ auth?: any }>();
    const currentUser = props.auth?.user;

    useEffect(() => {
        setTimeout(() => {
            setData(leave);
            setLoading(false);
        }, 500);
    }, [leave]);

    // Real-time updates via Echo
    useEffect(() => {
        const echo: any = (window as any).Echo;
        if (!echo) {
            console.warn('Echo not available for real-time updates');
            return;
        }

        console.log('Setting up real-time listeners for leave index');

        const handleNewLeave = (e: any) => {
            console.log('Received LeaveRequested event:', e);
            if (e && e.leave_id) {
                const newLeave: Leave = {
                    id: String(e.leave_id),
                    leave_start_date: e.leave_start_date,
                    employee_name: e.employee_name || 'Employee',
                    leave_type: e.leave_type,
                    leave_end_date: e.leave_end_date,
                    leave_days: e.leave_days || 1,
                    status: 'Pending',
                    leave_reason: '',
                    leave_date_reported: new Date().toISOString().split('T')[0],
                    leave_date_approved: '',
                    leave_comments: '',
                    picture: '',
                    department: e.department || '',
                    position: '',
                    employeeid: '',
                    // include credits from event payload if present
                    remaining_credits: typeof e.remaining_credits === 'number' ? e.remaining_credits : undefined,
                    used_credits: typeof e.used_credits === 'number' ? e.used_credits : undefined,
                    total_credits: typeof e.total_credits === 'number' ? e.total_credits : undefined,
                };

                // Check if this leave already exists to avoid duplicates
                setData((prev) => {
                    const exists = prev.some((r) => r.id === newLeave.id);
                    if (exists) {
                        console.log('Leave already exists, not adding duplicate');
                        return prev;
                    }
                    console.log('Adding new leave request to index list');
                    toast.success(`New leave request from ${newLeave.employee_name}`);
                    return [newLeave, ...prev];
                });
            }
        };

        // Listen on notifications channel for general leave requests (SuperAdmin only)
        const notificationsChannel = echo.channel('notifications');
        notificationsChannel
            .listen('.LeaveRequested', (e: any) => {
                // Only process if user is SuperAdmin (supervisors get it via their private channel)
                if (!user_permissions?.is_super_admin && user_permissions?.is_supervisor) {
                    return; // Supervisors should only receive via their private channel
                }
                handleNewLeave(e);
            })
            .listen('.RequestStatusUpdated', (e: any) => {
                console.log('Received RequestStatusUpdated event on leave index:', e);
                if (String(e.type || '').includes('leave')) {
                    setData((prev) =>
                        prev.map((r) =>
                            String(r.id) === String(e.request_id)
                                ? { ...r, status: String(e.status).charAt(0).toUpperCase() + String(e.status).slice(1).toLowerCase() }
                                : r,
                        ),
                    );
                }
            });

        // Also listen on private supervisor channel if user is supervisor
        let supervisorChannel: any = null;
        if (user_permissions && user_permissions.is_supervisor && currentUser?.id) {
            const currentUserId = currentUser.id;
            console.log('Setting up supervisor channel for user:', currentUserId);
            supervisorChannel = echo.private(`supervisor.${currentUserId}`);

            supervisorChannel.subscribed(() => {
                console.log('Successfully subscribed to supervisor channel for leave');
            });

            supervisorChannel.error((error: any) => {
                console.error('Error subscribing to supervisor channel:', error);
            });

            supervisorChannel.listen('.LeaveRequested', handleNewLeave);
        }

        return () => {
            console.log('Cleaning up Echo listeners on leave index');
            notificationsChannel.stopListening('.LeaveRequested');
            notificationsChannel.stopListening('.RequestStatusUpdated');
            if (supervisorChannel) {
                supervisorChannel.stopListening('.LeaveRequested');
                echo.leave(`supervisor.${currentUser?.id}`);
            }
            echo.leave('notifications');
        };
    }, [user_permissions, currentUser?.id]);

    const handleUpdate = (updatedEmployee: Leave) => {
        setData((prevData) => prevData.map((leave) => (leave.id === updatedEmployee.id ? updatedEmployee : leave)));
    };

    const handleEdit = (leave: Leave) => {
        // Logic for editing the employee (open the edit modal, prefill the data, etc.)
        console.log('Editing leave', leave);
        // You can set the state to open an edit modal, like:
        setSelectedLeave(leave);
        setEditModalOpen(true); // Assuming you have a state for edit modal visibility
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        // Logic for deleting the employee (e.g., API call)
        router.delete(`/leave/${id}`, {
            onSuccess: () => {
                toast.success('Employee deleted!', {
                    duration: 1500,
                });
                // Close the modal after successful deletion
                onSuccess(); // This will trigger the onClose callback to close the modal
            },
            onError: () => {
                toast.error('Failed to delete employee leave!', {
                    duration: 1500,
                });
            },
            preserveScroll: true,
        });
    };

    return (
        <SidebarProvider>
            <Head title="Leave" />
            {/* <Toaster position="top-right" richColors swipeDirections={['right', 'left']} /> */}

            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    {loading ? (
                        <ContentLoading />
                    ) : (
                        <>
                            <Main fixed>
                                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                                    <div>
                                        <div className="ms-2 flex items-center">
                                            <Users className="size-11" />
                                            <div className="ms-2">
                                                <h2 className="flex text-2xl font-bold tracking-tight">Leave Management</h2>
                                                <p className="text-muted-foreground">Manage employee leave requests and absences</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <TasksPrimaryButtons /> */}
                                </div>

                                <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                                    <TabsContent value="overview" className="space-y-4">
                                        <div className="flex flex-1 flex-col">
                                            <div className="relative flex flex-1 flex-col">
                                                <div className="@container/main flex flex-1 flex-col gap-2">
                                                    <div className="flex flex-col">
                                                        <SectionCards
                                                            leaveStats={leaveStats}
                                                            isSupervisor={user_permissions?.is_supervisor || false}
                                                            roleContent={{
                                                                totalLabel: user_permissions?.is_supervisor ? 'Your Leaves' : 'Total Leaves',
                                                                approvedLabel: user_permissions?.is_supervisor ? 'Your Approved' : 'Approved',
                                                                pendingLabel: user_permissions?.is_supervisor ? 'Your Pending' : 'Pending',
                                                                rejectedLabel: user_permissions?.is_supervisor
                                                                    ? 'Your Rejected'
                                                                    : 'Rejected',
                                                            }}
                                                        />
                                                        {/* ChartBarLabel for leave per month by type */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <Separator className="shadow-sm" />
                                </Tabs>

                                <div className="m-3 no-scrollbar">
                                    <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-semibold">Leave List</CardTitle>
                                            <CardDescription>List of employee leave</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Replace with your data */}
                                            <DataTable
                                                columns={columns(
                                                    setIsViewOpen, // Pass setIsViewOpen
                                                    setViewLeave, // Pass setViewEmployee
                                                    setIsModalOpen,
                                                    setEditModalOpen,
                                                    setSelectedLeave,
                                                    handleEdit,
                                                    handleDelete,
                                                )}
                                                data={data}
                                                employees={employees}
                                            />
                                            <EditEmployeeModal
                                                isOpen={editModelOpen}
                                                onClose={() => setEditModalOpen(false)}
                                                employee={selectedLeave}
                                                onUpdate={handleUpdate}
                                            />
                                            <ViewLeaveDetails
                                                isOpen={isViewOpen}
                                                onClose={() => setIsViewOpen(false)}
                                                leave={viewLeave}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                            />
                                            <AddLeaveModal isOpen={isModelOpen} onClose={() => setIsModalOpen(false)} employees={employees} />
                                        </CardContent>
                                    </Card>
                                </div>
                            </Main>
                        </>
                    )}
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}

function SidebarHoverLogic({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const { handleMouseEnter, handleMouseLeave } = useSidebarHover();
    return (
        <>
            <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <AppSidebar onMouseLeave={handleMouseLeave} />
            {children}
        </>
    );
}
