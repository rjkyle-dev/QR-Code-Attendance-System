'use client';
import DeleteConfirmationDialog from '@/components/delete-alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePermission } from '@/hooks/user-permission';
import { SingleRole } from '@/types/role_permission';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { DataTableColumnHeader } from './data-table-column-header';

const columns = (
    handleView: (role: SingleRole) => void,
    handleEdit: (role: SingleRole) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
): ColumnDef<SingleRole>[] => {
    const { can } = usePermission();

    return [
        {
            id: 'index',
            header: 'No.',
            cell: ({ row }) => {
                return (
                    <div className="text-sm font-medium text-gray-900">
                        {row.index + 1}
                    </div>
                );
            },
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
            cell: ({ row }) => {
                const roleName = row.getValue('name') as string;

                return (
                    <div className="flex items-center space-x-4">
                        <div>
                            <div className="text-sm font-medium text-gray-900">{roleName}</div>
                            {/* <div className="text-xs text-gray-500">ID: {row.original.id}</div> */}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'permissions',
            header: 'Permissions',
            cell: ({ row }) => {
                const permissions = row.original.permissions || [];

                return (
                    <div className="flex flex-wrap gap-1">
                        {permissions.slice(0, 3).map((permission, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                            >
                                {permission}
                            </span>
                        ))}
                        {permissions.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                +{permissions.length - 3} more
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Created Date',
            cell: ({ row }) => {
                const createdDate = row.getValue('created_at') as string;
                return (
                    <div className="text-sm text-gray-900">
                        {new Date(createdDate).toLocaleDateString()}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: () => <div>Action</div>,
            id: 'actions',
            cell: ({ row }) => {
                const role = row.original;

                return (
                    <>
                        {/* Dropdown for additional actions */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="border border-gray-200"
                                    aria-label="More actions"
                                >
                                    <CircleEllipsis className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {can('View Roles Details') && (
                                    <DropdownMenuItem>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleView(role)}
                                            className="hover-lift w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                    </DropdownMenuItem>
                                )}
                                {can('Update Roles') && (
                                    <DropdownMenuItem>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                            className="hover-lift w-full border-green-300 text-green-600 hover:bg-green-50"
                                        >
                                            <Link href={route('role.edit', role.id)}>
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                    </DropdownMenuItem>
                                )}
                                {can('Delete Roles') && (
                                    <DropdownMenuItem asChild>
                                        <DeleteConfirmationDialog
                                            onConfirm={() =>
                                                handleDelete(role.id.toString(), () => {
                                                    toast.success('Role deleted successfully!');
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
};

export { columns };
