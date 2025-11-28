// Filename: addemployeemodal.tsx
import { ComboboxDemo } from '@/components/combo-box';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { differenceInDays, format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

const leaveTypes = ['Annual Leave', 'Sick Leave', 'Emergency Leave', 'Maternity Leave', 'Paternity Leave', 'Bereavement Leave', 'Personal Leave'];

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    department?: string;
    position?: string;
    remaining_credits?: number;
    used_credits?: number;
    total_credits?: number;
}

interface AddLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    employees: Employee[];
}

const AddLeaveModal = ({ isOpen, onClose, employees = [] }: AddLeaveModalProps) => {
    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [reportDate, setReportDate] = useState<Date | undefined>(new Date());

    // ComboBox state for employee selection
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const { data, setData, errors, processing, reset, post } = useForm({
        employee_id: '',
        leave_type: '',
        leave_start_date: '',
        leave_end_date: '',
        leave_days: 0,
        leave_reason: '',
        leave_comments: '',
        leave_date_reported: format(new Date(), 'yyyy-MM-dd'),
    });
    const [reasonError, setReasonError] = useState<string | null>(null);

    // Calculate leave days when start or end date changes
    const updateDates = (start?: Date, end?: Date) => {
        if (start && end) {
            const days = differenceInDays(end, start) + 1;
            setData('leave_days', Math.max(0, days));
        } else {
            setData('leave_days', 0);
        }
    };

    const handleStartDate = (date?: Date) => {
        setStartDate(date);
        setOpenStart(false);
        if (date) {
            setData('leave_start_date', format(date, 'yyyy-MM-dd'));
            updateDates(date, endDate);
        } else {
            setData('leave_start_date', '');
            updateDates(undefined, endDate);
        }
    };
    const handleEndDate = (date?: Date) => {
        setEndDate(date);
        setOpenEnd(false);
        if (date) {
            setData('leave_end_date', format(date, 'yyyy-MM-dd'));
            updateDates(startDate, date);
        } else {
            setData('leave_end_date', '');
            updateDates(startDate, undefined);
        }
    };
    const handleReportDate = (date?: Date) => {
        setReportDate(date);
        if (date) {
            setData('leave_date_reported', format(date, 'yyyy-MM-dd'));
        } else {
            setData('leave_date_reported', '');
        }
    };

    const closeModalWithDelay = (delay: number = 1000) => {
        setTimeout(() => {
            onClose();
            reset();
            setStartDate(undefined);
            setEndDate(undefined);
            setReportDate(new Date());
            setSelectedEmployee(null);
        }, delay);
    };

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        setReasonError(null);
        if (!data.leave_reason || data.leave_reason.trim() === '') {
            setReasonError('Reason is required.');
            return;
        }

        // Check if employee has enough credits (credits = number of days)
        if (selectedEmployee && selectedEmployee.remaining_credits !== undefined && data.leave_days > selectedEmployee.remaining_credits) {
            toast.error(
                `Insufficient leave credits. Employee has ${selectedEmployee.remaining_credits} credits remaining but requesting ${data.leave_days} days (${data.leave_days} credits).`,
            );
            return;
        }

        post(route('leave.store'), {
            onSuccess: () => {
                toast.success('Leave request submitted successfully!');
                closeModalWithDelay(1200);
            },
            onError: (error: Record<string, string>) => {
                toast.error(error?.message || 'Failed to submit leave request.');
            },
        });
    };

    // Prepare options for ComboBox
    const employeeOptions = employees.map((emp) => ({
        value: String(emp.id), // ensure string
        label: `${emp.employeeid} - ${emp.employee_name}`,
        search: `${emp.employeeid} ${emp.employee_name}`.toLowerCase(),
    }));

    // Handler for ComboBox selection
    const handleEmployeeSelect = (value: string) => {
        const emp = employees.find((e) => String(e.id) === value); // ensure string comparison
        setSelectedEmployee(emp || null);
        setData('employee_id', value);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="border-main max-h-[90vh] min-w-2xl overflow-y-auto border-2 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-green-800">Add Leave Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label>Employee</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <ComboboxDemo
                                options={employeeOptions}
                                value={String(data.employee_id)} // ensure string
                                onChange={handleEmployeeSelect}
                                placeholder="Search employee name or ID..."
                                aria-invalid={!!errors.employee_id}
                                className="border-green-300 focus:border-green-500"
                            />
                            {selectedEmployee && (
                                <div className="mt-1 text-sm font-semibold text-green-700">
                                    Selected: {selectedEmployee.employeeid} - {selectedEmployee.employee_name}
                                    {selectedEmployee.remaining_credits !== undefined && (
                                        <div className="mt-1 text-xs text-blue-600">
                                            Leave Credits: {selectedEmployee.remaining_credits} remaining / {selectedEmployee.total_credits} total
                                            <br />
                                            <span className="text-orange-600">
                                                Note: Credits are deducted based on number of days (e.g., 4 days = 4 credits)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <InputError message={errors.employee_id} />
                        </div>
                        <div>
                            <Label>Leave Type</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select
                                value={data.leave_type}
                                onValueChange={(value) => setData('leave_type', value)}
                                aria-invalid={!!errors.leave_type}
                            >
                                <SelectTrigger className="border-green-300 focus:border-green-500">
                                    <SelectValue placeholder="Select Leave Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.leave_type} />
                        </div>
                        <div>
                            <Label>Start Date</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Popover open={openStart} onOpenChange={setOpenStart}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between border-green-300 font-normal focus:border-green-500"
                                        aria-invalid={!!errors.leave_start_date}
                                    >
                                        {startDate ? format(startDate, 'yyyy-MM-dd') : 'Select start date'}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={handleStartDate}
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    />
                                </PopoverContent>
                            </Popover>
                            <InputError message={errors.leave_start_date} />
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Popover open={openEnd} onOpenChange={setOpenEnd}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between border-green-300 font-normal focus:border-green-500"
                                        aria-invalid={!!errors.leave_end_date}
                                    >
                                        {endDate ? format(endDate, 'yyyy-MM-dd') : 'Select end date'}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={handleEndDate}
                                        disabled={(date) => {
                                            const minDate = startDate
                                                ? new Date(startDate.setHours(0, 0, 0, 0))
                                                : new Date(new Date().setHours(0, 0, 0, 0));
                                            return date < minDate;
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <InputError message={errors.leave_end_date} />
                        </div>
                        <div>
                            <Label>Total Days</Label>
                            <Input type="number" value={data.leave_days} readOnly className="bg-muted font-semibold text-primary" />
                        </div>
                        <div>
                            <Label>Date Reported</Label>
                            <Popover open={false} onOpenChange={() => {}}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between border-green-300 font-normal focus:border-green-500">
                                        {reportDate ? format(reportDate, 'yyyy-MM-dd') : 'Select date reported'}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                {/* Optionally, allow changing report date with a calendar */}
                            </Popover>
                        </div>
                    </div>
                    <div>
                        <Label>Reason</Label>
                        <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                        <Textarea
                            value={data.leave_reason}
                            onChange={(e) => setData('leave_reason', e.target.value)}
                            placeholder="Enter reason for leave"
                            aria-invalid={!!errors.leave_reason}
                            rows={3}
                        />
                        <InputError message={reasonError || errors.leave_reason} />
                    </div>
                    <div>
                        <Label>Comments</Label>
                        <Textarea
                            value={data.leave_comments}
                            onChange={(e) => setData('leave_comments', e.target.value)}
                            placeholder="Additional comments (optional)"
                            rows={2}
                        />
                        <InputError message={errors.leave_comments} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => closeModalWithDelay(0)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            tabIndex={0}
                            disabled={processing}
                            className="bg-main font-semibold text-black transition duration-200 ease-in hover:bg-green-300"
                        >
                            {processing ? 'Processing...' : 'Add Leave Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddLeaveModal;
