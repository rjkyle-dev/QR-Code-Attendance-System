import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employees, initialEmployeeFormData } from '@/hooks/employees';
import { usePermission } from '@/hooks/user-permission';
import { useForm } from '@inertiajs/react';
import { ChevronDownIcon, Save, User } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    departments as departmentsData,
    gender as genderData,
    getPositionsForDepartment,
    maritalStatus as maritalStatusData,
    workStatus as workStatusData,
} from '../../../hooks/data';
import EmployeeQrCodeModal from './employee-qr-code-modal';

interface EmployeeDetails {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const AddEmployeeModal = ({ isOpen, onClose, onSuccess }: EmployeeDetails) => {
    const { can } = usePermission();
    const [openService, setOpenService] = useState(false);
    const [openBirth, setOpenBirth] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [birth, setBirth] = useState<Date | undefined>(undefined);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [availablePositions, setAvailablePositions] = useState<string[]>([]);

    const [preview, setPreview] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [nbiClearancePreview, setNbiClearancePreview] = useState<string>('');
    const [selectedNbiClearanceFile, setSelectedNbiClearanceFile] = useState<File | null>(null);
    const [nbiClearanceFileName, setNbiClearanceFileName] = useState<string>('');

    const [savedEmployee, setSavedEmployee] = useState<any | null>(null); // Store created employee object
    const [showQrCodeModal, setShowQrCodeModal] = useState(false);

    const { data, setData, errors, processing, reset, post } = useForm<Employees>(initialEmployeeFormData);

    interface FlashProps extends Record<string, any> {
        flash?: {
            success?: string;
            error?: string;
        };
    }

    const handleProfileImageUpload = () => {
        // Create a file input element to upload the image
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*'; // Allow only image files

        // When a file is selected, handle the file and update preview
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            console.log('Selected file:', file);
            if (file) {
                // Update the file state and show the image preview
                setSelectedFile(file);

                // Preview the image
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    console.log('Selected file:', result);

                    setPreview(result); // Set the preview for the image
                };
                reader.readAsDataURL(file);

                // Attach the image to the form data
                setData('picture', file); // Add image to the form data for submission
            }
        };

