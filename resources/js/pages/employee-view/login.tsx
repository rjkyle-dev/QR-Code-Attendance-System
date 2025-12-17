import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoginLoadingModal from '@/components/ui/login-loading-modal';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type LoginForm = {
    employee_id: string;
    pin: string;
};

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const [showPin, setShowPin] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        employee_id: '',
        pin: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employeelogin.store'), {
            onFinish: () => reset('pin'),
        });
    };

    return (
        <div className="auth-bg flex min-h-svh items-center justify-center p-6 text-white md:p-10">
            <Head title="Employee Log in" />

            <LoginLoadingModal isOpen={processing} />

            <div className="mx-auto grid w-full max-w-2xl overflow-hidden rounded-xl bg-cfar-500 shadow-xl md:grid-cols-2">
                {/* Left image */}
                <div className="relative hidden md:block">
                    <img src="/login-side-image.png" alt="Employee" className="h-full w-full object-cover" />
                </div>

                {/* Right form panel */}
                <div className="flex flex-col items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex size-20 items-center justify-center">
                            <AppLogoIcon className="size-96 fill-current text-black dark:text-white" />
                        </div>
                        <h2 className="text-2xl font-semibold">Welcome</h2>
                        <p className="text-sm">Login to your account</p>
                    </div>

                    <form className="mt-6 flex w-full max-w-md flex-col gap-6" onSubmit={submit}>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="employee_id" className="font-semibold text-white">
                                    Employee ID
                                </Label>
                                <Input
                                    id="employee_id"
                                    type="text"
                                    className="placeholder:text-white-500 text-background focus:ring-0 focus:ring-offset-0"
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="employee_id"
                                    value={data.employee_id}
                                    onChange={(e) => setData('employee_id', e.target.value)}
                                    placeholder="Employee ID"
                                />
                                <InputError message={errors.employee_id} />
                            </div>

                            <div className="grid gap-2">
                                {/* <div className="flex items-center justify-between">
                                    <Label htmlFor="pin" className="font-semibold text-white">
                                        PIN
                                    </Label>
                                    <button
                                        type="button"
                                        className="text-sm text-blue-300 underline hover:text-blue-200"
                                        onClick={() => {
                                            // TODO: Implement PIN reset functionality
                                            alert('Please contact your administrator to reset your PIN.');
                                        }}
                                    >
                                        Forgot PIN?
                                    </button>
                                </div> */}
                                <div className="relative">
                                    <Input
                                        id="pin"
                                        type={showPin ? 'text' : 'password'}
                                        className="placeholder:text-white-500 pr-10 text-background focus:ring-0 focus:ring-offset-0"
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.pin}
                                        onChange={(e) => setData('pin', e.target.value)}
                                        placeholder="PIN"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPin(!showPin)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-background hover:text-background/80 focus:outline-none"
                                        tabIndex={3}
                                        disabled={processing}
                                    >
                                        {showPin ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
                                    </button>
                                </div>
                                <InputError message={errors.pin} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-cfar-400 font-bold text-white transition-all duration-200 ease-in-out hover:bg-cfar-450 hover:text-white"
                                tabIndex={5}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </div>
                    </form>

                    <Link href={route('home')} className="mt-2 w-full">
                        <Button type="button" variant="link" className="mt-2 w-full text-white">
                            Cancel
                        </Button>
                    </Link>

                    {status && <div className="mt-4 text-center text-sm font-medium text-green-300">{status}</div>}
                </div>
            </div>
        </div>
    );
}
