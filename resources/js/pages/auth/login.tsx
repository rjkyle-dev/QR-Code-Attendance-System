import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoginLoadingModal from '@/components/ui/login-loading-modal';
import AuthLayout from '@/layouts/auth-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Welcome" description="">
            <Head title="Log in" />

            <LoginLoadingModal isOpen={processing} />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="mt-8 grid gap-2">
                        <Label htmlFor="email" className="font-semibold text-background">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            // required
                            className="placeholder:text-white-500 text-background focus:ring-0 focus:ring-offset-0"
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="mt-5 flex items-center">
                            <Label htmlFor="password" className="font-semibold text-background">
                                Password
                            </Label>
                            {/* {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )} */}
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                // required
                                className="placeholder:text-white-500 dark:placeholder:text-white-500 dark:text-white-500 pr-10 text-background focus:ring-0 focus:ring-offset-0"
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-background hover:text-background/80 focus:outline-none"
                                tabIndex={3}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    {/* <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div> */}

                    <Button
                        type="submit"
                        className="hover:bg-background-600 dark:text-white-500 dark:hover:bg-smoke-500 dark:hover:text-white-500 mt-10 w-full bg-background font-bold text-black transition-all duration-200 ease-in-out hover:text-black dark:bg-cfar-50"
                        tabIndex={5}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Login
                    </Button>
                </div>

                {/* <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div> */}
            </form>
            <div className="flex justify-center">
                <Button type="button" variant="link" onClick={() => router.visit(route('home'))}>
                    Cancel
                </Button>
            </div>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
