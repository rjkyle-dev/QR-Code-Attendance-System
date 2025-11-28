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
import { useEffect, useState } from 'react';
import AddLeaveModal from './addleavemodal';
// import { Employees } from './columns';
import { DataTableToolbar } from './data-tool-bar';
// import { Employees } from '../types/employees';
import { usePermission } from '@/hooks/user-permission';
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    employees: any[]; // Add employees prop
}

export function DataTable<TData, TValue>({ columns, data, employees }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const { can } = usePermission();
    const [isModelOpen, setIsModelOpen] = useState(false);
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

        console.log('Setting up real-time listeners for leave data table');

        // Admin listens on global notifications channel for new requests
        const adminChannel = echo.channel('notifications');
        adminChannel
            .listen('.LeaveRequested', (e: any) => {
                console.log('Received LeaveRequested event on leave data table:', e);
                // Payload shape from App\\Events\\LeaveRequested
                // { type, leave_id, employee_id, employee_name, leave_type, leave_start_date, leave_end_date }
                if (!e || typeof e.leave_id === 'undefined') return;
                const newRow: any = {
                    id: e.leave_id,
                    employee_name: e.employee_name,
                    leave_type: e.leave_type,
                    leave_start_date: formatDate(e.leave_start_date),
                    leave_end_date: formatDate(e.leave_end_date),
                    leave_days: e.leave_days ?? 0,
                    status: 'Pending',
                    leave_reason: '',
                    leave_date_reported: formatDate(e.leave_start_date),
                    leave_date_approved: null,
                    leave_comments: '',
                    picture: null,
                    // bring credits from event so the row shows correct values without refresh
                    remaining_credits: typeof e.remaining_credits === 'number' ? e.remaining_credits : 0,
                    used_credits: typeof e.used_credits === 'number' ? e.used_credits : 0,
                    total_credits: typeof e.total_credits === 'number' ? e.total_credits : 12,
                };
                setRows((prev) => [newRow, ...prev.filter((r: any) => String(r.id) !== String(e.leave_id))]);
            })
            .listen('.RequestStatusUpdated', (e: any) => {
                console.log('Received RequestStatusUpdated event on leave data table:', e);
                if (!String(e.type || '').includes('leave')) return;
                setRows((prev) =>
                    prev.map((r: any) =>
                        String(r.id) === String(e.request_id)
                            ? { ...r, status: String(e.status).charAt(0).toUpperCase() + String(e.status).slice(1).toLowerCase() }
                            : r,
                    ),
                );
            })
            .error((error: any) => {
                console.error('Error subscribing to notifications channel:', error);
            });

        return () => {
            console.log('Cleaning up Echo listeners on leave data table');
            adminChannel.stopListening('.LeaveRequested');
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
                pageIndex: 0, //custom initial page index
                pageSize: 5, //custom default page size
            },
        },
    });

    return (
        <div className="space-y-4">
            {/* <DataTableToolbar table={table} /> */}
            <div className="flex items-center py-4">
                {/* <Input
                    placeholder="Filter employee..."
                    value={(table.getColumn('employee_name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('employee_name')?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                /> */}
                <DataTableToolbar table={table} />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* <Button variant="outline" className="ml-auto">
                            Columns
                        </Button> */}
                        <DataTableViewOptions table={table} />
                    </DropdownMenuTrigger>
                    {/* {can('Add Leave') && (
                        <Button variant="main" className="ml-auto" onClick={() => setIsModelOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Leave Request
                        </Button>
                    )} */}
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
                                    <span className="text-sm font-semibold">No Leave Data</span>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <DataTablePagination table={table} />
            </div>

            <AddLeaveModal isOpen={isModelOpen} onClose={() => setIsModelOpen(false)} employees={employees} />
        </div>
    );
}
