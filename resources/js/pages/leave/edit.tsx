import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import LeaveEditPage from './components/leaveeditpage';

import { Leave } from './types/leave';
// import { Leave } from './components/columns';
import { SiteHeader } from '@/components/site-header';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Leave',
        href: '/leave',
    },
    {
        title: 'Edit',
        href: '/edit',
    },
];

interface Props {
    leave: Leave[];
}

export default function Index({ leave }: Props) {
    const [data, setData] = useState<Leave[]>(leave);
    const [editModelOpen, setEditModalOpen] = useState(false);
    const [isModelOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Leave | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewEmployee, setViewEmployee] = useState<Leave | null>(null);

    useEffect(() => {
        setData(leave);
    }, [leave]);

    // Realtime updates via Echo for leave approvals/rejections
    useEffect(() => {
        const echo: any = (window as any).Echo;
        if (!echo) return;

        const adminChannel = echo.channel('notifications');
        adminChannel
            .listen('.LeaveRequested', (e: any) => {
                if (e && e.leave) {
                    setData((prev) => [e.leave, ...prev]);
                }
            })
            .listen('.RequestStatusUpdated', (e: any) => {
                if (!String(e.type || '').includes('leave')) return;
                setData((prev) =>
                    prev.map((r: any) => (String(r.id) === String(e.request_id) ? { ...r, leave_status: String(e.status).toLowerCase() } : r)),
                );
            });

        return () => {
            adminChannel.stopListening('.LeaveRequested');
            adminChannel.stopListening('.RequestStatusUpdated');
        };
    }, []);

    const handleUpdate = (updatedEmployee: Leave) => {
        setData((prevData) => prevData.map((leave) => (leave.id === updatedEmployee.id ? updatedEmployee : leave)));
    };

    const handleEdit = (leave: Leave) => {
        // Logic for editing the leave (open the edit modal, prefill the data, etc.)
        console.log('Editing leave', leave);
        // You can set the state to open an edit modal, like:
        setSelectedEmployee(leave);
        setEditModalOpen(true); // Assuming you have a state for edit modal visibility
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        // Logic for deleting the leave (e.g., API call)
        router.delete(`/leave/${id}`, {
            onSuccess: () => {
                toast.success('Leave Deleted!', {
                    duration: 1500,
                });
                // Close the modal after successful deletion
                onSuccess(); // This will trigger the onClose callback to close the modal
            },
            onError: () => {
                toast.error('Failed to delete leave!', {
                    duration: 1500,
                });
            },
            preserveScroll: true,
        });
    };

    return (
        <SidebarProvider>
            {/* <Toaster position="top-right" richColors /> */}
            <AppSidebar />
            <Head title="Leave" />
            <SidebarInset>
                {/* <HeaderShrink/> */}
                <SiteHeader breadcrumbs={breadcrumbs} title={''} />

                <Main fixed>
                    <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                        <div>
                            <div className="ms-2 flex items-center">
                                <Users className="size-11" />

                                <div className="ms-2">
                                    <h2 className="flex text-2xl font-bold tracking-tight">Leave Approval</h2>
                                    <p className="text-muted-foreground">Manage your organization's workforce</p>
                                </div>
                            </div>
                        </div>
                        {/* <TasksPrimaryButtons /> */}
                    </div>

                    <div className="m-3 no-scrollbar">
                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                            {/* <CardHeader>
                                <CardTitle>Leave List</CardTitle>
                                <CardDescription>List of Leave</CardDescription>
                            </CardHeader> */}
                            <CardContent>
                                <LeaveEditPage />
                            </CardContent>
                        </Card>
                    </div>
                </Main>
            </SidebarInset>
        </SidebarProvider>
    );
}
