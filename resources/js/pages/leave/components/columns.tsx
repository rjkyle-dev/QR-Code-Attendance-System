'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Clock, CreditCard, Edit, Eye, UserCheck, XCircle } from 'lucide-react';
import { DataTableColumnHeader } from './data-table-column-header';
import {} from './editemployeemodal';

type Leave = {
    id: string;
    leave_start_date: string;
    employee_name: string;
    leave_type: string;
    leave_end_date: string;
    leave_days: string;
    status: string;
    leave_reason: string;
    leave_date_reported: string;
    leave_date_approved: string;
    leave_comments: string;
    picture: string;
    department: string | null;
    position: string | null;
    remaining_credits?: number;
    used_credits?: number;
    total_credits?: number;
    supervisor_status?: string | null;
    hr_status?: string | null;
};

const columns = (
    setIsViewOpen: (open: boolean) => void,
    setViewLeave: (leave: Leave | null) => void,
    setIsModalOpen: (open: boolean) => void,
    setEditModalOpen: (open: boolean) => void,
    setSelectedLeave: (leave: Leave | null) => void,
    handleEdit: (leave: Leave) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
): ColumnDef<Leave>[] => [
    {
        accessorKey: 'employee_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => {
            // const src = row.getValue('picture') as string;
            const src = row.original.picture;
            const name = row.original.employee_name;

            return (
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        {src ? (
                            <img
                                src={src}
                                alt="Profile"
                                className="animate-scale-in border-main dark:border-darksMain h-12 w-12 rounded-full border-2 object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                <img
                                    src="\AGOC.png"
                                    className="animate-scale-in border-main dark:border-darksMain h-12 w-12 rounded-full border-2 object-cover"
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'department',
        header: 'Departments',
        cell: ({ row }) => {
            const department = (row.getValue('department') as string) ?? '';
            const position = row.original.position ?? '';

            return (
                <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{department || 'No Department'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{position || 'No Position'}</div>
                </div>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const department = row.getValue(columnId);

            return filterValue.includes(department);
        },
    },
    {
        accessorKey: 'credits',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Credits" />,
        cell: ({ row }) => {
            const remaining = row.original.remaining_credits || 0;
            const used = row.original.used_credits || 0;
            const total = row.original.total_credits || 12;

            const getCreditStatus = () => {
                if (remaining === 0) return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' };
                if (remaining <= 3) return { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' };
                if (remaining <= 6) return { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' };
                return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' };
            };

            const status = getCreditStatus();

            return (
                <div className="flex items-center gap-2">
                    <CreditCard className={`h-4 w-4 ${status.color}`} />
                    <div className="text-sm">
                        <div className={`font-medium ${status.color}`}>
                            {remaining}/{total}
                        </div>
                        <div className="text-xs text-muted-foreground">{used} used</div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'Leave Type',
        header: 'Leave Type',
        cell: ({ row }) => {
            // const leave: string = row.getValue('leave_type');
            // const position = row.original.position;
            const leave = row.original.leave_type;

            return (
                <Badge variant="outline" className="bg-green-100 px-5 py-2 text-sm font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    {leave}
                </Badge>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const leaveType = row.getValue(columnId);

            return filterValue.includes(leaveType);
        },
    },
    {
        accessorKey: 'leave Days',
        header: 'Period',
        cell: ({ row }) => {
            const leave_days = row.original.leave_days;

            return (
                <Badge variant="outline" className="bg-green-100 px-5 py-2 text-sm font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    {leave_days}
                </Badge>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const leaveDays = row.getValue(columnId);

            return filterValue.includes(leaveDays);
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const leave_status: string = row.getValue('status');
            // const leave_status = row.original.leave_status;

            let statusLeaveColors = '';
            let StatusIcon = null;
            if (leave_status === 'Pending') {
                statusLeaveColors = 'bg-yellow-100 text-yellow-800 font-semibold text-lg p-3 dark:bg-yellow-900/30 dark:text-yellow-200';
                StatusIcon = Clock;
            } else if (leave_status === 'Approved') {
                statusLeaveColors = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
                StatusIcon = CheckCircle;
            } else {
                statusLeaveColors = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
                StatusIcon = XCircle;
            }
            return (
                <div className="w-24">
                    <span className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${statusLeaveColors}`}>
                        {StatusIcon && <StatusIcon className="mr-1 h-4 w-4" />}
                        {leave_status}
                    </span>
                </div>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const leaveStatus = row.getValue(columnId);

            return filterValue.includes(leaveStatus);
        },
    },
    {
        accessorKey: 'Submitted',
        header: 'Submitted',
        cell: ({ row }) => {
            // const leave: string = row.getValue('leave_type');
            // const position = row.original.position;
            const leave = row.original.leave_date_reported;

            return (
                <Badge variant="outline" className="bg-green-100 px-5 py-2 text-sm font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    {leave}
                </Badge>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const leaveType = row.getValue(columnId);

            return filterValue.includes(leaveType);
        },
    },
    {
        accessorKey: 'action',
        header: () => <div>Action</div>,
        id: 'actions',
        cell: ({ row }) => {
            const leave = row.original;

            // Check if leave is fully approved (both supervisor and HR)
            const isFullyApproved = leave.status === 'Approved' && leave.supervisor_status === 'approved' && leave.hr_status === 'approved';

            return (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 p-0 px-3 hover:bg-green-200"
                        onClick={() => {
                            setSelectedLeave(leave);
                            setViewLeave(leave); // Set the employee data for the modal
                            setIsViewOpen(true); // Open View modal
                        }}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Link href={route('leave.edit', leave.id)}>
                        <Button variant="outline" size="icon" className="h-8 w-8 p-0 px-3 hover:bg-green-200">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                    {isFullyApproved && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 p-0 px-3 hover:bg-blue-200"
                            onClick={() => {
                                router.visit(`/resume-to-work?leave_id=${leave.id}&type=leave`);
                            }}
                            title="Create Resume to Work"
                        >
                            <UserCheck className="h-4 w-4 text-blue-600" />
                        </Button>
                    )}
                </div>
            );
        },
    },
];

export { columns };
