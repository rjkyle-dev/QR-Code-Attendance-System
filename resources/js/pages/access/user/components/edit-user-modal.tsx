'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { departments as departmentList } from '@/hooks/data';
import { SingleUser } from '@/types/users';
import { router, useForm } from '@inertiajs/react';
import { Upload, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: SingleUser | null;
    roles: Array<{
        id: number;
        name: string;
    }>;
}

export default function EditUserModal({ isOpen, onClose, user, roles }: EditUserModalProps) {
    const { data, setData, put, post, processing, errors, reset } = useForm({
        firstname: user?.firstname || '',
        middlename: user?.middlename || '',
        lastname: user?.lastname || '',
        email: user?.email || '',
        department: user?.department || '',
        roles: [] as number[],
        profile_image: null as File | null,
    });

    const [previewImage, setPreviewImage] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Department options (ensure user's current department is included)
    const departmentOptions = React.useMemo(() => {
        const optionsSet = new Set<string>(departmentList);
        if (user?.department && user.department.trim().length > 0) {
            optionsSet.add(user.department);
        }
        return Array.from(optionsSet);
    }, [user?.department]);

    // Update form data when user changes
    React.useEffect(() => {
        if (user) {
            setData({
                firstname: user.firstname || '',
                middlename: user.middlename || '',
                lastname: user.lastname || '',
                email: user.email || '',
                department: user.department || '',
                roles: user.role_ids || [],
                profile_image: null,
            });
            setPreviewImage(user.profile_image || null);
        }
    }, [user, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if required fields have values
        const requiredFields = {
            firstname: data.firstname?.trim(),
            lastname: data.lastname?.trim(),
            email: data.email?.trim(),
            department: data.department?.trim(),
        };

        const emptyFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([field]) => field);

        if (emptyFields.length > 0) {
            toast.error(`Please fill in required fields: ${emptyFields.join(', ')}`);
            return;
        }

        if (!user) {
            toast.error('No user selected for editing');
            return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('firstname', data.firstname);
        formData.append('middlename', data.middlename || '');
        formData.append('lastname', data.lastname);
        formData.append('email', data.email);
        formData.append('department', data.department);
        // Append roles as an actual array for Laravel (roles[])
        data.roles.forEach((roleId) => {
            formData.append('roles[]', String(roleId));
        });

        if (data.profile_image) {
            formData.append('profile_image', data.profile_image);
        }

        // Use router.post with FormData and _method override for file uploads
        router.post(`/permission/user/${user.id}`, formData, {
            forceFormData: true,
            headers: {
                'X-HTTP-Method-Override': 'PUT',
            },
            onSuccess: () => {
                toast.success('User updated successfully');
                reset();
                setPreviewImage(null);
                onClose();
            },
            onError: (errors: any) => {
                Object.keys(errors).forEach((key) => {
                    toast.error(errors[key]);
                });
            },
        });
    };

    const handleClose = () => {
        if (!processing) {
            reset();
            onClose();
        }
    };

    const handleRoleChange = (roleId: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData(
                'roles',
                data.roles.filter((id) => id !== roleId),
            );
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            // Set the file without triggering validation errors
            setData('profile_image', file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('profile_image', null);
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Update user information, department, and roles.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-4">
                        {/* Profile Image Upload Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile preview" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        <img src={user.profile_image || '/AGOC.png'} alt="Profile" className="h-16 w-16 object-contain" />
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    disabled={processing}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Upload className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Upload Profile Image</span>
                            </div>
                            {previewImage && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={removeImage}
                                    className="flex items-center space-x-1"
                                    disabled={processing}
                                >
                                    <X className="h-3 w-3" />
                                    <span>Remove Image</span>
                                </Button>
                            )}
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstname">First Name *</Label>
                                <Input
                                    id="firstname"
                                    value={data.firstname}
                                    onChange={(e) => setData('firstname', e.target.value)}
                                    placeholder="Enter first name"
                                    disabled={processing}
                                />
                                {errors.firstname && <span className="text-sm text-red-500">{errors.firstname}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="middlename">Middle Name</Label>
                                <Input
                                    id="middlename"
                                    value={data.middlename}
                                    onChange={(e) => setData('middlename', e.target.value)}
                                    placeholder="Enter middle name"
                                    disabled={processing}
                                />
                                {errors.middlename && <span className="text-sm text-red-500">{errors.middlename}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastname">Last Name *</Label>
                                <Input
                                    id="lastname"
                                    value={data.lastname}
                                    onChange={(e) => setData('lastname', e.target.value)}
                                    placeholder="Enter last name"
                                    disabled={processing}
                                />
                                {errors.lastname && <span className="text-sm text-red-500">{errors.lastname}</span>}
                            </div>
                        </div>

                        {/* Email and Department */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter email address"
                                    disabled={processing}
                                />
                                {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department *</Label>
                                <Select value={data.department} onValueChange={(value) => setData('department', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departmentOptions.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.department && <span className="text-sm text-red-500">{errors.department}</span>}
                            </div>
                        </div>

                        {/* Roles Selection */}
                        <div className="space-y-3">
                            <Label>Select Roles</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={data.roles.includes(role.id)}
                                            onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                                            disabled={processing}
                                        />
                                        <Label htmlFor={`role-${role.id}`} className="text-sm font-normal">
                                            {role.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {errors.roles && <span className="text-sm text-red-500">{errors.roles}</span>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.firstname.trim() || !data.lastname.trim() || !data.email.trim() || !data.department.trim()}
                        >
                            {processing ? 'Updating...' : 'Update User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
