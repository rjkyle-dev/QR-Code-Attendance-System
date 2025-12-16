import { AppSidebar } from '@/components/app-sidebar';
import { ComboboxDemo } from '@/components/combo-box';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertCircle, CalendarIcon, CheckCircle, PhilippinePeso, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service Tenure',
        href: '/service-tenure',
    },
    {
        title: 'Pay Advancement',
        href: '/service-tenure/pay-advancement',
    },
];

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    department: string;
    position: string;
    service_tenure: string;
    length_of_service: string;
    years_claim: string;
    remaining_years: string;
    status: string;
}

interface PayAdvancementForm {
    employee_id: string;
    years_to_pay: string;
    equivalent_amount: string;
    date_of_payout: string;
    remarks: string;
}

interface Props {
    employees?: Employee[];
    errors?: any;
    success?: string;
}

export default function PayAdvancement({ employees = [], errors, success }: Props) {
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(false);
    const [dateOfPayout, setDateOfPayout] = useState<Date | undefined>(undefined);
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const [formData, setFormData] = useState<PayAdvancementForm>({
        employee_id: '',
        years_to_pay: '',
        equivalent_amount: '',
        date_of_payout: '',
        remarks: '',
    });

    // Convert employees to combo-box options
    const employeeOptions = employees.map((employee) => ({
        value: employee.id,
        label: `${employee.employeeid} - ${employee.employee_name} (${employee.department})`,
        search: `${employee.employeeid} ${employee.employee_name} ${employee.department} ${employee.position}`,
    }));

    // Debug: Log employee options
    useEffect(() => {
        console.log('Employee options created:', employeeOptions);
        if (employeeOptions.length > 0) {
            console.log('First option:', employeeOptions[0]);
        }
    }, [employeeOptions]);

    // Debug: Log employees data
    useEffect(() => {
        console.log('Employees received:', employees);
        console.log('Employees count:', employees.length);
        if (employees.length > 0) {
            console.log('First employee:', employees[0]);
        }
    }, [employees]);

    // Debug: Log selected employee changes
    useEffect(() => {
        console.log('Selected employee changed:', selectedEmployee);
    }, [selectedEmployee]);

    // Show success message if provided
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
    }, [success]);

    // Show error messages if provided
    useEffect(() => {
        if (errors) {
            Object.keys(errors).forEach((key) => {
                toast.error(errors[key]);
            });
        }
    }, [errors]);

    const handleEmployeeSelect = (employeeId: string) => {
        console.log('Employee selected with ID:', employeeId);
        console.log('Type of employeeId:', typeof employeeId);
        console.log(
            'Available employee IDs:',
            employees.map((emp) => emp.id),
        );

        const employee = employees.find((emp) => emp.id === employeeId);
        console.log('Found employee:', employee);

        if (employee) {
            setSelectedEmployee(employee);
            setFormData((prev) => ({
                ...prev,
                employee_id: employeeId,
            }));
            console.log('Employee successfully set:', employee);
        } else {
            console.error('Employee not found with ID:', employeeId);
            console.error(
                'Available employees:',
                employees.map((emp) => ({ id: emp.id, name: emp.employee_name })),
            );
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        setDateOfPayout(date);
        setOpenDatePicker(false);
        if (date) {
            setFormData((prev) => ({
                ...prev,
                date_of_payout: format(date, 'yyyy-MM-dd'),
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedEmployee) {
            toast.error('Please select an employee');
            return;
        }

        if (!formData.years_to_pay) {
            toast.error('Please enter years to be paid out');
            return;
        }

        if (!formData.date_of_payout) {
            toast.error('Please select a payout date');
            return;
        }

        const yearsToPay = parseInt(formData.years_to_pay);
        const remainingYears = parseInt(selectedEmployee.remaining_years || '0');

        if (yearsToPay > remainingYears) {
            toast.error(`Cannot exceed remaining years (${remainingYears})`);
            return;
        }

        setLoading(true);

        router.post(
            '/service-tenure/pay-advancement/store',
            {
                employee_id: formData.employee_id,
                years_to_pay: formData.years_to_pay,
                equivalent_amount: formData.equivalent_amount,
                date_of_payout: formData.date_of_payout,
                remarks: formData.remarks,
            },
            {
                onSuccess: () => {
                    toast.success('Pay advancement request submitted successfully!');
                    resetForm();
                    setLoading(false);
                },
                onError: (errors) => {
                    console.error('Error submitting pay advancement:', errors);
                    toast.error('Failed to submit pay advancement request');
                    setLoading(false);
                },
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    const resetForm = () => {
        setFormData({
            employee_id: '',
            years_to_pay: '',
            equivalent_amount: '',
            date_of_payout: '',
            remarks: '',
        });
        setSelectedEmployee(null);
        setDateOfPayout(undefined);
    };

    const calculateEquivalentAmount = () => {
        if (formData.years_to_pay && selectedEmployee) {
            // This is a placeholder calculation - adjust based on your business logic
            const baseAmount = 50000; // Base amount per year
            const years = parseInt(formData.years_to_pay);
            const calculatedAmount = baseAmount * years;
            setFormData((prev) => ({
                ...prev,
                equivalent_amount: calculatedAmount.toString(),
            }));
        }
    };

    return (
        <SidebarProvider>
            <Head title="Service Pay Advancement Request" />
            {/* <Toaster position="top-right" richColors />/ */}
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div>
                                <div className="ms-2 flex items-center">
                                    <PhilippinePeso className="size-11" />
                                    <div className="ms-2">
                                        <h2 className="flex text-2xl font-bold tracking-tight">Service Pay Advancement Request</h2>
                                        <p className="text-muted-foreground">Process service-based pay advancement for employees</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Pay Advancement Form */}
                            <div className="lg:col-span-2">
                                <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <PhilippinePeso className="h-5 w-5 text-green-600" />Pay Advancement Form
                                        </CardTitle>
                                        <CardDescription>Submit pay advancement request for selected employee</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Employee Selection */}
                                            <div className="space-y-2">
                                                <Label htmlFor="employee">Select Employee *</Label>
                                                <ComboboxDemo
                                                    options={employeeOptions}
                                                    value={formData.employee_id}
                                                    onChange={handleEmployeeSelect}
                                                    placeholder="Search and select an employee..."
                                                />
                                                <p className="text-xs text-muted-foreground">💡 You can search by Employee ID or Employee Name</p>
                                            </div>

                                            {/* Selected Employee Display */}
                                            {selectedEmployee && (
                                                <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                                    <h3 className="font-semibold text-blue-800">Selected Employee</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium text-blue-700">Employee ID</Label>
                                                            <p className="text-sm text-blue-600">{selectedEmployee.employeeid}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-blue-700">Name</Label>
                                                            <p className="text-sm text-blue-600">{selectedEmployee.employee_name}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-blue-700">Department</Label>
                                                            <p className="text-sm text-blue-600">{selectedEmployee.department}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-blue-700">Position</Label>
                                                            <p className="text-sm text-blue-600">{selectedEmployee.position}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Employee Service Details */}
                                            {selectedEmployee && (
                                                <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4">
                                                    <h3 className="font-semibold text-green-800">Employee Service Details</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium text-green-700">Employee ID</Label>
                                                            <p className="text-sm text-green-600">{selectedEmployee.employeeid}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-green-700">Department</Label>
                                                            <p className="text-sm text-green-600">{selectedEmployee.department}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-green-700">Start Date</Label>
                                                            <p className="text-sm text-green-600">{selectedEmployee.service_tenure}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-green-700">Total Years of Service</Label>
                                                            <p className="text-sm text-green-600">{selectedEmployee.length_of_service}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-green-700">Years Already Claimed</Label>
                                                            <p className="text-sm text-green-600">{selectedEmployee.years_claim} years</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-green-700">Remaining Years Available</Label>
                                                            <p className="text-sm font-semibold text-green-600">
                                                                {selectedEmployee.remaining_years} years
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Advancement Request Details */}
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-gray-800">Advancement Request Details</h3>

                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="years_to_pay">Years to be Paid Out *</Label>
                                                        <Input
                                                            id="years_to_pay"
                                                            type="number"
                                                            placeholder="Enter years..."
                                                            value={formData.years_to_pay}
                                                            onChange={(e) => setFormData((prev) => ({ ...prev, years_to_pay: e.target.value }))}
                                                            min="1"
                                                            max={selectedEmployee?.remaining_years || 0}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="equivalent_amount">Equivalent Amount (₱)</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                id="equivalent_amount"
                                                                type="number"
                                                                placeholder="Optional"
                                                                value={formData.equivalent_amount}
                                                                onChange={(e) =>
                                                                    setFormData((prev) => ({ ...prev, equivalent_amount: e.target.value }))
                                                                }
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={calculateEquivalentAmount}
                                                                className="whitespace-nowrap"
                                                            >
                                                                Calculate
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="date_of_payout">Date of Payout *</Label>
                                                    <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {dateOfPayout ? format(dateOfPayout, 'PPP') : 'Pick a date'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={dateOfPayout}
                                                                onSelect={handleDateSelect}
                                                                disabled={(date) => date < new Date()}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="remarks">Remarks</Label>
                                                    <Textarea
                                                        id="remarks"
                                                        placeholder="Enter any additional remarks..."
                                                        value={formData.remarks}
                                                        onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                <Button type="submit" disabled={loading} className="flex-1">
                                                    {loading ? (
                                                        <>
                                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Record Pay Advancement
                                                        </>
                                                    )}
                                                </Button>
                                                <Button type="button" variant="outline" onClick={resetForm}>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Reset Form
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Guidelines */}
                            <div className="lg:col-span-1">
                                <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-blue-600" />
                                            Quick Guidelines
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="mb-2 font-semibold text-gray-800">Eligibility Rules:</h4>
                                            <ul className="space-y-1 text-sm text-gray-600">
                                                <li className="flex items-start gap-2">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                                    Employee must have unclaimed service years
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                                    Cannot exceed total years of service
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                                    Active employment status required
                                                </li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="mb-2 font-semibold text-gray-800">Process:</h4>
                                            <ul className="space-y-1 text-sm text-gray-600">
                                                <li className="flex items-start gap-2">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                    Select employee from dropdown
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                    Review service calculations
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                    Enter advancement details
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                    Submit for processing
                                                </li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}

function SidebarHoverLogic({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const { handleMouseEnter, handleMouseLeave } = useSidebarHover();
    return (
        <>
            <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <AppSidebar onMouseLeave={handleMouseLeave} />
            {children}
        </>
    );
}
