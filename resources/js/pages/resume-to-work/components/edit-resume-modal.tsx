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
import { format } from 'date-fns';
import { CalendarIcon, Pencil } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Employee {
    id: string;
    employee_name: string;
    employeeid: string;
    department: string;
    position: string;
}

interface ResumeToWorkRequest {
    id: string;
    employee_name: string;
    employee_id: string;
    department: string;
    position: string;
    return_date: string;
    previous_absence_reference: string;
    comments: string;
    status: 'pending' | 'processed';
}

interface EditResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employees: Employee[];
    request: ResumeToWorkRequest | null;
}

const EditResumeModal = ({ isOpen, onClose, employees = [], request }: EditResumeModalProps) => {
    const [returnDateOpen, setReturnDateOpen] = useState(false);
    const [returnDate, setReturnDate] = useState<Date | undefined>();
    const [originalReturnDate, setOriginalReturnDate] = useState<Date | undefined>();
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const { data, setData, errors, processing, reset, put } = useForm({
        employee_id: '',
        return_date: '',
        previous_absence_reference: '',
        comments: '',
    });

    // Populate form when request is provided
    useEffect(() => {
        if (request && isOpen) {
            // Find employee by database ID (request.employee_id is now the database ID)
            const employee = employees.find((e) => e.id === request.employee_id);
            if (employee) {
                setSelectedEmployee(employee);
            }
            const returnDateValue = request.return_date ? new Date(request.return_date) : undefined;
            setReturnDate(returnDateValue);
            // Store the original return date for comparison
            setOriginalReturnDate(returnDateValue);
            setData({
                employee_id: request.employee_id || '',
                return_date: request.return_date || '',
                previous_absence_reference: request.previous_absence_reference || '',
                comments: request.comments || '',
            });
        }
    }, [request, isOpen, employees]);

    const resetState = () => {
        reset();
        setReturnDate(undefined);
        setOriginalReturnDate(undefined);
        setSelectedEmployee(null);
    };

    const closeNow = () => {
        onClose();
        resetState();
    };

    const handleEmployeeSelect = (employeeId: string) => {
        const emp = employees.find((e) => e.id === employeeId);
        if (emp) {
            setSelectedEmployee(emp);
            setData({
                ...data,
                employee_id: emp.id,
            });
        }
    };

    const handleReturnDate = (date?: Date) => {
        setReturnDate(date);
        setReturnDateOpen(false);
        if (date) {
            setData('return_date', format(date, 'yyyy-MM-dd'));
        } else {
            setData('return_date', '');
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.employee_id) {
            toast.error('Please select an employee');
            return;
        }

        if (!data.return_date) {
            toast.error('Please select a return date');
            return;
        }

        if (!request) {
            toast.error('No request selected for editing');
            return;
        }

        // Extract the actual ID from the request (handle both 'resume_' and 'return_' prefixes)
        const requestId =
            request.id.startsWith('resume_') || request.id.startsWith('return_') ? request.id.replace(/^(resume_|return_)/, '') : request.id;

        // Use direct URL path to avoid Ziggy route issues
        put(`/resume-to-work/${requestId}`, {
            onSuccess: () => {
                toast.success('Resume to work request updated successfully!');
                closeNow();
            },
            onError: (errors) => {
                console.error('Update errors:', errors);
                toast.error('Failed to update resume to work request. Please check your input.');
            },
        });
    };

    // Get today's date for calendar restrictions
    const today = new Date();

    return (
        <Dialog open={isOpen} onOpenChange={closeNow}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5" />
                        Edit Resume to Work Request
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Employee Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="employee_id">
                            Employee <span className="text-red-500">*</span>
                        </Label>
                        {request ? (
                            // Display employee name as read-only when editing existing request
                            <div className="rounded-md border border-input bg-muted px-3 py-2">
                                <div className="flex flex-col">
                                    <span className="font-medium">{request.employee_name}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {selectedEmployee?.employeeid || request.employee_id} • {request.department} • {request.position}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            // Show dropdown when creating new request
                            <Select value={data.employee_id} onValueChange={handleEmployeeSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{employee.employee_name}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {employee.employeeid} • {employee.department} • {employee.position}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <InputError message={errors.employee_id} />
                    </div>

                    {/* Return Date */}
                    <div className="space-y-2">
                        <Label htmlFor="return_date">
                            Return Date <span className="text-red-500">*</span>
                        </Label>
                        <Popover open={returnDateOpen} onOpenChange={setReturnDateOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {returnDate ? format(returnDate, 'PPP') : 'Select return date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={returnDate}
                                    onSelect={handleReturnDate}
                                    disabled={(date) => date < today}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {/* Show original return date from employee's leave/absence */}
                        {request && originalReturnDate && (
                            <div className="rounded-md border border-input bg-muted/50 px-3 py-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Original Return Date (from employee):</span>
                                    <span className="font-medium">{format(originalReturnDate, 'PPP')}</span>
                                </div>
                                {/* Show comparison if date was changed */}
                                {returnDate && returnDate.getTime() !== originalReturnDate.getTime() && (
                                    <div className="mt-1 flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">HR Modified Return Date:</span>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">{format(returnDate, 'PPP')}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <InputError message={errors.return_date} />
                    </div>

                    {/* Previous Absence Reference */}
                    <div className="space-y-2">
                        <Label htmlFor="previous_absence_reference">Previous Absence Reference</Label>
                        <Input
                            id="previous_absence_reference"
                            placeholder="e.g., Leave Request #123, Absence ID #456"
                            value={data.previous_absence_reference}
                            onChange={(e) => setData('previous_absence_reference', e.target.value)}
                        />
                        <InputError message={errors.previous_absence_reference} />
                    </div>

                    {/* Comments */}
                    <div className="space-y-2">
                        <Label htmlFor="comments">Comments</Label>
                        <Textarea
                            id="comments"
                            placeholder="Additional comments or notes about the return to work..."
                            value={data.comments}
                            onChange={(e) => setData('comments', e.target.value)}
                            rows={3}
                        />
                        <InputError message={errors.comments} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeNow} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditResumeModal;
