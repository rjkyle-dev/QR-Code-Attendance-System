import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Camera, Eye, EyeOff } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

interface Employee {
    id: number;
    employeeid: string;
    employee_name: string;
    firstname: string;
    lastname: string;
    department: string;
    position: string;
    picture?: string;
    email?: string;
    phone?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/employee-view' },
    { title: 'Profile Settings', href: '/employee-view/profile-settings' },
];

export default function ProfileSettings() {
    const { employee } = usePage<{ employee: Employee }>().props;

    const profileForm = useForm({
        firstname: employee.firstname || '',
        lastname: employee.lastname || '',
        profile_image: null as File | null,
    });

    const passwordForm = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const imagePreviewUrl = React.useMemo(() => {
        if (profileForm.data.profile_image instanceof File) {
            return URL.createObjectURL(profileForm.data.profile_image);
        }
        return employee.picture || '/AGOC.png';
    }, [profileForm.data.profile_image, employee.picture]);

    React.useEffect(() => {
        let revocableUrl: string | null = null;
        if (profileForm.data.profile_image instanceof File) {
            revocableUrl = URL.createObjectURL(profileForm.data.profile_image);
        }
        return () => {
            if (revocableUrl) URL.revokeObjectURL(revocableUrl);
        };
    }, [profileForm.data.profile_image]);

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post(route('employee-view.profile.update'), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Profile updated successfully');
                profileForm.setData('profile_image', null);
            },
            onError: () => {
                toast.error('Failed to update profile');
            },
        });
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post(route('employee-view.password.update'), {
            onSuccess: () => {
                toast.success('Password updated successfully');
                passwordForm.reset('current_password', 'new_password', 'new_password_confirmation');
            },
            onError: () => {
                toast.error('Failed to update password');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile Settings" />
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Update Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={submitProfile} className="space-y-4">
                            <div className="grid gap-2 mb-4">
                                <Label>Profile Image</Label>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-cfar-500">
                                            <img
                                                src={imagePreviewUrl}
                                                alt="Profile preview"
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = '/AGOC.png';
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border bg-white text-cfar-500 shadow"
                                            onClick={() => fileInputRef.current?.click()}
                                            aria-label="Change profile image"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="grid gap-1">
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => profileForm.setData('profile_image', e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                        
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>First name</Label>
                                <Input value={profileForm.data.firstname} onChange={(e) => profileForm.setData('firstname', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Last name</Label>
                                <Input value={profileForm.data.lastname} onChange={(e) => profileForm.setData('lastname', e.target.value)} />
                            </div>

                            <Button variant="main" type="submit" disabled={profileForm.processing}>
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={submitPassword} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Current Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowCurrentPassword((v) => !v)}
                                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordForm.data.new_password}
                                        onChange={(e) => passwordForm.setData('new_password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowNewPassword((v) => !v)}
                                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={passwordForm.data.new_password_confirmation}
                                        onChange={(e) => passwordForm.setData('new_password_confirmation', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <Button variant="main" type="submit" disabled={passwordForm.processing}>
                                Update Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
