import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CalendarDays, ChevronDown } from 'lucide-react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Request Forms', href: '/employee-view/leave' },
    { title: 'Apply for Leave', href: '/employee-view/leave/request' },
];

export default function LeaveRequestForm() {
    const [fromDate, setFromDate] = React.useState<Date | undefined>(undefined);
    const [toDate, setToDate] = React.useState<Date | undefined>(undefined);
    const [leaveType, setLeaveType] = React.useState<string | undefined>(undefined);
    const [reason, setReason] = React.useState<string>('');
    const { employee } = usePage().props as any;
    const [submitting, setSubmitting] = React.useState(false);

    // Set up real-time listeners for leave status updates
    useEffect(() => {
        const echo: any = (window as any).Echo;
        if (!echo || !employee?.id) return;

        console.log('Setting up real-time listeners for leave request form');

        // Listen for status updates on employee's private channel
        const employeeChannel = echo.private(`employee.${employee.id}`);
        employeeChannel
            .listen('.RequestStatusUpdated', (e: any) => {
                console.log('Received RequestStatusUpdated event on leave form:', e);
                if (String(e.type || '').includes('leave')) {
                    const statusText = e.status === 'approved' ? 'approved' : e.status === 'rejected' ? 'rejected' : String(e.status);
                    toast.success(`Your leave request has been ${statusText}!`);
                }
            })
            .error((error: any) => {
                console.error('Error subscribing to employee channel:', error);
            });

        return () => {
            console.log('Cleaning up Echo listeners on leave request form');
            employeeChannel.stopListening('.RequestStatusUpdated');
        };
    }, [employee?.id]);

    const handleSubmit = async () => {
        if (!leaveType || !fromDate || !toDate || !reason) {
            toast.error('Please complete all required fields.');
            return;
        }
        try {
            setSubmitting(true);
            const response = await axios.post(
                '/employee-view/leave',
                {
                    employee_id: employee?.id,
                    leave_type: leaveType,
                    leave_start_date: fromDate.toISOString().slice(0, 10),
                    leave_end_date: toDate.toISOString().slice(0, 10),
                    leave_days: Math.max(1, Math.ceil((+toDate - +fromDate) / (1000 * 60 * 60 * 24)) + 1),
                    leave_reason: reason,
                    leave_date_reported: new Date().toISOString().slice(0, 10),
                },
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            console.log('[Leave Form] Request submitted successfully:', response.data);
            console.log('[Leave Form] Response status:', response.status);
            toast.success('Leave request submitted successfully!');

            // Log Echo connection status
            const echo: any = (window as any).Echo;
            if (echo) {
                console.log('[Leave Form] Echo is available');
                const connector = echo.connector;
                if (connector && connector.pusher && connector.pusher.connection) {
                    const state = connector.pusher.connection.state;
                    console.log('[Leave Form] Echo connection state:', state);
                }
            } else {
                console.warn('[Leave Form] Echo is not available');
            }
            // Clear form after successful submission
            setFromDate(undefined);
            setToDate(undefined);
            setLeaveType(undefined);
            setReason('');
        } catch (e) {
            toast.error('Failed to submit leave request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const clearForm = () => {
        setFromDate(undefined);
        setToDate(undefined);
        setLeaveType(undefined);
        setReason('');
    };

    // Get current date for calendar restrictions
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Apply for Leave" />
            <Toaster position="top-center" richColors />
            <div className="w-full space-y-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xl font-semibold">
                        <CalendarDays className="h-5 w-5 text-emerald-600" />
                        <span>Apply for Leave</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Submit your leave request for approval</p>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle>Leave Application Form</CardTitle>
                        <CardDescription>Please fill out all required information for your leave request</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label className="font-medium">
                                    Leave Type <span className="text-destructive">*</span>
                                </Label>
                                <Select value={leaveType} onValueChange={setLeaveType}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Vacation">Vacation Leave</SelectItem>
                                        <SelectItem value="Sick">Sick Leave</SelectItem>
                                        <SelectItem value="Emergency">Emergency Leave</SelectItem>
                                        <SelectItem value="Others">Others</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

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
                                                disabled={(date) => date < currentDate}
                                                className="rounded-md border"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">
                                    Reason for Leave <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide a detailed reason for your leave request..."
                                    className="min-h-32"
                                />
                            </div>

                            {/* <Alert className="border-amber-200 bg-amber-50/80 text-amber-900">
                                <AlertTitle>Leave Policy Reminder:</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc space-y-1 pl-4">
                                        <li>Submit leave requests at least 2 weeks in advance when possible</li>
                                        <li>Sick leave requires medical documentation for absences over 3 days</li>
                                        <li>Emergency leave should be reported as soon as possible</li>
                                        <li>Current leave balance: 12 days remaining</li>
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
                                        {submitting ? 'Submitting...' : 'Submit Leave Request'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
