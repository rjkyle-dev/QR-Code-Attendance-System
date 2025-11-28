import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { departments, positions } from '@/hooks/data';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    department: string;
    position: string;
}

interface AddAbsenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    employees?: Employee[];
}

const AddAbsenceModal = ({ isOpen, onClose, employees = [] }: AddAbsenceModalProps) => {
    const [fromOpen, setFromOpen] = useState(false);
    const [toOpen, setToOpen] = useState(false);
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const { data, setData, errors, processing, reset, post } = useForm({
        employee_id: '',
        full_name: '',
        employee_id_number: '',
        department: '',
        position: '',
        absence_type: 'Annual Leave',
        from_date: '',
        to_date: '',
        is_partial_day: false as boolean,
        reason: '',
    });

    const resetState = () => {
        reset();
        setFromDate(undefined);
        setToDate(undefined);
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
                full_name: emp.employee_name,
                employee_id_number: emp.employeeid,
                department: emp.department,
                position: emp.position,
            });
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('absence.store'), {
            onSuccess: () => {
                toast.success('Absence request submitted successfully!');
                closeNow();
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                toast.error('Failed to submit absence request. Please check your input.');
            },
        });
    };

    // Get today's date for calendar restrictions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <Dialog open={isOpen} onOpenChange={closeNow}>
            <DialogContent className="border-main max-h-[90vh] min-w-2xl overflow-y-auto border-2 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-green-800">Employee Absence Request</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-green-800">Employee Information</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {employees.length > 0 && (
                                <div className="md:col-span-2">
                                    <Label>Select Employee (Optional)</Label>
                                    <Select value={data.employee_id} onValueChange={handleEmployeeSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an employee or fill manually" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.id} value={emp.id}>
                                                    {emp.employeeid} - {emp.employee_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div>
                                <Label>
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                />
                                <InputError message={errors.full_name} />
                            </div>
                            <div>
                                <Label>
                                    Employee ID <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={data.employee_id_number}
                                    onChange={(e) => setData('employee_id_number', e.target.value)}
                                    placeholder="Enter your employee ID"
                                    required
                                />
                                <InputError message={errors.employee_id_number} />
                            </div>
                            <div>
                                <Label>
                                    Department <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.department} onValueChange={(value) => setData('department', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.department} />
                            </div>
                            <div>
                                <Label>
                                    Position <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.position} onValueChange={(value) => setData('position', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {positions.map((pos) => (
                                            <SelectItem key={pos} value={pos}>
                                                {pos}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.position} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-4">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-green-800">Absence Details</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>
                                    Type of Absence <span className="text-red-500">*</span>
                                </Label>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    <RadioGroup value={data.absence_type} onValueChange={(value) => setData('absence_type', value)}>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem id="annual" value="Annual Leave" />
                                                <Label htmlFor="annual" className="font-normal">
                                                    Annual Leave
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem id="personal" value="Personal Leave" />
                                                <Label htmlFor="personal" className="font-normal">
                                                    Personal Leave
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem id="matpat" value="Maternity/Paternity" />
                                                <Label htmlFor="matpat" className="font-normal">
                                                    Maternity/Paternity
                                                </Label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem id="sick" value="Sick Leave" />
                                                <Label htmlFor="sick" className="font-normal">
                                                    Sick Leave
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem id="emergency" value="Emergency Leave" />
                                                <Label htmlFor="emergency" className="font-normal">
                                                    Emergency Leave
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem id="other" value="Other" />
                                                <Label htmlFor="other" className="font-normal">
                                                    Other
                                                </Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <InputError message={errors.absence_type} />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label>
                                        From Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={fromOpen} onOpenChange={setFromOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal">
                                                {fromDate ? format(fromDate, 'yyyy-MM-dd') : 'Select start date'}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={fromDate}
                                                onSelect={(d) => {
                                                    setFromDate(d);
                                                    setFromOpen(false);
                                                    if (d) setData('from_date', format(d, 'yyyy-MM-dd'));
                                                }}
                                                disabled={(date) => date < today}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.from_date} />
                                </div>
                                <div>
                                    <Label>
                                        To Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={toOpen} onOpenChange={setToOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal">
                                                {toDate ? format(toDate, 'yyyy-MM-dd') : 'Select end date'}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={toDate}
                                                onSelect={(d) => {
                                                    setToDate(d);
                                                    setToOpen(false);
                                                    if (d) setData('to_date', format(d, 'yyyy-MM-dd'));
                                                }}
                                                disabled={(date) => date < (fromDate || today)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.to_date} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="partial"
                                        checked={data.is_partial_day}
                                        onCheckedChange={(checked) => setData('is_partial_day', checked === true)}
                                    />
                                    <Label htmlFor="partial" className="font-normal">
                                        This is a partial day absence
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Label>
                                Reason for Absence <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                placeholder="Please provide details about your absence request..."
                                rows={4}
                                required
                            />
                            <InputError message={errors.reason} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-2">
                            <Button type="submit" className="bg-main text-black hover:bg-green-300" disabled={processing}>
                                {processing ? 'Submitting...' : 'Submit Request'}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeNow} disabled={processing}>
                                Cancel
                            </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Your request will be sent to your manager for approval. You will receive an email notification once reviewed.
                        </div>
                    </div>
                </form>

                <DialogFooter className="hidden" />
            </DialogContent>
        </Dialog>
    );
};

export default AddAbsenceModal;
