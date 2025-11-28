'use client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, Eye } from 'lucide-react';
// import { Employees } from '../types/employees';
import { DataTableColumnHeader } from './data-table-column-header';
import {} from './editabsencemodal';

type AbsenceRequest = {
    id: string;
    absence_type: string;
    from_date: string;
    to_date: string;
    days: number;
    status: string;
    reason: string;
    submitted_at: string;
    approved_at: string | null;
    approval_comments: string | null;
    is_partial_day: boolean;
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
    setViewAbsence: (absence: AbsenceRequest | null) => void,
    setIsModalOpen: (open: boolean) => void,
    setEditModalOpen: (open: boolean) => void,
    setSelectedAbsence: (absence: AbsenceRequest | null) => void,
    handleEdit: (absence: AbsenceRequest) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
): ColumnDef<AbsenceRequest>[] => [
    {
        accessorKey: 'absence_type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Absence Type" />,
        cell: ({ row }) => {
            const absenceType = row.getValue('absence_type') as string;
            const days = row.original.days;
            const isPartialDay = row.original.is_partial_day;

            return (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                            <span className="text-sm font-semibold">{absenceType.charAt(0)}</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">{absenceType}</div>
                        <div className="text-xs text-gray-500">
                            {days} day{days > 1 ? 's' : ''} {isPartialDay ? '(Partial)' : ''}
                        </div>
                    </div>
                </div>
            );
        },
    },

    {
        accessorKey: 'from_date',
        header: 'Absence Period',
        cell: ({ row }) => {
            const fromDate = row.getValue('from_date') as string;
            const toDate = row.original.to_date;
            const submittedAt = row.original.submitted_at;

            return (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {new Date(fromDate).toLocaleDateString()} - {new Date(toDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">Submitted: {new Date(submittedAt).toLocaleDateString()}</div>
                </div>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const fromDate = row.getValue(columnId);

            return filterValue.includes(fromDate);
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status: string = row.getValue('status');

            const statusColor =
                status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800';

            return <span className={`rounded px-2 py-1 text-xs font-medium ${statusColor}`}>{status}</span>;
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const status = row.getValue(columnId);

            return filterValue.includes(status);
        },
    },
    {
        accessorKey: 'action',
        header: () => <div>Action</div>,
        id: 'actions',
        cell: ({ row }) => {
            const absence = row.original;

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
                                        setSelectedAbsence(absence);
                                        setViewAbsence(absence); // Set the absence data for the modal
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

export { columns, type AbsenceRequest };
