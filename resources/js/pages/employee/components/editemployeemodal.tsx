import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee, Employees, initialEmployeeFormData } from '@/hooks/employees';
import { usePermission } from '@/hooks/user-permission';
import { useForm } from '@inertiajs/react';
import { DialogDescription } from '@radix-ui/react-dialog';
import { ChevronDownIcon, User } from 'lucide-react';
import React, { FormEventHandler, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    departments as departmentsData,
    gender as genderData,
    getPositionsForDepartment,
    maritalStatus as maritalStatusData,
    workStatus as workStatusData,
} from '../../../hooks/data';
import EmployeeQrCodeModal from './employee-qr-code-modal';

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
    onUpdate: (employee: Employee) => void;
}

const EditEmployeeModal = ({ isOpen, onClose, employee, onUpdate }: EditEmployeeModalProps) => {
    const { can } = usePermission();
    const [open, setOpen] = useState(false);
    const [openBirth, setOpenBirth] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [birth, setBirth] = useState<Date | undefined>(undefined);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [availablePositions, setAvailablePositions] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [savedEmployee, setSavedEmployee] = useState<any | null>(null);
    const [showQrCodeModal, setShowQrCodeModal] = useState(false);

    const { data, setData, errors, processing, reset, post } = useForm<Employees & { _method: string }>({
        ...initialEmployeeFormData,
        _method: 'PUT',
    });

    useEffect(() => {
        if (employee) {
            setData(
                (prev) =>
                    ({
                        ...prev,
                        employeeid: employee.employeeid,
                        employee_name: employee.employee_name,
                        firstname: employee.firstname,
                        middlename: employee.middlename || '',
                        lastname: employee.lastname,
                        gender: employee.gender,
                        department: employee.department,
                        position: employee.position,
                        phone: employee.phone,
                        work_status: employee.work_status,
                        marital_status: employee.marital_status,
                        service_tenure: employee.service_tenure,
                        date_of_birth: employee.date_of_birth,
                        email: employee.email,
                        address: employee.address,
                        city: employee.city || '',
                        state: employee.state || '',
                        country: employee.country || '',
                        zip_code: employee.zip_code || '',
                        picture: null, // ensure File|null
                        philhealth_user_id: employee.philhealth_user_id || '',
                        sss_user_id: employee.sss_user_id || '',
                        hdmf_user_id: employee.hdmf_user_id || '',
                        tin_user_id: employee.tin_user_id || '',
                        gmail_password: employee.gmail_password || '',
                        nbi_clearance: null, // ensure File|null
                        _method: 'PUT',
                    }) as unknown as Employees & { _method: string },
            );

            if (employee.picture) {
                setPreview(employee.picture);
            }

            if (employee.service_tenure) {
                setDate(new Date(employee.service_tenure));
            }
            if (employee.date_of_birth) {
                setBirth(new Date(employee.date_of_birth));
            }
        }
    }, [employee]);


    // Update available positions when department changes
    useEffect(() => {
        if (data.department) {
            const positions = getPositionsForDepartment(data.department);
            setAvailablePositions(positions);
        } else {
            setAvailablePositions([]);
        }
    }, [data.department]);

    // Flow helpers based on Work Status
    const hasWorkStatus = !!data.work_status;

    const handleProfileImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                handleFileSelection(file);
            }
        };
        input.click();
    };

    const handleFileSelection = (file: File) => {
        if (!file.type.match('image.*')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setPreview(result);
        };
        reader.readAsDataURL(file);

        setSelectedFile(file);
        setData('picture', file);
    };

    const closeModalWithDelay = (delay: number = 1000) => {
        setTimeout(() => {
            onClose();
            reset();
            setDate(undefined);
            setBirth(undefined);
            setPreview('');
            setSelectedFile(null);
        }, delay);
    };

    const handleSubmit: FormEventHandler = (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        // Update the form data before submission
        setData(formData);

        post(route('employee.update', employee?.id), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Employee updated successfully! Generating QR code...');

                // Save employee data for fingerprint modal
                if (employee) {
                    const updatedEmployee = {
                        ...employee,
                        employeeid: formData.employeeid,
                        firstname: formData.firstname,
                        middlename: formData.middlename,
                        lastname: formData.lastname,
                        gender: formData.gender,
                        department: formData.department,
                        position: formData.position,
                        phone: formData.phone,
                        work_status: formData.work_status,
                        marital_status: formData.marital_status,
                        service_tenure: formData.service_tenure,
                        date_of_birth: formData.date_of_birth,
                        email: formData.email,
                    };

                    setSavedEmployee(updatedEmployee);
                    onUpdate(updatedEmployee);

                    // Reset form but keep savedEmployee for QR code modal
                    reset();
                    setDate(undefined);
                    setBirth(undefined);
                    setPreview('');
                    setSelectedFile(null);

                    // Set QR code modal to open first, then close main modal
                    // This ensures the QR modal state is set before the main modal closes
                    setShowQrCodeModal(true);
                    
                    // Close main modal after a brief delay
                    setTimeout(() => {
                        onClose();
                    }, 100);
                } else {
                    closeModalWithDelay(1200);
                }
            },
            onError: (errors: any) => {
                console.error('Validation errors:', errors);

                // Show specific error messages for better user experience
                if (errors.employeeid) {
                    toast.error(`Employee ID Error: ${errors.employeeid}`);
                } else if (errors.email) {
                    toast.error(`Email Error: ${errors.email}`);
                } else if (errors.firstname) {
                    toast.error(`First Name Error: ${errors.firstname}`);
                } else if (errors.lastname) {
                    toast.error(`Last Name Error: ${errors.lastname}`);
                } else if (errors.gender) {
                    toast.error(`Gender Error: ${errors.gender}`);
                } else if (errors.department) {
                    toast.error(`Department Error: ${errors.department}`);
                } else if (errors.position) {
                    toast.error(`Position Error: ${errors.position}`);
                } else if (errors.work_status) {
                    toast.error(`Work Status Error: ${errors.work_status}`);
                } else if (errors.marital_status) {
                    toast.error(`Marital Status Error: ${errors.marital_status}`);
                } else if (errors.date_of_birth) {
                    toast.error(`Date of Birth Error: ${errors.date_of_birth}`);
                } else if (errors.service_tenure) {
                    toast.error(`Service Tenure Error: ${errors.service_tenure}`);
                } else if (errors.address) {
                    toast.error(`Address Error: ${errors.address}`);
                } else if (errors.city) {
                    toast.error(`City Error: ${errors.city}`);
                } else if (errors.state) {
                    toast.error(`State Error: ${errors.state}`);
                } else if (errors.country) {
                    toast.error(`Country Error: ${errors.country}`);
                } else if (errors.zip_code) {
                    toast.error(`Zip Code Error: ${errors.zip_code}`);
                } else if (errors.phone) {
                    toast.error(`Phone Error: ${errors.phone}`);
                } else if (errors.picture) {
                    toast.error(`Profile Picture Error: ${errors.picture}`);
                } else {
                    toast.error('Please check all required fields and try again.');
                }
            },
            onFinish: () => {
                setLoading(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="border-main max-h-[90vh] min-w-2xl overflow-y-auto border-2 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-main">Update Employee</DialogTitle>
                        <DialogDescription className="text-muted-foreground">Employee details updating</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-2">
                        {message && (
                            <div className={`rounded p-2 ${message.type === 'success' ? 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-200'}`}>
                                {message.text}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="md:col-span-2">
                                <div className="flex">
                                    <Label className="mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        Profile Image
                                        <span className="text-[15px] font-medium text-muted-foreground">(optional)</span>
                                    </Label>
                                </div>

                                {/* <Input type="file" name="picture" onChange={handleFileChange} className="w-full" accept="image/*" /> */}
                            </div>
                            <div
                                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-6 transition-colors hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30"
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
                                        <p className="font-medium text-green-800 dark:text-green-200">Profile Image Selected</p>
                                        <p className="text-sm text-green-600 dark:text-green-400">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                            <User className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-600 dark:text-gray-300">No Profile Image</p>
                                        <p className="text-sm text-gray-500">Click to select image</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Employee ID</Label>
                                <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                <Input
                                    type="text"
                                    placeholder="Enter employee id...."
                                    value={data.employeeid}
                                    onChange={(e) => setData('employeeid', e.target.value)}
                                    className={`border-main focus:border-green-500 ${errors.employeeid ? 'border-red-500 focus:border-red-500' : ''}`}
                                    aria-invalid={!!errors.employeeid}
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
                                    className={`border-main focus:border-green-500 ${errors.firstname ? 'border-red-500 focus:border-red-500' : ''}`}
                                    aria-invalid={!!errors.firstname}
                                />
                                <InputError message={errors.firstname} />
                            </div>
                            <div>
                                <Label>Middlename</Label>
                                <span className="ms-2 text-[15px] font-medium text-muted">*</span>
                                <Input
                                    type="text"
                                    placeholder="Enter middlename"
                                    value={data.middlename}
                                    onChange={(e) => setData('middlename', e.target.value)}
                                    className="border-main focus:border-green-500"
                                />
                            </div>
                            <div>
                                <Label>Lastname</Label>
                                <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                <Input
                                    type="text"
                                    placeholder="Enter lastname"
                                    value={data.lastname}
                                    onChange={(e) => setData('lastname', e.target.value)}
                                    className={`border-main focus:border-green-500 ${errors.lastname ? 'border-red-500 focus:border-red-500' : ''}`}
                                    aria-invalid={!!errors.lastname}
                                />
                                <InputError message={errors.lastname} />
                            </div>
                            {/* Email moved to Contact Information section */}

                            <div>
                                <Label htmlFor="gender">Gender</Label>
                                <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                <Select value={data.gender} onValueChange={(value) => setData('gender', value)} aria-invalid={!!errors.gender}>
                                    <SelectTrigger
                                        className={`border-main focus:border-green-500 ${errors.gender ? 'border-red-500 focus:border-red-500' : ''}`}
                                    >
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {genderData.map((gend) => (
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
                                    <Label htmlFor="dateBirth" className="px-1">
                                        Date of Birth
                                    </Label>
                                    <Popover open={openBirth} onOpenChange={setOpenBirth}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="date"
                                                className="border-main w-48 justify-between font-normal sm:w-auto"
                                                aria-invalid={!!errors.date_of_birth}
                                            >
                                                {birth ? birth.toLocaleDateString() : 'Select birth'}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={birth}
                                                captionLayout="dropdown"
                                                onSelect={(selectedBirth: Date | undefined) => {
                                                    setBirth(selectedBirth);
                                                    setOpenBirth(false);
                                                    if (selectedBirth) {
                                                        const localDateString = selectedBirth.toLocaleDateString('en-CA');
                                                        setData('date_of_birth', localDateString);
                                                    }
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.date_of_birth} />
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="date" className="px-1">
                                        Lenght of Service
                                    </Label>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="date"
                                                className="border-main w-48 justify-between font-normal sm:w-auto"
                                                aria-invalid={!!errors.service_tenure}
                                            >
                                                {date ? date.toLocaleDateString() : 'Select date'}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                captionLayout="dropdown"
                                                onSelect={(selectedDate: Date | undefined) => {
                                                    setDate(selectedDate);
                                                    setOpen(false);
                                                    if (selectedDate) {
                                                        const localDateString = selectedDate.toLocaleDateString('en-CA');
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
                                    onValueChange={(value) => setData('work_status', value)}
                                    aria-invalid={!!errors.work_status}
                                >
                                    <SelectTrigger className="border-main focus:border-green-500">
                                        <SelectValue placeholder="Select Work Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {workStatusData.map((work_stat) => (
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
                                    onValueChange={(value) => setData('department', value)}
                                    aria-invalid={!!errors.department}
                                >
                                    <SelectTrigger className="border-main focus:border-green-500">
                                        <SelectValue placeholder="Select Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departmentsData.map((dept) => (
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
                                    onValueChange={(value) => setData('position', value)}
                                    disabled={!data.department}
                                    aria-invalid={!!errors.position}
                                >
                                    <SelectTrigger className="border-main focus:border-green-500">
                                        <SelectValue placeholder={data.department ? 'Select Positions' : 'Select Department first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availablePositions.length > 0 ? (
                                            availablePositions.map((pos) => (
                                                <SelectItem key={pos} value={pos}>
                                                    {pos}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                {data.department ? 'No positions available' : 'Select Department first'}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.position} />
                            </div>
                            <div>
                                <Label htmlFor="status">Marital Status</Label>
                                <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                <Select
                                    value={data.marital_status}
                                    onValueChange={(value) => setData('marital_status', value)}
                                    aria-invalid={!!errors.marital_status}
                                >
                                    <SelectTrigger className="border-main focus:border-green-500">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {maritalStatusData.map((stat) => (
                                            <SelectItem key={stat} value={stat}>
                                                {stat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.marital_status} />
                            </div>
                            {/* <div>
                            <Label>Nationality</Label>
                            // {/* <span className="ms-2 text-[15px] font-medium text-red-600">*</span> *
                            <Input
                                type="text"
                                placeholder="Enter your nationality..."
                                value={data.nationality}
                                onChange={(e) => setData('nationality', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                            />
                        </div> */}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Contact Information</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="col-span-2">
                                <Label>Address</Label>
                                {/* <span className="ms-2 text-[15px] font-medium text-red-600">*</span> */}
                                <Input
                                    type="text"
                                    placeholder="Enter your address..."
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="border-green-300 focus:border-cfar-500"
                                    aria-invalid={!!errors.address}
                                />
                                <InputError message={errors.address} />
                            </div>
                            <div>
                                <Label>City</Label>
                                {/* <span className="ms-2 text-[15px] font-medium text-red-600">*</span> */}
                                <Input
                                    type="text"
                                    placeholder="Enter your city..."
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    className="border-green-300 focus:border-cfar-500"
                                    aria-invalid={!!errors.city}
                                />
                                <InputError message={errors.city} />
                            </div>
                            <div>
                                <Label htmlFor="phone">
                                    Phone
                                    <span className="text-[10px] font-medium text-muted-foreground">(optional)</span>
                                </Label>
                                <Input
                                    id="phone"
                                    type="text"
                                    placeholder="Enter phone number..."
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="border-green-300 focus:border-cfar-500"
                                    aria-invalid={!!errors.phone}
                                />
                                <InputError message={errors.phone} />
                            </div>
                            <div>
                                <Label htmlFor="state">State</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter your state..."
                                    value={data.state}
                                    onChange={(e) => setData('state', e.target.value)}
                                    className="border-green-300 focus:border-cfar-500"
                                    aria-invalid={!!errors.state}
                                />
                                <InputError message={errors.state} />
                            </div>
                            <div>
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter your country..."
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                    className="border-green-300 focus:border-cfar-500"
                                    aria-invalid={!!errors.country}
                                />
                                <InputError message={errors.country} />
                            </div>
                            <div>
                                <Label htmlFor="zip_code">Zip Code</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter your zip code..."
                                    value={data.zip_code}
                                    onChange={(e) => setData('zip_code', e.target.value)}
                                    className="border-green-300 focus:border-cfar-500"
                                    aria-invalid={!!errors.zip_code}
                                />
                                <InputError message={errors.zip_code} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold">Gmail Account</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Email Address</Label>
                                <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                <Input
                                    type="email"
                                    placeholder="Enter email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`border-green-300 focus:border-cfar-500 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                                    aria-invalid={!!errors.email}
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div>
                                <Label>Password</Label>
                                <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                <Input
                                    type="text"
                                    placeholder="Enter password..."
                                    value={data.gmail_password}
                                    onChange={(e) => setData('gmail_password', e.target.value)}
                                    className="border-green-300 focus:border-cfar-500"
                                    aria-invalid={!!errors.gmail_password}
                                />
                                <InputError message={errors.gmail_password} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Gov Account:</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>HDMF Number</Label>
                                    <Input
                                        type="text"
                                        placeholder="Enter number..."
                                        value={data.hdmf_user_id}
                                        onChange={(e) => setData('hdmf_user_id', e.target.value)}
                                        className={`border-green-300 focus:border-cfar-500 ${errors.hdmf_user_id ? 'border-red-500 focus:border-red-500' : ''}`}
                                        aria-invalid={!!errors.hdmf_user_id}
                                    />
                                    <InputError message={errors.hdmf_user_id} />
                                </div>
                                <div>
                                    <Label>SSS Number</Label>
                                    <Input
                                        type="text"
                                        placeholder="Enter number..."
                                        value={data.sss_user_id}
                                        onChange={(e) => setData('sss_user_id', e.target.value)}
                                        className={`border-green-300 focus:border-cfar-500 ${errors.sss_user_id ? 'border-red-500 focus:border-red-500' : ''}`}
                                        aria-invalid={!!errors.sss_user_id}
                                    />
                                    <InputError message={errors.sss_user_id} />
                                </div>
                                <div>
                                    <Label>Philhealth Number</Label>
                                    <Input
                                        type="text"
                                        placeholder="Enter number..."
                                        value={data.philhealth_user_id}
                                        onChange={(e) => setData('philhealth_user_id', e.target.value)}
                                        className="border-green-300 focus:border-cfar-500"
                                        aria-invalid={!!errors.philhealth_user_id}
                                    />
                                    <InputError message={errors.philhealth_user_id} />
                                </div>
                                <div>
                                    <Label htmlFor="state">Tin Number</Label>
                                    <Input
                                        type="number"
                                        placeholder="Enter number.."
                                        value={data.tin_user_id}
                                        onChange={(e) => setData('tin_user_id', e.target.value)}
                                        className="border-green-300 focus:border-cfar-500"
                                        aria-invalid={!!errors.tin_user_id}
                                    />
                                    <InputError message={errors.tin_user_id} />
                                </div>
                            </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => closeModalWithDelay(0)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="main" disabled={processing || loading}>
                                {processing || loading ? 'Updating...' : 'Update Employee'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* QR Code Modal */}
            <EmployeeQrCodeModal
                isOpen={showQrCodeModal && !!savedEmployee}
                onClose={() => {
                    setShowQrCodeModal(false);
                    setSavedEmployee(null);
                }}
                employee={savedEmployee}
            />
        </>
    );
};

export default EditEmployeeModal;
