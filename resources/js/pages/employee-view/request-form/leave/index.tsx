import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { ViewLeaveModal } from './components/view-leave-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Leave Management',
        href: '/employee-view/leave',
    },
];

interface LeaveRequest {
    id: string;
    leave_type: string;
    leave_start_date: string;
    leave_end_date: string;
    leave_days: number;
    leave_status: string;
    leave_reason: string;
    leave_date_reported: string;
    leave_date_approved: string | null;
    leave_comments: string;
    created_at: string;
    employee_name: string;
    picture: string;
    department: string;
    employeeid: string;
    position: string;
    remaining_credits: number;
    used_credits: number;
    total_credits: number;
}

interface LeaveStats {
    totalLeaves: number;
    pendingLeaves: number;
    approvedLeaves: number;
    rejectedLeaves: number;
    cancelledLeaves: number;
}

interface PageProps {
    leaveRequests: LeaveRequest[];
    leaveStats: LeaveStats;
    employee: any;
}

export default function Index({ leaveRequests, leaveStats, employee }: PageProps) {
    const [loading, setLoading] = useState(true);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewLeave, setViewLeave] = useState<LeaveRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
    const [requests, setRequests] = useState<LeaveRequest[]>(leaveRequests);

    // Update local state when server data changes
    useEffect(() => {
        if (leaveRequests && Array.isArray(leaveRequests)) {
            setRequests(leaveRequests);
        }
    }, [leaveRequests]);

    // Set up real-time updates using Echo
    useEffect(() => {
        const echo: any = (window as any).Echo;
        if (!echo || !employee?.id) return;

        console.log('Setting up real-time listeners for employee leave index');

        // Listen for status updates on employee's private channel
        const employeeChannel = echo.private(`employee.${employee.id}`);
        employeeChannel
            .listen('.RequestStatusUpdated', (e: any) => {
                console.log('Leave status update received:', e);
                if (String(e.type || '').includes('leave')) {
                    setRequests((prev) =>
                        prev.map((request) =>
                            String(request.id) === String(e.request_id)
                                ? { ...request, leave_status: String(e.status).charAt(0).toUpperCase() + String(e.status).slice(1).toLowerCase() }
                                : request,
                        ),
                    );
                }
            })
            .error((error: any) => {
                console.error('Error subscribing to employee channel:', error);
            });

        return () => {
            console.log('Cleaning up Echo listeners on employee leave index');
            employeeChannel.stopListening('.RequestStatusUpdated');
        };
    }, [employee?.id]);

    // Mock functions for the columns
    const handleEdit = (leave: LeaveRequest) => {
        console.log('Edit leave:', leave);
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        console.log('Delete leave:', id);
        onSuccess();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Requests" />
            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                <div>
                    <div className="ms-2 flex items-center">
                        <Users className="size-11" />
                        <div className="ms-2">
                            <h2 className="flex text-2xl font-bold tracking-tight">Leave Requests</h2>
                            <p className="text-muted-foreground">Manage your leave request submissions</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="m-3 no-scrollbar">
                <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                    <CardHeader>
                        <CardTitle>My Leave Requests</CardTitle>
                        <CardDescription>View and track your leave request submissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns(
                                setIsViewOpen,
                                setViewLeave,
                                setIsModalOpen,
                                setEditModalOpen,
                                setSelectedLeave,
                                handleEdit,
                                handleDelete,
                            )}
                            data={requests || []}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* View Leave Modal */}
            <ViewLeaveModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} leave={viewLeave} />
        </AppLayout>
    );
}
