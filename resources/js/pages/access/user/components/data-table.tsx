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
import { useState } from 'react';
import AddPaymentModal from './testmodal';
// import { Employees } from './columns';
import { DataTableToolbar } from './data-tool-bar';
// import { Employees } from '../types/employees';
import { usePermission } from '@/hooks/user-permission';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onAddUser?: () => void;
}

export function DataTable<TData, TValue>({ columns, data, onAddUser }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    // const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [isModelOpen, setIsModelOpen] = useState(false);
    // const [isViewOpen, setIsViewOpen] = useState(false);
    // const [rowSelection, setRowSelection] = React.useState({});
    // const [isEditOpen, setIsEditOpen] = useState(false);
    // const [selectedEmployee, setSelectedEmployee] = useState<Employees | null>(null);
    // const [viewEmployee, setViewEmployee] = useState<Employees | null>(null);
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
                    {can('Add Admin') && (
                    <Button variant="main" className="ml-auto" onClick={onAddUser}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                    )}
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
                    <TableHeader className="rounded-t-md bg-green-100 dark:text-darkMain">
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

            <AddPaymentModal isOpen={isModelOpen} onClose={() => setIsModelOpen(false)} />
        </div>
    );
}
