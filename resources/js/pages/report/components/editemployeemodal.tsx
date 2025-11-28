import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ChevronDownIcon, Fingerprint, Upload, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Employees } from '../types/employees';
import FingerprintCapture from './fingerprintcapture';
import { Input } from '@/components/ui/input';
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';



interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employees | null;
    onUpdate: (updatedEmployee: Employees) => void;
}

// constant select options
const OPTIONS = {
    departments: ['Human Resources', 'Finance', 'IT', 'Operations', 'Production'],
    workStatuses: ['Regular', 'Add Crew'],
    positions: [
        'Harvester',
        'Accounting',
        'Manager',
        'Supervisor',
        'Driver',
        'Security',
        'Technician',
        'Support Staff',
        'Packer',
        'P&D',
        'Quality Control',
        'Logistics',
        'Warehouse Staff',
        'Maintenance',
        'Field Worker',
    ],
    statuses: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'],
    genders: ['Male', 'Female'],
};


const EditEmployeeModal = ({ isOpen, onClose, employee }: EditEmployeeModalProps) => {
    const [form, setForm] = useState({
        id: '',
        employeeid: '',
        firstname: '',
        middlename: '',
        lastname: '',
        email: '',
        phone: '',
        department: '',
        work_status: '',
        position: '',
        status: '',
        service_tenure: '',
        gender: '',
        picture: '',
    });

    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employees | null>(null);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);


    // populate form when editing
    useEffect(() => {
        if (employee) {
            console.log('Populating form with employee:', employee);
            populateForm(employee);
        }
    }, [employee]);

    const populateForm = (data: Employees) => {
        setForm({
            id: data.id,
            employeeid: data.employeeid,
            firstname: data.firstname,
            middlename: data.middlename,
            lastname: data.lastname,
            email: data.email,
            phone: data.phone,
            department: data.department,
            work_status: data.work_status,
            position: data.position,
            status: data.status,
            service_tenure: data.service_tenure,
            gender: data.gender,
            picture: data.picture,
        });
        setPreview(data.picture);

      if (data.service_tenure) {
          const parsedDate = new Date(data.service_tenure);
          setSelectedDate(parsedDate); // Set the selected date
      }
    };

    const handleInputChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
    };

    const handleProfileImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFileSelect(file);
        };
        input.click();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessage(null);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrfToken) {
            setMessage({ type: 'error', text: 'CSRF token missing! Refresh the page.' });
            setLoading(false);
            return;
        }

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (key !== 'picture') {
                formData.append(key, value);
            }
        });

        // Ensure that selectedDate is not undefined or null
         const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
        // const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : ''; // Ensure it's in YYYY-MM-DD format
        console.log('Formatted Date to submit:', formattedDate); // Debug log
        formData.append('service_tenure', formattedDate);

        if (selectedFile) formData.append('picture', selectedFile);

        formData.append('_method', 'PUT'); // Use PUT method for updating

        try {
            const response = await fetch(`/employee/${form.id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken },
                credentials: 'same-origin',
                body: formData,
            });

            if (response.ok) {
                toast.success('Employee updated successfully!');
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 1000);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to update employee.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-h-[90vh] min-w-2xl overflow-y-auto border-2 border-main shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-green-800">Edit Employee</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-2">
                        {message && (
                            <div className={`rounded p-2 ${message.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Employee ID</Label>
                                <Input type="text" value={form.employeeid} onChange={(e) => handleInputChange('employeeid', e.target.value)} />
                            </div>

                            <div>
                                <Label>First Name</Label>
                                <Input type="text" value={form.firstname} onChange={(e) => handleInputChange('firstname', e.target.value)} />
                            </div>

                            <div>
                                <Label>Middle Name</Label>
                                <Input type="text" value={form.middlename} onChange={(e) => handleInputChange('middlename', e.target.value)} />
                            </div>

                            <div>
                                <Label>Last Name</Label>
                                <Input type="text" value={form.lastname} onChange={(e) => handleInputChange('lastname', e.target.value)} />
                            </div>

                            <div>
                                <Label>Email</Label>
                                <Input type="email" value={form.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                            </div>

                            <div>
                                <Label>Phone</Label>
                                <Input type="text" value={form.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                            </div>

                            <div>
                                <Label>Gender</Label>
                                <Select value={form.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OPTIONS.genders.map((gender) => (
                                            <SelectItem key={gender} value={gender}>
                                                {gender}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="date" className="px-1">
                                        Date of Birth
                                    </Label>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" id="date" className="w-48 justify-between font-normal">
                                                {selectedDate ? selectedDate.toLocaleDateString() : form.service_tenure}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    console.log('Selected date:', date); // Log the selected date
                                                    setSelectedDate(date);
                                                    setOpen(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div>
                                <Label>Work Status</Label>
                                <Select value={form.work_status} onValueChange={(value) => handleInputChange('work_status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Work Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OPTIONS.workStatuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Department</Label>
                                <Select value={form.department} onValueChange={(value) => handleInputChange('department', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OPTIONS.departments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Position</Label>
                                <Select value={form.position} onValueChange={(value) => handleInputChange('position', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OPTIONS.positions.map((pos) => (
                                            <SelectItem key={pos} value={pos}>
                                                {pos}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select value={form.status} onValueChange={(value) => handleInputChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OPTIONS.statuses.map((stat) => (
                                            <SelectItem key={stat} value={stat}>
                                                {stat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex">
                                <Label className="mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4 text-green-600" />
                                    Profile Image
                                    <span className="text-[15px] font-medium text-muted-foreground">(optional)</span>
                                </Label>
                            </div>

                            <input type="file" name="picture" onChange={handleFileChange} className="w-full" accept="image/*" />
                        </div>
                        <div className="space-y-4">
                            <div
                                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-6 transition-colors hover:bg-green-100"
                                onClick={handleProfileImageUpload}
                            >
                                {preview ? (
                                    <div className="mb-3 text-center">
                                        <p className="mb-1 text-sm">Image Preview:</p>
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="mx-auto mb-3 h-24 w-24 rounded-full border-2 border-green-300 object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = `${'User'}&background=22c55e&color=fff`;
                                            }}
                                        />
                                        <p className="font-medium text-green-800">Profile Image Selected</p>
                                        <p className="text-sm text-green-600">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                            <User className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-600">No Profile Image</p>
                                        <p className="text-sm text-gray-500">Click to select image</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center">
                                <Button
                                    type="button"
                                    onClick={handleProfileImageUpload}
                                    className="bg-main text-black transition duration-200 ease-in hover:bg-green-300"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Profile Image
                                </Button>
                            </div>
                        </div>

                        {/* Capture */}
                        <div>
                            <Label className="mb-3 flex items-center gap-2">
                                <Fingerprint className="h-4 w-4 text-green-600" />
                                Fingerprint Capture
                            </Label>
                            <FingerprintCapture onCapture={() => {}} captured={false} />
                        </div>

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-main font-semibold text-black transition duration-200 ease-in hover:bg-green-300"
                            >
                                {loading ? 'Updating...' : 'Update Employee'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EditEmployeeModal;
