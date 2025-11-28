'use client';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { DataTableViewOptions } from '@/components/column-toggle';
import { DataTablePagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/user-permission';
import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddAbsenceModal from './addabsencemodal';
import { type Absence } from './columns';
import { DataTableToolbar } from './data-tool-bar';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    employees?: any[];
}

export function DataTable<TData, TValue>({ columns, data, employees = [] }: DataTableProps<TData, TValue>) {
    const { can } = usePermission();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
    const [rows, setRows] = useState<any[]>(data || []);
    const formatDate = (d: any) => {
        try {
            const date = new Date(d);
            return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            return d;
        }
    };

    useEffect(() => {
        setRows(data || []);
    }, [data]);

    useEffect(() => {
        const echo: any = (window as any).Echo;
        if (!echo) return;

        const adminChannel = echo.channel('notifications');
        adminChannel
            .listen('.AbsenceRequested', (e: any) => {
                // Payload from App\\Events\\AbsenceRequested
                // { type, absence_id, employee_id, employee_name, absence_type, from_date, to_date }
                if (!e || typeof e.absence_id === 'undefined') return;
                const newRow: any = {
                    id: e.absence_id,
                    employee_name: e.employee_name,
                    absence_type: e.absence_type,
                    from_date: formatDate(e.from_date),
                    to_date: formatDate(e.to_date),
                    days: e.days ?? 0,
                    reason: '',
                    is_partial_day: false,
                    status: 'pending',
                    submitted_at: formatDate(e.from_date),
                };
                setRows((prev) => [newRow, ...prev.filter((r: any) => String(r.id) !== String(e.absence_id))]);
            })
            .listen('.RequestStatusUpdated', (e: any) => {
                if (String(e.type || '') !== 'absence_status') return;
                setRows((prev) =>
                    prev.map((r: any) => (String(r.id) === String(e.request_id) ? { ...r, status: String(e.status).toLowerCase() } : r)),
                );
            });

        return () => {
            adminChannel.stopListening('.AbsenceRequested');
            adminChannel.stopListening('.RequestStatusUpdated');
        };
    }, []);

    const table = useReactTable({
        data: rows || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize: 5,
            },
        },
    });

    const handleEdit = (absence: Absence) => {
        setSelectedAbsence(absence);
        setIsEditOpen(true);
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        router.delete(route('absence.destroy', { absence: id }), {
            onSuccess: () => {
                toast.success('Absence request deleted successfully!');
                // Reload the page to get updated data
                router.reload();
            },
            onError: () => {
                toast.error('Failed to delete absence request. Please try again.');
            },
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center py-4">
                <DataTableToolbar table={table} />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <DataTableViewOptions table={table} />
                    </DropdownMenuTrigger>
                    <div className="ml-auto flex items-center gap-2">
                        {/* {can('Add Absence') && (
                            <Button variant="main" onClick={() => setIsModelOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Absence
                            </Button>
                        )} */}
                        {can('Absence Request') && (
                            <Link href={route('absence.absence-approve')}>
                                <Button variant="main">Absence Request</Button>
                            </Link>
                        )}
                    </div>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="animate-fade-in rounded-md">
                <Table className="animate-fade-in rounded-md">
                    <TableHeader className="dark:text-darkMain rounded-t-md bg-green-100">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="dark:text-darkMain dark:bg-[#6baaa6]">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="dark:border-backgroundss dark:bg-backgroundss divide-y divide-green-100 bg-background dark:divide-green-950">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="hover-lift dark:border-backgroundss transition-colors duration-200 hover:bg-green-50 dark:divide-green-950 dark:hover:bg-[#6baaa6]"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No Absence Data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <DataTablePagination table={table} />
            </div>

            <AddAbsenceModal isOpen={isModelOpen} onClose={() => setIsModelOpen(false)} employees={employees} />
        </div>
    );
}
