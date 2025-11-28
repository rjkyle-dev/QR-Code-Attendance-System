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
import { FileText, RotateCw } from 'lucide-react';
import { router } from '@inertiajs/react';
import * as React from 'react';

import { DataTableViewOptions } from '@/components/column-toggle';
import { DataTablePagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import AddAttendanceModal from './addattendancemodal';
import { SessionTimeDisplay } from './SessionTimeDisplay';
import { SessionTimeModal } from './SessionTimeModal';
// import { Employees } from './columns';
import { DataTableToolbar } from './data-tool-bar';
// import { Employees } from '../types/employees';
import { usePermission } from '@/hooks/user-permission';
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    attendance: any[];
    sessions: any[];
    onRefresh?: () => void;
    refreshing?: boolean;
}

export function DataTable<TData, TValue>({ columns, data, attendance, sessions, onRefresh, refreshing }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [sessionModalOpen, setSessionModalOpen] = useState(false);
    const { can } = usePermission();
    const table = useReactTable({
        data: data || [],
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
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="main" onClick={onRefresh} disabled={refreshing} title="Refresh Attendance List">
                            <RotateCw className={refreshing ? 'mr-1 h-4 w-4 animate-spin' : 'mr-1 h-4 w-4'} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        {can('Set Session Times') && (
                            <Button variant="main" onClick={() => setSessionModalOpen(true)}>
                                Set Session Times
                            </Button>
                        )}
                        <Button 
                          onClick={() => router.visit('/attendance/daily-checking')}
                        variant="main">
                            <FileText className="mr-2 h-4 w-4" />
                            PP Crew Check
                        </Button>
                        {/* <Button variant="main" onClick={() => setIsModelOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Start Attendance
                        </Button> */}
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
                                    No Employee Data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <DataTablePagination table={table} />
            </div>

            {/* Session Time Display */}
            <div className="mt-8">
                <SessionTimeDisplay sessions={sessions} />
            </div>

            <AddAttendanceModal isOpen={isModelOpen} onClose={() => setIsModelOpen(false)} />
            <SessionTimeModal open={sessionModalOpen} onClose={() => setSessionModalOpen(false)} sessions={sessions} />
        </div>
    );
}
