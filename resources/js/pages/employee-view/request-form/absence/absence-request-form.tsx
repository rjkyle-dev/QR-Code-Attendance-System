import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CalendarDays, ChevronDown } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

export default function AbsenceRequestForm() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Request Forms', href: '/employee-view/absence' },
        { title: 'Submit Absence Notification', href: '/employee-view/absence/request' },
    ];

    const [fromDate, setFromDate] = React.useState<Date | undefined>(undefined);
    const [toDate, setToDate] = React.useState<Date | undefined>(undefined);
    const [reason, setReason] = React.useState<string>('');
    const { employee } = usePage().props as any;
    const [submitting, setSubmitting] = React.useState(false);

    const handleSubmit = async () => {
        if (!fromDate || !toDate || !reason) {
            toast.error('Please fill in all required fields.');
            return;
        }
        // Normalize dates to midnight for comparison
        const fromDateNormalized = new Date(fromDate);
        fromDateNormalized.setHours(0, 0, 0, 0);
        const toDateNormalized = new Date(toDate);
        toDateNormalized.setHours(0, 0, 0, 0);

        if (toDateNormalized < fromDateNormalized) {
            toast.error('Date To must be on or after Date From.');
            return;
        }
        if (reason.trim().length < 5) {
            toast.error('Reason for absence must be at least 5 characters.');
            return;
        }
        try {
            setSubmitting(true);
            console.log('Submitting absence request:', {
                employee_id: employee?.id ?? null,
                full_name: employee?.employee_name ?? '',
                employee_id_number: employee?.employeeid ?? '',
                department: employee?.department ?? '',
                position: employee?.position ?? '',
                absence_type: 'Other',
                from_date: fromDate.toISOString().slice(0, 10),
                to_date: toDate.toISOString().slice(0, 10),
                is_partial_day: false,
                reason,
            });

            const response = await axios.post(
                '/employee-view/absence',
                {
                    employee_id: employee?.id ?? null,
                    full_name: employee?.employee_name ?? '',
                    employee_id_number: employee?.employeeid ?? '',
                    department: employee?.department ?? '',
                    position: employee?.position ?? '',
                    absence_type: 'Other',
                    from_date: fromDate.toISOString().slice(0, 10),
                    to_date: toDate.toISOString().slice(0, 10),
                    is_partial_day: false,
                    reason,
                },
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            console.log('[Absence Form] Request submitted successfully:', response.data);
            console.log('[Absence Form] Response status:', response.status);
            console.log('[Absence Form] Response headers:', response.headers);
            toast.success('Absence request submitted successfully!');

            // Log Echo connection status
            const echo: any = (window as any).Echo;
            if (echo) {
                console.log('[Absence Form] Echo is available');
                const connector = echo.connector;
                if (connector && connector.pusher && connector.pusher.connection) {
                    const state = connector.pusher.connection.state;
                    console.log('[Absence Form] Echo connection state:', state);
                }
            } else {
                console.warn('[Absence Form] Echo is not available');
            }

            // Clear form after successful submission
            setFromDate(undefined);
            setToDate(undefined);
            setReason('');
        } catch (e) {
            console.error('Failed to submit absence request:', e);
            toast.error('Failed to submit absence request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const clearForm = () => {
        setFromDate(undefined);
        setToDate(undefined);
        setReason('');
    };

    // Get current date for calendar restrictions
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absence Request Form" />
            <div className="w-full space-y-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xl font-semibold">
                        <CalendarDays className="h-5 w-5 text-emerald-600" />
                        <span>Absence Request Form</span>
                    </div>
                    {/* <p className="text-sm text-muted-foreground">Report your absence to HR</p> */}
                </div>

                {/* <Alert className="border-emerald-200 bg-emerald-50/80 text-emerald-900">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Please submit absence notifications as soon as possible. For emergencies, contact your supervisor directly at
                        +63-XXX-XXXX-XXXX.
                    </AlertDescription>
                </Alert> */}

                <Card>
                    <CardHeader>
                        <CardTitle>Absence Notification Form</CardTitle>
                        <CardDescription>Please provide details about your absence</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="font-medium">
                                    Date From <span className="text-destructive">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-10 w-full justify-between">
                                            <span>{fromDate ? fromDate.toLocaleDateString() : 'mm/dd/yyyy'}</span>
                                            <ChevronDown className="h-4 w-4 opacity-60" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={fromDate}
                                            onSelect={setFromDate}
                                            initialFocus
                                            disabled={(date) => date < currentDate}
                                            className="rounded-md border"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">
                                    Date To <span className="text-destructive">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-10 w-full justify-between">
                                            <span>{toDate ? toDate.toLocaleDateString() : 'mm/dd/yyyy'}</span>
                                            <ChevronDown className="h-4 w-4 opacity-60" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={toDate}
                                            onSelect={setToDate}
                                            initialFocus
                                            disabled={(date) => {
                                                if (fromDate) {
                                                    return date < fromDate;
                                                }
                                                return date < currentDate;
                                            }}
                                            className="rounded-md border"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-medium">
                                Reason for Absence <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please provide a detailed reason for your absence..."
                                className="min-h-32"
                                minLength={5}
                            />
                            <p className="text-xs text-muted-foreground">
                                {reason.length < 5 ? (
                                    <span className="text-destructive">Minimum 5 characters required ({reason.length}/5)</span>
                                ) : (
                                    <span className="text-muted-foreground">{reason.length} characters</span>
                                )}
                            </p>
                        </div>

                        {/* <Alert className="border-amber-200 bg-amber-50/80 text-amber-900">
                            <AlertTitle>Absence Policy:</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc space-y-1 pl-4">
                                    <li>Report absences before your scheduled shift when possible</li>
                                    <li>Medical documentation may be required for consecutive absences</li>
                                    <li>Frequent unexcused absences may affect your employment status</li>
                                    <li>Contact your supervisor for urgent situations</li>
                                </ul>
                            </AlertDescription>
                        </Alert> */}

                        <div className="flex items-center justify-between gap-3 pt-2">
                            <div />
                            <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={clearForm}>
                                    Clear Form
                                </Button>
                                <Button variant="main" disabled={submitting} onClick={handleSubmit}>
                                    {submitting ? 'Submitting...' : 'Submit Absence Form'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* <Card>
                    <CardHeader>
                        <CardTitle>Emergency Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <div className="font-semibold">HR Department</div>
                                <div className="text-sm text-muted-foreground">Phone: +63 XXX-XXX-XXXX</div>
                                <div className="text-sm text-muted-foreground">Email: hr@cfarbenpo.com</div>
                            </div>
                            <div>
                                <div className="font-semibold">Your Supervisor</div>
                                <div className="text-sm text-muted-foreground">Maria Santos</div>
                                <div className="text-sm text-muted-foreground">Phone: +63 XXX-XXX-XXXX</div>
                            </div>
                        </div>
                    </CardContent>
                </Card> */}
            </div>
        </AppLayout>
    );
}
