import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { departments, workStatus } from '../data/data';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

// Age range options for filtering
const ageRanges = [
    { label: '18-20 years', value: '18-20' },
    { label: '21-25 years', value: '21-25' },
    { label: '26-30 years', value: '26-30' },
    { label: '31-35 years', value: '31-35' },
    { label: '36-40 years', value: '36-40' },
    { label: '41-45 years', value: '41-45' },
    { label: '46-49 years', value: '46-49' },
    { label: '50-55 years', value: '50-55' },
    { label: '56-60+ years', value: '56-60+' },
    
];

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
                <Input
                    placeholder="Search employee..."
                    value={(table.getColumn('employee_name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('employee_name')?.setFilterValue(event.target.value)}
                    className="h-8 w-[150px] border-cfar-400 lg:w-[250px]"
                />
                <div className="flex gap-x-2">
                    {table.getColumn('department') && (
                        <DataTableFacetedFilter column={table.getColumn('department')} title="Department" options={departments} />
                    )}
                </div>
                {/* <div className="flex gap-x-2">
                    {table.getColumn('work_status') && (
                        <DataTableFacetedFilter column={table.getColumn('work_status')} title="Work Status" options={workStatus} />
                    )}
                </div> */}
                <div className="flex gap-x-2">
                    {table.getColumn('date_of_birth') && (
                        <DataTableFacetedFilter column={table.getColumn('date_of_birth')} title="Age Range" options={ageRanges} />
                    )}
                </div>
                {isFiltered && (
                    <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
                        Reset
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
