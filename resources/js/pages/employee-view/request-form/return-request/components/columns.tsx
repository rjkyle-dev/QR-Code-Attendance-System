'use client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
// import { Employees } from '../types/employees';
import DeleteConfirmationDialog from '@/components/delete-alert';
import { DataTableColumnHeader } from './data-table-column-header';
import {} from './editemployeemodal';

type Employees = {
    id: string;
    employeeid: string;
    employee_name: string;
    firstname: string;
    middlename: string;
    lastname: string;
    picture: string;
    gender: string;
    department: string;
    position: string;
    phone: string;
    work_status: string;
    status: string;
    service_tenure: string;
    email: string;
}; 



const columns = (
    setIsViewOpen: (open: boolean) => void,
    setViewEmployee: (employee: Employees | null) => void,
    setIsModalOpen: (open: boolean) => void,
    setEditModalOpen: (open: boolean) => void,
    setSelectedEmployee: (employee: Employees | null) => void,
    handleEdit: (employee: Employees) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
) : ColumnDef<Employees>[] => [
    {
        accessorKey: 'employee_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => {
            // const src = row.getValue('picture') as string;
            const src = row.original.picture;
            const name = row.original.employee_name;
            const empid = row.original.employeeid;
 
            return (
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        {src ? (
                            <img
                                src={src}
                                alt="Profile"
                                className="animate-scale-in h-12 w-12 rounded-full border-2 border-main object-cover dark:border-darksMain"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xs text-gray-500">
                                <img
                                    src="Logo.png"
                                    className="animate-scale-in h-12 w-12 rounded-full border-2 border-main object-cover dark:border-darksMain"
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">{name}</div>
                        <div className="text-xs text-gray-500">{empid}</div>
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
        accessorKey: 'work_status',
        header: 'Work Status',
        cell: ({ row }) => {
            const work_status: string = row.getValue('work_status');

            const workStatusColor =
                work_status === 'Regular'
                    ? 'bg-green-100 text-green-800'
                    : work_status === 'Add Crew'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800';

            return <span className={`rounded px-2 py-1 text-xs font-medium ${workStatusColor}`}>{work_status}</span>;
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const workStatus = row.getValue(columnId);

            return filterValue.includes(workStatus);
        },
    },
    {
        accessorKey: 'action',
        header: () => <div>Action</div>,
        id: 'actions',
        cell: ({ row }) => {
            const employee = row.original;

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
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            );
        },
    },
];

export { columns, type Employees };
