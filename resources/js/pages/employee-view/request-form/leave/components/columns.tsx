'use client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, Eye } from 'lucide-react';
// import { Employees } from '../types/employees';
import { DataTableColumnHeader } from './data-table-column-header';
// import {} from './editemployeemodal';

type LeaveRequest = {
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
};

const columns = (
    setIsViewOpen: (open: boolean) => void,
    setViewLeave: (leave: LeaveRequest | null) => void,
    setIsModalOpen: (open: boolean) => void,
    setEditModalOpen: (open: boolean) => void,
    setSelectedLeave: (leave: LeaveRequest | null) => void,
    handleEdit: (leave: LeaveRequest) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
): ColumnDef<LeaveRequest>[] => [
    {
        accessorKey: 'leave_type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Leave Type" />,
        cell: ({ row }) => {
            const leaveType = row.getValue('leave_type') as string;
            const leaveDays = row.original.leave_days;

            return (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <span className="text-sm font-semibold">{leaveType.charAt(0)}</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">{leaveType}</div>
                        <div className="text-xs text-gray-500">
                            {leaveDays} day{leaveDays > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            );
        },
    },

    {
        accessorKey: 'leave_start_date',
        header: 'Leave Period',
        cell: ({ row }) => {
            const startDate = row.getValue('leave_start_date') as string;
            const endDate = row.original.leave_end_date;
            const reportedDate = row.original.leave_date_reported;

            return (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">Reported: {new Date(reportedDate).toLocaleDateString()}</div>
                </div>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const startDate = row.getValue(columnId);

            return filterValue.includes(startDate);
        },
    },
    {
        accessorKey: 'leave_status',
        header: 'Status',
        cell: ({ row }) => {
            const leave_status: string = row.getValue('leave_status');

            const statusColor =
                leave_status === 'Approved'
                    ? 'bg-green-100 text-green-800'
                    : leave_status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : leave_status === 'Rejected'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-800';

            return <span className={`rounded px-2 py-1 text-xs font-medium ${statusColor}`}>{leave_status}</span>;
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const leaveStatus = row.getValue(columnId);

            return filterValue.includes(leaveStatus);
        },
    },
    {
        accessorKey: 'action',
        header: () => <div>Action</div>,
        id: 'actions',
        cell: ({ row }) => {
            const leave = row.original;

            return (
                <>
                    <DropdownMenu>
                        {/* <Toaster position="top-right" richColors /> */}
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <CircleEllipsis className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedLeave(leave);
                                        setViewLeave(leave); // Set the leave data for the modal
                                        setIsViewOpen(true); // Open View modal
                                    }}
                                    className="hover-lift w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                                >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            );
        },
    },
];

export { columns, type LeaveRequest };