        input.click(); // Trigger the file input click to open file explorer
    };

    const handleNbiClearanceUpload = () => {
        // Create a file input element to upload the NBI Clearance
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.txt,.rtf'; // Allow various document and image formats

        // When a file is selected, handle the file and update preview
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            console.log('Selected NBI Clearance file:', file);
            if (file) {
                // Validate file size (max 10MB)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    toast.error('File size must be less than 10MB');
                    return;
                }

                // Validate file type
                const allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/gif',
                    'image/bmp',
                    'image/tiff',
                    'text/plain',
                    'application/rtf',
                ];

                if (!allowedTypes.includes(file.type)) {
                    toast.error('Please select a valid file type (PDF, Word, Image, or Text)');
                    return;
                }

                // Update the file state
                setSelectedNbiClearanceFile(file);
                setNbiClearanceFileName(file.name);

                // Preview for images
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const result = e.target?.result as string;
                        setNbiClearancePreview(result);
                    };
                    reader.readAsDataURL(file);
                } else {
                    // For non-image files, show file info
                    setNbiClearancePreview('');
                }

                // Attach the file to the form data
                setData('nbi_clearance', file);
                toast.success('NBI Clearance uploaded successfully!');
            }
        };

        input.click(); // Trigger the file input click to open file explorer
    };


    // Update available positions when department changes
    useEffect(() => {
        if (data.department) {
            const positions = getPositionsForDepartment(data.department);
            setAvailablePositions(positions);
            // Reset position when department changes
            setData('position', '');
        } else {
            setAvailablePositions([]);
            setData('position', '');
        }
    }, [data.department, setData]);

    // Flow helpers based on Work Status
    const hasWorkStatus = !!data.work_status;

    const closeModalWithDelay = (delay: number = 1000) => {
        setTimeout(() => {
            onClose();
            reset();
            setDate(undefined);
            setBirth(undefined); // <-- Reset Date of Birth
            setPreview('');
            setSelectedFile(null);
            setNbiClearancePreview('');
            setSelectedNbiClearanceFile(null);
            setNbiClearanceFileName('');
            setSavedEmployee(null);
            setShowQrCodeModal(false);
        }, delay);
    };

    // Save employee info (step 1)
    const handleSaveInfo: FormEventHandler = async (event) => {
        event.preventDefault();
        if (savedEmployee) return; // Prevent double submit

        const formData = { ...data };

        // Debug log the form data being sent
        console.log('Form data being submitted:', formData);

        // Update the form data before submission
        setData(formData);

        post(route('employee.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: async (page) => {
                // Employee created successfully
                console.log('Employee created successfully:', formData);

                // Fetch the created employee to get the auto-generated employeeid (for Add Crew) or verify the employeeid
                try {
                    // Wait a bit for the database to be updated
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    const response = await fetch(`/api/employee/all`);
                    const employees = await response.json();

                    let foundEmployee = null;

                    // Find employee by employeeid
                    if (formData.employeeid) {
                        foundEmployee = employees.find((emp: any) => emp.employeeid === formData.employeeid);
                    }

                    if (foundEmployee) {
                        setSavedEmployee({
                            ...formData,
                            employeeid: foundEmployee.employeeid,
                            id: foundEmployee.id,
                        });
                    } else {
                        setSavedEmployee({ ...formData });
                        console.warn('Could not find created employee in API response');
                    }
                } catch (error) {
                    console.error('Error fetching employee:', error);
                    setSavedEmployee({ ...formData });
                }

                toast.success('Employee info saved! Generating QR code...');

                // Reset form but keep savedEmployee for QR code modal
                reset();
                setDate(undefined);
                setBirth(undefined);
                setPreview('');
                setSelectedFile(null);
                setRecommendationPreview('');
                setSelectedRecommendationFile(null);
                setRecommendationFileName('');

                // Close main modal and open QR code modal
                // Use setTimeout to ensure state is set before modal transition
                setTimeout(() => {
                    onClose();
                    setShowQrCodeModal(true);
                }, 100);

                // Call the onSuccess callback to refresh the employee list
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                console.log('Form data that failed:', formData);

                // Show all errors in console for debugging
                Object.keys(errors).forEach((key) => {
                    console.error(`Error for ${key}:`, errors[key]);
                });

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
                } else if (errors.nbi_clearance) {
                    toast.error(`NBI Clearance Error: ${errors.nbi_clearance}`);
                } else {
                    toast.error('Please check all required fields and try again.');
                }
            },
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-h-[90vh] min-w-2xl overflow-y-auto border-2 border-cfar-500 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-green-800">Add New Employee</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveInfo} className="space-y-2">
                        {message && (
                            <div className={`rounded p-2 ${message.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="md:col-span-2">
                                <div className="flex">
                                    <Label className="mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4 text-green-600" />
                                        Profile Image
                                        <span className="text-[15px] font-medium text-muted-foreground">(optional)</span>
                                    </Label>
                                </div>

                                {/* <Input type="file" name="picture" onChange={handleFileChange} className="w-full" accept="image/*" /> */}
                            </div>
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
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="work_status">Work Status</Label>
                                <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                <Select
                                    value={data.work_status}
                                    onValueChange={(value) => {
                                        console.log('Selected Work Status:', value);
                                        setData('work_status', value);
                                    }}
                                    aria-invalid={!!errors.work_status}
                                >
                                    <SelectTrigger className="border-green-300 focus:border-cfar-500">
                                        <SelectValue placeholder="Select Work Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {workStatusData.map((work_status: string) => (
                                            <SelectItem key={work_status} value={work_status}>
                                                {work_status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.work_status} />
                            </div>
                            <div className="">
                                <Label>Employee ID</Label>
                                <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                <Input
                                    type="text"
                                    placeholder="Enter employee id...."
                                    value={data.employeeid}
                                    onChange={(e) => setData('employeeid', e.target.value)}
                                    className={`border-green-300 focus:border-cfar-500 ${errors.employeeid ? 'border-red-500 focus:border-red-500' : ''}`}
                                    aria-invalid={!!errors.employeeid}
                                />
                                <InputError message={errors.employeeid} />
                            </div>
                            <>
                                <div>
                                    <Label>Firstname</Label>
                                    <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                    <Input
                                        type="text"
                                        placeholder="Enter firstname"
                                        value={data.firstname}
                                        onChange={(e) => setData('firstname', e.target.value)}
                                        className={`border-green-300 focus:border-cfar-500 ${errors.firstname ? 'border-red-500 focus:border-red-500' : ''}`}
                                        aria-invalid={!!errors.firstname}
                                    />
                                    <InputError message={errors.firstname} />
                                </div>
                                <div>
                                    <Label>
                                        Middlename
                                        <span className="text-[10px] font-medium text-muted-foreground">(optional)</span>
                                    </Label>
                                    <span className="ms-2 text-[15px] font-medium text-muted">*</span>
                                    <Input
                                        type="text"
                                        placeholder="Enter middlename"
                                        value={data.middlename}
                                        onChange={(e) => setData('middlename', e.target.value)}
                                        className="border-green-300 focus:border-cfar-500"
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
                                        className={`border-green-300 focus:border-cfar-500 ${errors.lastname ? 'border-red-500 focus:border-red-500' : ''}`}
                                        aria-invalid={!!errors.lastname}
                                    />
                                    <InputError message={errors.lastname} />
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
                                        aria-invalid={!!errors.gender}
                                    >
                                        <SelectTrigger
                                            className={`border-green-300 focus:border-cfar-500 ${errors.gender ? 'border-red-500 focus:border-red-500' : ''}`}
                                        >
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {genderData.map((gender: string) => (
                                                <SelectItem key={gender} value={gender}>
                                                    {gender}
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
                                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                        </Label>

                                        <Popover open={openBirth} onOpenChange={setOpenBirth}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    id="date"
                                                    className="w-full justify-between border-green-300 font-normal focus:border-cfar-500"
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
                                                            const localDateString = selectedBirth.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
                                                            console.log('Selected Local Date:', localDateString);
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
                                            Date Hired
                                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                        </Label>
                                        <Popover open={openService} onOpenChange={setOpenService}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    id="date"
                                                    className="w-full justify-between border-green-300 font-normal focus:border-cfar-500"
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
                                                        setOpenService(false);
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
                                    <Label htmlFor="departments">Departments</Label>
                                    <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                    <Select
                                        value={data.department}
                                        onValueChange={(value) => {
                                            console.log('Selected Departments:', value);
                                            setData('department', value);
                                        }}
                                        aria-invalid={!!errors.department}
                                    >
                                        <SelectTrigger className="border-green-300 focus:border-cfar-500">
                                            <SelectValue placeholder="Select Departments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departmentsData.map((dept: string) => (
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
                                        disabled={!data.department}
                                        aria-invalid={!!errors.position}
                                    >
                                        <SelectTrigger className="border-green-300 focus:border-cfar-500">
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
                                    <Label htmlFor="marital_status">Marital Status</Label>
                                    <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                    <Select
                                        value={data.marital_status}
                                        onValueChange={(value) => {
                                            console.log('Selected Marital Status:', value);
                                            setData('marital_status', value);
                                        }}
                                        aria-invalid={!!errors.marital_status}
                                    >
                                        <SelectTrigger className="border-green-300 focus:border-cfar-500">
                                            <SelectValue placeholder="Select Marital Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {maritalStatusData.map((maritalStatus: string) => (
                                                <SelectItem key={maritalStatus} value={maritalStatus}>
                                                    {maritalStatus}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.marital_status} />
                                </div>
                                {/* <div>
                            <Label>
                                Nationality
                                <span className="text-[10px] font-medium text-muted-foreground">(optional)</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="Enter your nationality..."
                                value={data.nationality}
                                onChange={(e) => setData('nationality', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                            />
                        </div> */}
                            </>
                        </div>
                        <div className="mt-4"></div>
                        <>
                            <div>
                                <h3 className="text-lg font-bold">Contact Information</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="">
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
                        </>
                        <div><h3 className="text-lg font-bold">Gmail Account</h3></div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Email Address</Label>
                                <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                <Input
                                    type="email"
                                    placeholder="Enter email..."
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
                        <div><h3 className="text-lg font-bold">HDMF</h3></div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>ID</Label>

                                    <Input
                                        type="text"
                                        placeholder="Enter user id..."
                                        value={data.hdmf_user_id}
                                        onChange={(e) => setData('hdmf_user_id', e.target.value)}
                                        className={`border-green-300 focus:border-cfar-500 ${errors.hdmf_user_id ? 'border-red-500 focus:border-red-500' : ''}`}
                                        aria-invalid={!!errors.hdmf_user_id}
                                    />
                                    <InputError message={errors.hdmf_user_id} />
                                </div>
                                <div>
                                    <Label>Username/Email Address</Label>

                                    <Input
                                        type="text"
                                        placeholder="Enter username/email address..."
                                        value={data.hdmf_username}
                                        onChange={(e) => setData('hdmf_username', e.target.value)}
                                        className={`border-green-300 focus:border-cfar-500 ${errors.hdmf_username ? 'border-red-500 focus:border-red-500' : ''}`}
                                        aria-invalid={!!errors.hdmf_username}
                                    />
                                    <InputError message={errors.hdmf_username} />
                                </div>
                                {can('Add Password') && (
                                    <div>
                                        <Label>Password</Label>

                                        <Input
                                            type="text"
                                            placeholder="Enter password..."
                                            value={data.hdmf_password}
                                            onChange={(e) => setData('hdmf_password', e.target.value)}
                                            className="border-green-300 focus:border-cfar-500"
                                            aria-invalid={!!errors.hdmf_password}
                                        />
                                        <InputError message={errors.hdmf_password} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SSS */}
                        <>
                            <div>
                                <h3 className="text-lg font-bold">SSS</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>ID</Label>

                                        <Input
                                            type="text"
                                            placeholder="Enter user id..."
                                            value={data.sss_user_id}
                                            onChange={(e) => setData('sss_user_id', e.target.value)}
                                            className={`border-green-300 focus:border-cfar-500 ${errors.sss_user_id ? 'border-red-500 focus:border-red-500' : ''}`}
                                            aria-invalid={!!errors.sss_user_id}
                                        />
                                        <InputError message={errors.sss_user_id} />
                                    </div>
                                    <div>
                                        <Label>Username/Email Address</Label>
                                        {/* */}
                                        <Input
                                            type="text"
                                            placeholder="Enter your username/email address..."
                                            value={data.sss_username}
                                            onChange={(e) => setData('sss_username', e.target.value)}
                                            className="border-green-300 focus:border-cfar-500"
                                            aria-invalid={!!errors.sss_username}
                                        />
                                        <InputError message={errors.sss_username} />
                                    </div>
                                    {can('Add Password') && (
                                        <div>
                                            <Label>Password</Label>

                                            <Input
                                                type="text"
                                                placeholder="Enter password..."
                                                value={data.sss_password}
                                                onChange={(e) => setData('sss_password', e.target.value)}
                                                className="border-green-300 focus:border-cfar-500"
                                                aria-invalid={!!errors.sss_password}
                                            />
                                            <InputError message={errors.sss_password} />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Philhealth */}
                        <>
                            <div>
                                <h3 className="text-lg font-bold">Philhealth</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>ID</Label>

                                    <Input
                                        type="text"
                                        placeholder="Enter user id..."
                                        value={data.philhealth_user_id}
                                        onChange={(e) => setData('philhealth_user_id', e.target.value)}
                                        className={`border-green-300 focus:border-cfar-500 ${errors.philhealth_user_id ? 'border-red-500 focus:border-red-500' : ''}`}
                                        aria-invalid={!!errors.philhealth_user_id}
                                    />
                                    <InputError message={errors.philhealth_user_id} />
                                </div>
                                <div>
                                    <Label>Username/Email Address</Label>
                                    {/* */}
                                    <Input
                                        type="text"
                                        placeholder="Enter your philhealth..."
                                        value={data.philhealth_username}
                                        onChange={(e) => setData('philhealth_username', e.target.value)}
                                        className="border-green-300 focus:border-cfar-500"
                                        aria-invalid={!!errors.philhealth_username}
                                    />
                                    <InputError message={errors.philhealth_username} />
                                </div>
                                {can('Add Password') && (
                                    <div className="">
                                        <Label>Philhealth Password</Label>
                                        {/* */}
                                        <Input
                                            type="text"
                                            placeholder="Enter your philhealth..."
                                            value={data.philhealth_password}
                                            onChange={(e) => setData('philhealth_password', e.target.value)}
                                            className="border-green-300 focus:border-cfar-500"
                                            aria-invalid={!!errors.philhealth_password}
                                        />
                                        <InputError message={errors.philhealth_password} />
                                    </div>
                                )}
                            </div>
                        </>
                        <div><h3 className="text-lg font-bold">Tin</h3></div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="state">ID</Label>
                                <Input
                                    type="number"
                                    placeholder="Enter your id.."
                                    value={data.tin_user_id}
                                    onChange={(e) => setData('tin_user_id', e.target.value)}
                                    className="border-green-300 focus:border-cfar-500"
                                    aria-invalid={!!errors.tin_user_id}
                                />
                                <InputError message={errors.tin_user_id} />
                            </div>
                            <div>
                                <Label htmlFor="state">Username/Email Address</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter your username/email address.."
                                    value={data.tin_username}
                                    onChange={(e) => setData('tin_username', e.target.value)}
                                    className="border-green-300 focus:border-cfar-500"
                                    aria-invalid={!!errors.tin_username}
                                />
                                <InputError message={errors.tin_username} />
                            </div>
                            {can('Add Password') && (
                                <div>
                                    <Label htmlFor="state">Tin Password</Label>
                                    <Input
                                        type="text"
                                        placeholder="Enter your tin_password.."
                                        value={data.tin_password}
                                        onChange={(e) => setData('tin_password', e.target.value)}
                                        className="border-green-300 focus:border-cfar-500"
                                        aria-invalid={!!errors.tin_password}
                                    />
                                    <InputError message={errors.tin_password} />
                                </div>
                            )}
                        </div>
                        <div><h3 className="text-lg font-bold">NBI Clearance</h3></div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="col-span-2">
                                    <Label>Upload NBI Clearance</Label>
                                    <div
                                        className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-6 transition-colors hover:bg-green-100"
                                        onClick={handleNbiClearanceUpload}
                                    >
                                        {selectedNbiClearanceFile ? (
                                            <div className="text-center">
                                                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="font-medium text-green-800">File Selected</p>
                                                <p className="text-sm text-green-600">{nbiClearanceFileName}</p>
                                                <p className="text-xs text-gray-500">Click to change</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="font-medium text-gray-600">No File Selected</p>
                                                <p className="text-sm text-gray-500">Click to select file (PDF, Word, Image, or Text)</p>
                                                <p className="text-xs text-gray-400">Max size: 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {nbiClearancePreview && (
                                    <div className="col-span-2">
                                        <div className="mb-2 font-medium text-green-800">File Preview:</div>
                                        <div className="flex items-center justify-center rounded-md border bg-gray-50 p-4">
                                            {nbiClearancePreview.startsWith('data:image/') ? (
                                                <img
                                                    src={nbiClearancePreview}
                                                    alt="NBI Clearance Preview"
                                                    className="max-h-48 max-w-full rounded object-contain"
                                                />
                                            ) : (
                                                <div className="flex items-center space-x-3">
                                                    <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{nbiClearanceFileName}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {selectedNbiClearanceFile?.size
                                                                ? (selectedNbiClearanceFile.size / 1024 / 1024).toFixed(2)
                                                                : '0'}{' '}
                                                            MB
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-3 ml-auto flex justify-end">
                            <Button type="submit" tabIndex={0} variant="main" disabled={processing || !!savedEmployee}>
                                {processing ? (
                                    <>
                                        <div className="n mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Info
                                    </>
                                )}
                            </Button>
                        </div>
                        {/* End of Employee Information Registration */}
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

export default AddEmployeeModal;
