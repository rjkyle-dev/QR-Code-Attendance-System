import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { FormEventHandler, useRef, useMemo, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    firstname: string;
    middlename?: string;
    lastname: string;
    email: string;
    profile_image: File | null;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        firstname: auth.user.firstname || '',
        middlename: auth.user.middlename || '',
        lastname: auth.user.lastname || '',
        email: auth.user.email,
        profile_image: null,
    });

    const imagePreviewUrl = useMemo(() => {
        if (data.profile_image instanceof File) {
            return URL.createObjectURL(data.profile_image);
        }
        return auth.user.profile_image || '/AGOC.png';
    }, [data.profile_image, auth.user.profile_image]);

    useEffect(() => {
        let revocableUrl: string | null = null;
        if (data.profile_image instanceof File) {
            revocableUrl = URL.createObjectURL(data.profile_image);
        }
        return () => {
            if (revocableUrl) URL.revokeObjectURL(revocableUrl);
        };
    }, [data.profile_image]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const hasFile = data.profile_image instanceof File;

        // Create FormData manually to ensure all fields are included
        const formData = new FormData();
        formData.append('_method', 'PATCH'); // Laravel method override
        formData.append('firstname', data.firstname);
        formData.append('middlename', data.middlename || '');
        formData.append('lastname', data.lastname);
        formData.append('email', data.email);
        
        if (hasFile) {
            formData.append('profile_image', data.profile_image);
        }

        // Use router.post with method override for PATCH
        router.post(route('profile.update'), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Profile updated successfully!');
                setData('profile_image', null);
            },
            onError: (errors) => {
                // Show general error or specific field errors
                if (errors.firstname || errors.lastname || errors.email) {
                    toast.error('Please check the form fields and try again.');
                } else if (errors.profile_image) {
                    toast.error('Failed to upload profile image. Please try again.');
                } else {
                    toast.error('Failed to update profile. Please try again.');
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />
             {/* <SiteHeader/> */}
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        {/* Profile Image Upload */}
                        <div className="grid gap-2">
                            <Label>Profile Image</Label>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-primary">
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
                                        className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border bg-white text-primary shadow hover:bg-gray-50 dark:bg-card dark:border-gray-700 dark:hover:bg-gray-800"
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
                                        onChange={(e) => setData('profile_image', e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Click the camera icon to upload a new profile image
                                    </p>
                                </div>
                            </div>
                            <InputError className="mt-2" message={errors.profile_image} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="firstname">First Name</Label>

                            <Input
                                id="firstname"
                                className="mt-1 block w-full"
                                value={data.firstname}
                                onChange={(e) => setData('firstname', e.target.value)}
                                required
                                autoComplete="given-name"
                                placeholder="First name"
                            />

                            <InputError className="mt-2" message={errors.firstname} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="middlename">Middle Name (Optional)</Label>

                            <Input
                                id="middlename"
                                className="mt-1 block w-full"
                                value={data.middlename || ''}
                                onChange={(e) => setData('middlename', e.target.value)}
                                autoComplete="additional-name"
                                placeholder="Middle name"
                            />

                            <InputError className="mt-2" message={errors.middlename} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="lastname">Last Name</Label>

                            <Input
                                id="lastname"
                                className="mt-1 block w-full"
                                value={data.lastname}
                                onChange={(e) => setData('lastname', e.target.value)}
                                required
                                autoComplete="family-name"
                                placeholder="Last name"
                            />

                            <InputError className="mt-2" message={errors.lastname} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
