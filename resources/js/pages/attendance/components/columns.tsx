'use client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { CircleCheck, CircleCheckBig, CircleEllipsis, Edit, Eye } from 'lucide-react';
// import { Employees } from '../types/employees';
import DeleteConfirmationDialog from '@/components/delete-alert';
import { usePermission } from '@/hooks/user-permission';
import { DataTableColumnHeader } from './data-table-column-header';
import {} from './editemployeemodal';

type Attendance = {
    id: string;
    timeIn: string;
    timeOut: string;
    breakTime: string;
    attendanceStatus: string;
    attendanceDate: string;
    employee_name: string;
    employeeid: string;
    picture: string;
    department: string;
    position: string;
    session: string;
};

const columns = (
    setIsViewOpen: (open: boolean) => void,
    setViewEmployee: (employee: Attendance | null) => void,
    setIsModalOpen: (open: boolean) => void,
    setEditModalOpen: (open: boolean) => void,
    setSelectedEmployee: (employee: Attendance | null) => void,
    handleEdit: (employee: Attendance) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
): ColumnDef<Attendance>[] => [
    {
        accessorKey: 'employee_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => {
            // const src = row.getValue('picture') as string;
            const src = row.original.picture;
            const name = row.original.employee_name;
            const empid = row.original.employeeid;

            // Handle missing employee data - show fallback if name or ID is missing
            const displayName = name || 'Unknown Employee';
            const displayId = empid || 'N/A';

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
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xs text-gray-500">
                                <img
                                    src="AGOC.png"
                                    className="animate-scale-in border-main dark:border-darksMain h-12 w-12 rounded-full border-2 object-cover"
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">{displayName}</div>
                        <div className="text-xs text-gray-500">{displayId}</div>
                    </div>
                </div>
            );
        },
    },

    {
        accessorKey: 'department',
        header: 'Departments',
        cell: ({ row }) => {
            const department: string = row.getValue('department');
            const position = row.original.position;

            return (
                <div>
                    <div className="text-sm font-medium text-gray-900">{department}</div>
                    <div className="text-xs text-gray-500">{position}</div>
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
        accessorKey: 'attendanceDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => {
            const date = row.original.attendanceDate;
            return (
                <div className="w-32">
                    <span className="text-sm font-medium text-gray-900">{formatDate(date)}</span>
                </div>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;
            const date = row.getValue(columnId);
            return filterValue.includes(date);
        },
    },
    {
        accessorKey: 'Time-In',
        header: 'Time-In',
        cell: ({ row }) => {
            const timein = row.original.timeIn;
            return (
                <div className="w-24">
                    <span className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium`}>{formatTimeTo12Hour(timein)}</span>
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
        accessorKey: 'Time-Out',
        header: 'Time-Out',
        cell: ({ row }) => {
            const timeout = row.original.timeOut;
            return (
                <div className="w-24">
                    <span className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium`}>{formatTimeTo12Hour(timeout)}</span>
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const attendancestatusRaw = row.original.attendanceStatus;
            // Normalize statuses coming from backend/app
            const status = attendancestatusRaw === 'Attendance Complete' ? 'Complete' : attendancestatusRaw;

            let circleColor = 'bg-gray-300';
            if (status === 'Late') circleColor = 'bg-yellow-400';
            else if (status === 'Time In') circleColor = 'bg-green-500';
            else if (status === 'Attendance Complete') circleColor = 'bg-green-500';

            return (
                <div className="flex w-24 items-center gap-2">
                    {status === 'Complete' ? (
                        <CircleCheckBig className="h-4 w-4 text-green-600" />
                    ) : status === 'Time In' ? (
                        <CircleCheck className="h-4 w-4 text-green-500" />
                    ) : (
                        <span className={`inline-block h-3 w-3 rounded-full ${circleColor}`}></span>
                    )}
                    <span className="text-xs font-medium">{status}</span>
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
        accessorKey: 'action',
        header: () => <div>Action</div>,
        id: 'actions',
        cell: ({ row }) => {
            const employee = row.original;
            const { can } = usePermission();
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
                            {can('View Attendance Details') && (
                                <DropdownMenuItem>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedEmployee(employee);
                                            setViewEmployee(employee); // Set the employee data for the modal
                                            setIsViewOpen(true); // Open View modal
                                        }}
                                        className="hover-lift w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View
                                    </Button>
                                </DropdownMenuItem>
                            )}
                            {can('Update Attendance') && (
                                <DropdownMenuItem>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedEmployee(employee);
                                            setEditModalOpen(true);
                                        }}
                                        className="hover-lift w-full border-green-300 text-green-600 hover:bg-green-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Update
                                    </Button>
                                </DropdownMenuItem>
                            )}
                            {can('Delete Attendance') && (
                                <DropdownMenuItem asChild>
                                    <DeleteConfirmationDialog
                                        onConfirm={() =>
                                            handleDelete(employee.id, () => {
                                                // Optionally handle success here
                                                // toast.success('Employee deleted successfully!');
                                            })
                                        }
                                    />
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            );
        },
    },
];

// Helper to format HH:mm:ss to 12-hour format with AM/PM
function formatTimeTo12Hour(timeStr: string) {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

// Helper to format date string to readable format
function formatDate(dateStr: string) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; // Return original if invalid date

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        return dateStr; // Return original string if parsing fails
    }
}

export { columns, type Attendance };
