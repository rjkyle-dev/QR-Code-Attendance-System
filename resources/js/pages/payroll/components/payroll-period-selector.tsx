import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Employee } from '@/hooks/employees';
import { format } from 'date-fns';
import { Calendar, Search } from 'lucide-react';
import { useState } from 'react';

interface PayrollPeriodSelectorProps {
    employees?: Employee[];
    onGenerate?: (data: { month: Date; cutoff: string; employeeId?: string }) => void;
}

const cutoffOptions = [
    { value: '1st', label: '1st Cut-off (1st - 15th)' },
    { value: '2nd', label: '2nd Cut-off (16th - 25th)' },
    { value: '3rd', label: '3rd Cut-off (26th - End of Month)' },
];

const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

export function PayrollPeriodSelector({ employees = [], onGenerate }: PayrollPeriodSelectorProps) {
    const [month, setMonth] = useState<Date>(new Date());
    const [cutoff, setCutoff] = useState<string>('2nd');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
    const [monthPickerOpen, setMonthPickerOpen] = useState(false);

    // Get current month and year from the month date
    const selectedMonth = String(month.getMonth());
    const selectedYear = String(month.getFullYear());

    // Handle month change
    const handleMonthChange = (monthValue: string) => {
        const newDate = new Date(month.getFullYear(), parseInt(monthValue), 1);
        setMonth(newDate);
    };

    // Handle year change
    const handleYearChange = (yearValue: string) => {
        const newDate = new Date(parseInt(yearValue), month.getMonth(), 1);
        setMonth(newDate);
    };

    const handleGenerate = () => {
        if (onGenerate) {
            onGenerate({
                month,
                cutoff,
                employeeId: selectedEmployee === 'all' ? undefined : selectedEmployee,
            });
        }
    };

    return (
        <Card className="border-main dark:bg-backgrounds overflow-hidden bg-background drop-shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <CardTitle>Select Payroll Period</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Month Selector */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="month">Month</Label>
                            <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button id="month" variant="outline" className="w-full justify-between font-normal">
                                        {format(month, 'MMMM yyyy')}
                                        <Calendar className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <div className="border-b p-3">
                                        <div className="flex gap-2">
                                            <Select value={selectedMonth} onValueChange={handleMonthChange}>
                                                <SelectTrigger className="w-32">
                                                    <SelectValue placeholder="Month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((monthOption) => (
                                                        <SelectItem key={monthOption.value} value={monthOption.value}>
                                                            {monthOption.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select value={selectedYear} onValueChange={handleYearChange}>
                                                <SelectTrigger className="w-24">
                                                    <SelectValue placeholder="Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem key={year} value={String(year)}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <CalendarComponent
                                        mode="single"
                                        selected={month}
                                        onSelect={(date) => {
                                            if (date) {
                                                // Set to first day of the selected month
                                                const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                                                setMonth(firstDay);
                                                setMonthPickerOpen(false);
                                            }
                                        }}
                                        month={month}
                                        onMonthChange={setMonth}
                                        captionLayout="dropdown"
                                        fromYear={2020}
                                        toYear={2030}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Cut-off Selector */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cutoff">Cut-off</Label>
                            <Select value={cutoff} onValueChange={setCutoff}>
                                <SelectTrigger id="cutoff" className="w-full">
                                    <SelectValue placeholder="Select cut-off" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cutoffOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Employee Selector */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="employee">Employee (Optional)</Label>
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                <SelectTrigger id="employee" className="w-full">
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Employees</SelectItem>
                                    {employees.map((employee) => (
                                        <SelectItem key={employee.employeeid} value={employee.employeeid}>
                                            {employee.employee_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Generate Report Button */}
                    <div className="flex justify-end">
                        <Button onClick={handleGenerate} className="gap-2">
                            <Search className="h-4 w-4" />
                            Generate Report
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
