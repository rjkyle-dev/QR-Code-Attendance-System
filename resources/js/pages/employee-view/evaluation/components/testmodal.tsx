import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { ChevronDownIcon, Fingerprint, Upload, User } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';
import { toast } from 'sonner';
import FingerprintCapture from './fingerprintcapture';

type Employees = {
    employeeid: string;
    employee_name: string;
    firstname: string;
    middlename: string;
    lastname: string;
    gender: string;
    department: string;
    position: string;
    phone: string;
    work_status: string;
    status: string;
    email: string;
    service_tenure: string;
    picture: File | null;
};

const TestModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const departmentses = ['Human Resources', 'Finance', 'IT', 'Operations', 'Production'];
    const work_statuses = ['Regular', 'Add Crew'];
    const positiones = [
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
    ];
    const statuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
    const genderes = ['Male', 'Female'];

    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [employees, setEmployees] = useState<Employees[]>([]);

    interface FlashProps extends Record<string, any> {
        flash?: {
            success?: string;
            error?: string;
        };
    }

    const handleFingerprintCapture = (fingerprintData: string) => {
        ({ fingerprintImage: fingerprintData });
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setPreview(result);
        };
        reader.readAsDataURL(file);
    };

    const handleProfileImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                handleFileSelect(file);
            }
        };

        input.click();
    };

    const { data, setData, errors, processing, reset, post } = useForm<Employees>({
        employeeid: '',
        employee_name: '',
        firstname: '',
        middlename: '',
        lastname: '',
        gender: '',
        department: '',
        position: '',
        phone: '',
        work_status: '',
        status: '',
        service_tenure: '',
        email: '',
        picture: null,
        // _method: 'POST',
    });

    const closeModalWithDelay = (delay: number = 1000) => {
        setTimeout(() => {
            onClose();
            reset();
            setDate(undefined);
            setPreview('');
            setSelectedFile(null);
        }, delay);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('picture', file);
        }
    };

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        console.log('Form Data before submit:', data);
        post(route('test.store'), {
            onSuccess: (response: { props: FlashProps }) => {
                const successMessage = response.props.flash?.success || 'Category created successfully.';
                toast.success(successMessage);
                closeModalWithDelay(1200);
            },
            onError: (error: Record<string, string>) => {
                const errorMessage = error?.message || 'Failed to create category.';
                toast.error(errorMessage);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="border-main max-h-[90vh] min-w-2xl overflow-y-auto border-2 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-green-800">Add New Employee</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-2" encType="multipart/form-data">
                    {message && (
                        <div className={`rounded p-2 ${message.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label>Employee ID</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="text"
                                placeholder="Enter employee id...."
                                value={data.employeeid}
                                onChange={(e) => setData('employeeid', e.target.value)}
                                className="border-green-300 focus:border-green-500"
                            />
                            <InputError message={errors.employeeid} />
                        </div>
                        <div>
                            <Label>Firstname</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="text"
                                placeholder="Enter firstname"
                                value={data.firstname}
                                onChange={(e) => setData('firstname', e.target.value)}
                                className="border-green-300 focus:border-green-500"
                            />
                            <InputError message={errors.firstname} />
                        </div>
                        <div>
                            <Label>Middlename</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="text"
                                placeholder="Enter middlename"
                                value={data.middlename}
                                onChange={(e) => setData('middlename', e.target.value)}
                                className="border-green-300 focus:border-green-500"
                            />
                            <InputError message={errors.middlename} />
                        </div>
                        <div>
                            <Label>Lastname</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="text"
                                placeholder="Enter lastname"
                                value={data.lastname}
                                onChange={(e) => setData('lastname', e.target.value)}
                                className="border-green-300 focus:border-green-500"
                            />
                            <InputError message={errors.lastname} />
                        </div>
                        <div>
                            <Label>Email Address</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="email"
                                placeholder="Enter email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="border-green-300 focus:border-green-500"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="text"
                                placeholder="Enter phone number..."
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="border-green-300 focus:border-green-500"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select
                                value={data.gender}
                                onValueChange={(value) => {
                                    console.log('Selected Gender:', value);
                                    setData('gender', value);
                                }}
                            >
                                <SelectTrigger className="border-green-300 focus:border-green-500">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    {genderes.map((gend) => (
                                        <SelectItem key={gend} value={gend}>
                                            {gend}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.gender} />
                        </div>

                        <div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="date" className="px-1">
                                    Date of Service Tenure
                                </Label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" id="date" className="w-48 justify-between font-normal">
                                            {date ? date.toLocaleDateString() : 'Select date'}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            captionLayout="dropdown"
                                            onSelect={(selectedDate) => {
                                                setDate(selectedDate);
                                                setOpen(false);
                                                if (selectedDate) {
                                                    const localDateString = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
                                                    console.log('Selected Local Date:', localDateString);
                                                    setData('service_tenure', localDateString);
                                                }
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError message={errors.service_tenure} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="work_status">Work Status</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select
                                value={data.work_status}
                                onValueChange={(value) => {
                                    console.log('Selected Work Status:', value);
                                    setData('work_status', value);
                                }}
                            >
                                <SelectTrigger className="border-green-300 focus:border-green-500">
                                    <SelectValue placeholder="Select Work Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {work_statuses.map((work_stat) => (
                                        <SelectItem key={work_stat} value={work_stat}>
                                            {work_stat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.work_status} />
                        </div>

                        <div>
                            <Label htmlFor="departments">Departments</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select
                                value={data.department}
                                onValueChange={(value) => {
                                    console.log('Selected Departments:', value);
                                    setData('department', value);
                                }}
                            >
                                <SelectTrigger className="border-green-300 focus:border-green-500">
                                    <SelectValue placeholder="Select Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departmentses.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.department} />
                        </div>
                        <div>
                            <Label htmlFor="positions">Positions</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select
                                value={data.position}
                                onValueChange={(value) => {
                                    console.log('Selected Positions:', value);
                                    setData('position', value);
                                }}
                            >
                                <SelectTrigger className="border-green-300 focus:border-green-500">
                                    <SelectValue placeholder="Select Positions" />
                                </SelectTrigger>
                                <SelectContent>
                                    {positiones.map((pos) => (
                                        <SelectItem key={pos} value={pos}>
                                            {pos}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.position} />
                        </div>
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select
                                value={data.status}
                                onValueChange={(value) => {
                                    console.log('Selected Status:', value);
                                    setData('status', value);
                                }}
                            >
                                <SelectTrigger className="border-green-300 focus:border-green-500">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((stat) => (
                                        <SelectItem key={stat} value={stat}>
                                            {stat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
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

                        <Input type="file" name="picture" onChange={handleFileChange} className="w-full" accept="image/*" />
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

                        <div className="md:col-span-2">
                            <Label className="mb-3 flex items-center gap-2">
                                <Fingerprint className="h-4 w-4 text-green-600" />
                                Fingerprint Capture
                            </Label>
                            <FingerprintCapture onCapture={handleFingerprintCapture} captured={false} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => closeModalWithDelay(0)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-main font-semibold text-black transition duration-200 ease-in hover:bg-green-300"
                        >
                            {processing ? 'Processing...' : 'Add Payment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TestModal;
