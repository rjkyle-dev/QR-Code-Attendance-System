'use client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, Eye, FileText, DollarSign } from 'lucide-react';
import { Employee } from '@/hooks/employees';
import { DataTableColumnHeader } from './data-table-column-header';
import { router } from '@inertiajs/react';

const columns = (
    can: (permission: string) => boolean,
    setIsViewOpen: (open: boolean) => void,
    setViewEmployee: (employee: Employee | null) => void,
): ColumnDef<Employee>[] => {
    return [
        {
            accessorKey: 'employee_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
            cell: ({ row }) => {
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
                                    className="animate-scale-in dark:border-darksMain h-12 w-12 rounded-full border-2 border-cfar-400 object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xs text-gray-500">
                                    <img
                                        src="AGOC.png"
                                        className="animate-scale-in dark:border-darksMain h-12 w-12 rounded-full border-2 border-cfar-400 object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{empid}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'department',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
            cell: ({ row }) => {
                const department: string = row.getValue('department');
                const position = row.original.position;

                return (
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{department}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{position}</div>
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
            header: ({ column }) => <DataTableColumnHeader column={column} title="Work Status" />,
            cell: ({ row }) => {
                const work_status: string = row.getValue('work_status');

                const workStatusColor =
                    work_status === 'Regular'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                        : work_status === 'Probationary'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';

                return <span className={`rounded px-2 py-1 text-xs font-medium ${workStatusColor}`}>{work_status}</span>;
            },
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue || filterValue.length === 0) return true;
                const workStatus = row.getValue(columnId);
                return filterValue.includes(workStatus);
            },
        },
        {
            accessorKey: 'service_tenure',
            header: ({ column }: { column: any }) => <DataTableColumnHeader column={column} title="Service Tenure" />,
            cell: ({ row }: { row: any }) => {
                const serviceTenure = row.original.service_tenure;
                if (!serviceTenure) return <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>;

                const startDate = new Date(serviceTenure);
                const today = new Date();
                const years = today.getFullYear() - startDate.getFullYear();
                const months = today.getMonth() - startDate.getMonth();

                return (
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {years > 0 ? `${years} year${years > 1 ? 's' : ''}` : ''} {months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: () => <div>Actions</div>,
            id: 'actions',
            cell: ({ row }) => {
                const employee = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <CircleEllipsis className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Payroll Actions</DropdownMenuLabel>
                            
                            {can('View Employee Details') && (
                                <DropdownMenuItem>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setViewEmployee(employee);
                                            setIsViewOpen(true);
                                        }}
                                        className="hover-lift w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </Button>
                                </DropdownMenuItem>
                            )}

                            {can('View Payroll') && (
                                <DropdownMenuItem>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            // Navigate to payroll list filtered by this employee
                                            router.visit('/payroll', {
                                                data: { employee_id: employee.id },
                                            });
                                        }}
                                        className="hover-lift w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                    >
                                        <DollarSign className="h-4 w-4" />
                                        View Payrolls
                                    </Button>
                                </DropdownMenuItem>
                            )}

                            {can('View Payroll') && (
                                <DropdownMenuItem>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            // Generate payroll for this employee
                                            const currentDate = new Date();
                                            router.post('/payroll/generate', {
                                                month: currentDate.toISOString(),
                                                cutoff: '2nd',
                                                employee_id: employee.id,
                                            });
                                        }}
                                        className="hover-lift w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Generate Payroll
                                    </Button>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
};

export { columns };
