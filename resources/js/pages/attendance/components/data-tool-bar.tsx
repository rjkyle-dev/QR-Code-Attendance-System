import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { departments } from '../data/data'; // Assuming departments list
import { DataTableFacetedFilter } from './data-table-faceted-filter';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
                <Input
                    placeholder="Search employee..."
                    value={(table.getColumn('employee_name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('employee_name')?.setFilterValue(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                <div className="flex gap-x-2">
                    {table.getColumn('department') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('department')}
                            title="Department"
                            options={departments} // Department options like ['HR', 'Finance', etc.]
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
