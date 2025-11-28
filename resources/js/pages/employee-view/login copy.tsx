import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmployeeAuthLayout from '@/layouts/employee-auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

type LoginForm = {
    employee_id: string;
    pin: string;
};

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
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
        <EmployeeAuthLayout title="Employee Login" description="Sign in to access your CheckWise HRIS account">
            <Head title="Employee Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
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
                        <div className="flex items-center justify-between">
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
                        </div>
                        <Input
                            id="pin"
                            type="password"
                            className="placeholder:text-white-500 text-background focus:ring-0 focus:ring-offset-0"
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.pin}
                            onChange={(e) => setData('pin', e.target.value)}
                            placeholder="PIN"
                        />
                        <InputError message={errors.pin} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-cfar-400 font-bold text-white transition-all duration-200 ease-in-out hover:bg-cfar-450 hover:text-white"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Login
                    </Button>
                </div>
            </form>
            <Link href={route('home')} className="mt-2 w-full">
                <Button type="button" variant="outline" className="mt-2 w-full">
                    Cancel
                </Button>
            </Link>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </EmployeeAuthLayout>
    );
}
