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
import { RotateCw } from 'lucide-react';
import * as React from 'react';

import { DataTableViewOptions } from '@/components/column-toggle';
import { DataTablePagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
// import { Employees } from './columns';
import { DataTableToolbar } from './data-tool-bar';
import EvaluationModal from './evaluationmodal';
// import { Employees } from '../types/employees';
import { Employees } from '@/hooks/employees';
import { usePermission } from '@/hooks/user-permission';
import { Evaluation } from '../types/evaluation';
import ViewEvaluationModal from './viewevaluationmodal';

type ColumnsHandler = (
    setIsModelOpen: (open: boolean) => void,
    setViewModalOpen: (open: boolean) => void,
    setEditModalOpen: (open: boolean) => void,
    setSelectedEvaluation: (evaluation: Evaluation | null) => void,
) => ColumnDef<any, any>[];

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[] | ColumnsHandler;
    data: TData[];
    employees: any[];
    employees_all: Employees[];
    refreshing?: boolean;
    onRefresh?: () => void;
    user_permissions?: {
        can_evaluate: boolean;
        is_super_admin: boolean;
        is_supervisor: boolean;
        evaluable_departments: string[];
    };
}

export function DataTable<TData, TValue>({
    columns,
    data,
    employees,
    employees_all,
    refreshing,
    onRefresh,
    user_permissions,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    // If you have an edit modal, define setEditModalOpen here, otherwise use a no-op
    const setEditModalOpen = () => {};
    const { can } = usePermission();

    // Use columns as a function with handlers
    const columnsWithHandlers = React.useMemo(
        () =>
            typeof columns === 'function'
                ? columns(setIsModelOpen, setViewModalOpen, setEditModalOpen, setSelectedEvaluation, user_permissions)
                : columns,
        [columns, user_permissions],
    );

    const table = useReactTable({
        data: data || [],
        columns: columnsWithHandlers,
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
                        {can('Refresh Evaluation List') && (
                            <Button variant="main" onClick={onRefresh} disabled={refreshing} className="" title="Refresh Evaluation List">
                                <RotateCw className={refreshing ? 'mr-1 h-4 w-4 animate-spin' : 'mr-1 h-4 w-4'} />
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </Button>
                        )}
                    </div>
                    {/* <Button variant="main" className="ml-auto" onClick={() => setIsModelOpen(true)}> */}
                    {/* <Plus className="mr-2 h-4 w-4" /> */}
                    {/* Add Rating */}
                    {/* </Button> */}
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
                                    No Employee Ratings Data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <DataTablePagination table={table} />
            </div>
            {/* Only render modals if selectedEvaluation is not null */}
            {selectedEvaluation && <EvaluationModal isOpen={isModelOpen} onClose={() => setIsModelOpen(false)} evaluation={selectedEvaluation} />}
            {selectedEvaluation && (
                <ViewEvaluationModal isOpen={isViewModalOpen} onClose={() => setViewModalOpen(false)} evaluation={selectedEvaluation} />
            )}
        </div>
    );
}
