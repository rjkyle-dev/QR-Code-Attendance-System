//Filename: data-table.tsx

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
import { RotateCw, FileText } from 'lucide-react';
import * as React from 'react';

import { DataTableViewOptions } from '@/components/column-toggle';
import { DataTablePagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { router } from '@inertiajs/react';

import { DataTableToolbar } from './data-tool-bar';
import { usePermission } from '@/hooks/user-permission';


interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onRefresh?: () => void;
    refreshing?: boolean;
}

export function DataTable<TData, TValue>({ columns, data, onRefresh, refreshing }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const { can } = usePermission();
    const table = useReactTable({
        data,
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

    return (
        <div className="space-y-4">
            <div className="flex items-center py-4">
                <DataTableToolbar table={table} />
 
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <DataTableViewOptions table={table} />
                    </DropdownMenuTrigger>
                    <div className="flex items-center gap-2 ml-auto">
                      
                    <Button
                        variant="main"
                        onClick={onRefresh}
                        disabled={refreshing}
                        className=""
                        title="Refresh Employee List"
                    >
                        <RotateCw className={refreshing ? 'animate-spin mr-1 h-4 w-4' : 'mr-1 h-4 w-4'} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    
                    {can('View Payroll') && (
                    <Button 
                        variant="main" 
                        className="" 
                        onClick={() => {
                            const currentDate = new Date();
                            router.post('/payroll/generate', {
                                month: currentDate.toISOString(),
                                cutoff: '2nd',
                                employee_id: undefined, // Generate for all employees
                            });
                        }}
                        title="Generate Payroll for All Employees"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Payroll for All
                    </Button>
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
                    <TableHeader className="rounded-t-md bg-green-100 dark:bg-green-950 border-b border-green-200 dark:border-green-800">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="dark:bg-[#6baaa6] dark:text-darkMain">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="divide-y divide-green-100 bg-background dark:divide-green-950 dark:border-backgroundss dark:bg-backgroundss">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="hover-lift transition-colors duration-200 hover:bg-green-50 dark:divide-green-950 dark:border-backgroundss dark:hover:bg-[#6baaa6]"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <span className="text-sm font-semibold">No Employee Data</span>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <DataTablePagination table={table} />
            </div>
        </div>
    );
}
