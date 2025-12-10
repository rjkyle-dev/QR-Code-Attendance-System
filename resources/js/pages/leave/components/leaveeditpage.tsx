import LeavePDFTemplate from '@/components/pdf/leave-pdf-template';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/user-permission';
import { cn } from '@/lib/utils';
import { router, useForm, usePage } from '@inertiajs/react';
import { PDFViewer } from '@react-pdf/renderer';
import { differenceInDays, format, parseISO } from 'date-fns';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Building,
    Camera,
    CheckCircle,
    Clock,
    Download,
    FileText,
    IdCard,
    Mail,
    Save,
    User,
    UserCheck,
    XCircle,
    Eye
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { hrStatuses, supervisorStatuses } from '../data/data';

const leaveTypes = ['Annual Leave', 'Sick Leave', 'Emergency Leave', 'Maternity Leave', 'Paternity Leave', 'Bereavement Leave', 'Personal Leave'];
const leaveStatuses = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

export default function LeaveEditPage() {
    const leave = (usePage().props as any).leave;
    const employee = leave.employee || {};
    const { can } = usePermission();
    const page = usePage();
    const user = (page.props as any).auth?.user;
    const flash = (page.props as any).flash;
    // Use the boolean flags from HandleInertiaRequests middleware
    const isSupervisor = user?.isSupervisor || false;
    const isHR = user?.isHR || false;
    const isSuperAdmin = user?.isSuperAdmin || false;

    const { data, setData, put, processing, errors } = useForm({
        // Employee Information (read-only)
        picture: employee.picture || '',
        employee_name: employee.employee_name || '',
        department: employee.department || '',
        email: employee.email || '',
        position: employee.position || '',
        employeeid: employee.employeeid || '',
        // Leave Information (editable)
        leave_type: leave.leave_type || '',
        leave_start_date: leave.leave_start_date || '',
        leave_end_date: leave.leave_end_date || '',
        leave_days: Number(leave.leave_days) || 0,
        leave_date_reported: leave.leave_date_reported || '',
        leave_date_approved: leave.leave_date_approved || '',
        leave_reason: leave.leave_reason || '',
        leave_comments: leave.leave_comments || '',
        leave_status: leave.leave_status || leave.status || 'Pending',
        // Supervisor approval fields
        supervisor_status: leave.supervisor_status || null,
        supervisor_comments: leave.supervisor_comments || '',
        // HR approval fields
        hr_status: leave.hr_status || null,
        hr_comments: leave.hr_comments || '',
    });

    const [openApproved, setOpenApproved] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    // Handle flash messages from Laravel redirects
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Calculate leave days when start and end dates change
    useEffect(() => {
        if (data.leave_start_date && data.leave_end_date) {
            const days = differenceInDays(parseISO(data.leave_end_date), parseISO(data.leave_start_date)) + 1;
            setData('leave_days', Math.max(0, days));
        } else {
            setData('leave_days', 0);
        }
        // eslint-disable-next-line
    }, [data.leave_start_date, data.leave_end_date]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Determine which action is being taken
        const isSupervisorAction =
            (isSupervisor || isSuperAdmin) &&
            (leave.supervisor_status === 'pending' || !leave.supervisor_status) &&
            data.supervisor_status &&
            data.supervisor_status !== 'pending';

        const isHRAction =
            (isHR || isSuperAdmin) &&
            leave.supervisor_status === 'approved' &&
            (leave.hr_status === 'pending' || !leave.hr_status) &&
            data.hr_status &&
            data.hr_status !== 'pending';

        put(route('leave.update', leave.id), {
            onSuccess: () => {
                if (isSupervisorAction) {
                    toast.success('Supervisor approval submitted successfully!');
                } else if (isHRAction) {
                    toast.success('HR approval submitted successfully!');
                } else {
                    toast.success('Leave updated successfully');
                }
            },
            onError: (errors: any) => {
                toast.error('Failed to update leave approval');
                console.error('Leave update errors:', errors);
            },
            preserveScroll: true,
        });
    };

    // Calculate progress for approval workflow (0-100)
    const calculateProgress = () => {
        if (leave.supervisor_status === 'rejected') return 0; // Rejected at stage 1
        if (leave.hr_status === 'rejected') return 50; // Rejected at stage 2
        if (leave.hr_status === 'approved') return 100; // Fully approved
        if (leave.supervisor_status === 'approved') return 50; // Supervisor approved, waiting for HR
        return 0; // Pending supervisor approval
    };

    const progress = calculateProgress();

    const handleBack = () => {
        router.visit(route('leave.index'));
    };

    const handleSendEmail = () => {
        if (!data.email) {
            toast.error('Employee email address not found');
            return;
        }

        setSendingEmail(true);
        router.post(
            route('leave.send-email', leave.id),
            {},
            {
                onSuccess: (page) => {
                    // Flash message will be handled by useEffect
                    setSendingEmail(false);
                },
                onError: (errors: any) => {
                    // Handle validation errors or other errors
                    const errorMessage = errors?.message || Object.values(errors).flat().join(', ') || 'Failed to send email. Please try again.';
                    toast.error(errorMessage);
                    setSendingEmail(false);
                },
                preserveScroll: true,
            },
        );
    };

    // Build absolute URLs for images to ensure PDF can access them
    const toAbsoluteUrl = (url?: string) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${origin}${path}`;
    };

    const handlePreviewPDF = () => {
        setShowPreview(true);
    };

    // DatePicker component for useForm (string date)
    const DatePicker = ({
        date,
        onDateChange,
        placeholder,
        disabled = false,
    }: {
        date: string;
        onDateChange: (date: string) => void;
        placeholder: string;
        disabled?: boolean;
    }) => (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                    disabled={disabled}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {date ? format(parseISO(date), 'PPP') : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="rounded border p-2" />
            </PopoverContent>
        </Popover>
    );

    const getStatusBadge = (status: string) => {
        let statusLeaveColors = '';
        let StatusIcon = null;
        if (status === 'Pending') {
            statusLeaveColors = 'bg-yellow-100 text-yellow-800 font-semibold text-lg p-3';
            StatusIcon = Clock;
        } else if (status === 'Approved') {
            statusLeaveColors = 'bg-green-100 text-green-800';
            StatusIcon = CheckCircle;
        } else {
            statusLeaveColors = 'bg-red-100 text-red-800';
            StatusIcon = XCircle;
        }
        return (
            <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${statusLeaveColors}`}>
                {StatusIcon && <StatusIcon className="mr-1 h-4 w-4" />}
                {status}
            </span>
        );
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="animate-fade-in min-h-screen bg-background p-6">
                <div className="mb-2">
                    <Alert className="border-yellow-300 bg-yellow-50 text-yellow-800">
                        <AlertCircle className="mr-2 inline-block h-4 w-4 align-text-bottom" />
                        <div className="flex flex-1/2 space-x-2">
                            Reminder: You can only change or update the
                            <span className="ml-2 font-semibold">status</span>
                            <span>of this leave request. All other fields are read-only.</span>
                            <TextLink href="#status" className="font-semibold text-yellow-800 underline-offset-2">
                                Proceed
                            </TextLink>
                        </div>
                    </Alert>
                </div>
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <Button type="button" variant="outline" className="flex items-center gap-2" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    {can('Download Leave PDF') && (
                        <Button type="button" variant="main" className="flex items-center gap-2" onClick={handlePreviewPDF}>
                            <Eye className="h-4 w-4" />
                            View PDF
                        </Button>
                    )}
                </div>

                <div className="mx-auto space-y-4">
                    {/* Employee Information Section */}
                    <Card className="animate-fade-in border-main transition-all hover:shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-primary" />
                                <CardTitle className="text-primary">Employee Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-6 md:flex-row">
                                {/* Profile Picture */}
                                <div className="mx-10 flex flex-col items-center space-y-2">
                                    <div className="relative">
                                        <div className="border-main flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 bg-muted">
                                            <img
                                                src={data.picture ? data.picture : '/AGOC.png'}
                                                alt="Employee"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full p-1"
                                            type="button"
                                        >
                                            <Camera className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <Label className="text-xs text-muted-foreground">Profile Picture</Label>
                                </div>

                                {/* Employee Details */}
                                <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="employee-id" className="flex items-center gap-2 text-sm font-medium">
                                            <IdCard className="h-4 w-4 text-primary" />
                                            Employee ID
                                        </Label>
                                        <Input
                                            id="employee-id"
                                            value={data.employeeid}
                                            readOnly
                                            className="cursor-not-allowed bg-gray-100 transition-all focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="employee-name" className="flex items-center gap-2 text-sm font-medium">
                                            <User className="h-4 w-4 text-primary" />
                                            Full Name
                                        </Label>
                                        <Input
                                            id="employee-name"
                                            value={data.employee_name}
                                            readOnly
                                            className="cursor-not-allowed bg-gray-100 transition-all focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department" className="flex items-center gap-2 text-sm font-medium">
                                            <Building className="h-4 w-4 text-primary" />
                                            Department
                                        </Label>
                                        <Input
                                            id="department"
                                            value={data.department}
                                            readOnly
                                            className="cursor-not-allowed bg-gray-100 transition-all focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="position" className="flex items-center gap-2 text-sm font-medium">
                                            <UserCheck className="h-4 w-4 text-primary" />
                                            Position
                                        </Label>
                                        <Input
                                            id="position"
                                            value={data.position}
                                            readOnly
                                            className="v> cursor-not-allowed bg-gray-100 transition-all focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                                            <Mail className="h-4 w-4 text-primary" />
                                            Email Address
                                        </Label>
                                        <div className="flex space-x-4">
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                readOnly
                                                className="cursor-not-allowed bg-gray-100 transition-all focus:ring-2 focus:ring-primary/20"
                                            />
                                            {can('Sent Email Approval') && (
                                                <Button
                                                    variant="main"
                                                    className="transition-all hover:scale-105"
                                                    disabled={processing || sendingEmail || !data.email}
                                                    type="button"
                                                    onClick={handleSendEmail}
                                                >
                                                    {sendingEmail ? (
                                                        <>
                                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Mail className="mr-2 h-4 w-4" />
                                                            Send Email
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Alert */}
                    {data.leave_days > 0 && (
                        <Alert className="animate-scale-in border-primary/20 bg-primary/5">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            <AlertDescription className="text-primary">
                                You have selected {data.leave_days} day{data.leave_days !== 1 ? 's' : ''} for this leave request.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Leave Period Section */}
                    <Card className="animate-fade-in border-main transition-all hover:shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <CardTitle className="text-primary">Leave Period</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="start-date" className="text-sm font-medium">
                                        Start Date
                                    </Label>
                                    <DatePicker
                                        date={data.leave_start_date}
                                        onDateChange={() => {}}
                                        placeholder="Select start date"
                                        disabled={true}
                                    />
                                    {errors.leave_start_date && <div className="text-xs text-red-500">{errors.leave_start_date}</div>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-date" className="text-sm font-medium">
                                        End Date
                                    </Label>
                                    <DatePicker date={data.leave_end_date} onDateChange={() => {}} placeholder="Select end date" disabled={true} />
                                    {errors.leave_end_date && <div className="text-xs text-red-500">{errors.leave_end_date}</div>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="leave-days" className="text-sm font-medium">
                                        Total Days
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="leave-days"
                                            type="number"
                                            value={data.leave_days}
                                            readOnly
                                            className="bg-muted font-semibold text-primary"
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                                            {data.leave_days === 1 ? 'day' : 'days'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Details Section */}
                    <Card className="animate-fade-in border-main transition-all hover:shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <CardTitle className="text-primary">Leave Details</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="leave-type" className="text-sm font-medium">
                                    Leave Type
                                </Label>
                                <Input
                                    id="leave-type"
                                    value={data.leave_type}
                                    readOnly
                                    className="mt-[8px] cursor-not-allowed bg-gray-100 transition-all focus:ring-2 focus:ring-primary/20"
                                />
                                {errors.leave_type && <div className="text-xs text-red-500">{errors.leave_type}</div>}
                            </div>
                            {/* Approval Stages - Full Width */}
                            <div className="flex w-full items-start justify-between gap-4">
                                {/* Stage 1: Supervisor Approval - Left */}
                                <div className="flex flex-1 flex-col justify-start">
                                    <div className="mb-2 flex items-center gap-2">
                                        {leave.supervisor_status === 'approved' ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : leave.supervisor_status === 'rejected' ? (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        ) : (
                                            <Clock className="h-5 w-5 text-yellow-600" />
                                        )}
                                        <Label className="text-sm font-semibold">Stage 1: Supervisor Approval</Label>
                                    </div>
                                    <div className={`ml-7 space-y-2 ${isHR && !isSuperAdmin ? 'opacity-50' : ''}`}>
                                        <div className="text-xs text-muted-foreground">
                                            Status: <span className="font-medium capitalize">{leave.supervisor_status || 'Pending'}</span>
                                        </div>
                                        {leave.supervisor_approver && (
                                            <div className="text-xs text-muted-foreground">
                                                Approved by: <span className="font-medium">{leave.supervisor_approver.name}</span>
                                            </div>
                                        )}
                                        {leave.supervisor_approved_at && (
                                            <div className="text-xs text-muted-foreground">
                                                Date: <span className="font-medium">{format(parseISO(leave.supervisor_approved_at), 'PPP')}</span>
                                            </div>
                                        )}
                                        {(isSupervisor || isSuperAdmin) &&
                                            !(isHR && !isSuperAdmin) &&
                                            (leave.supervisor_status === 'pending' || !leave.supervisor_status) && (
                                                <div className="mt-3 space-y-2">
                                                    <Select
                                                        value={data.supervisor_status || 'pending'}
                                                        onValueChange={(val) => setData('supervisor_status', val)}
                                                        disabled={isHR && !isSuperAdmin}
                                                    >
                                                        <SelectTrigger className="w-full" disabled={isHR && !isSuperAdmin}>
                                                            <SelectValue placeholder="Select action" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {supervisorStatuses
                                                                .filter((s) => s.value !== 'pending')
                                                                .map((status) => (
                                                                    <SelectItem key={status.value} value={status.value}>
                                                                        {status.label}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Textarea
                                                        placeholder="Supervisor comments (optional)"
                                                        value={data.supervisor_comments}
                                                        onChange={(e) => setData('supervisor_comments', e.target.value)}
                                                        rows={2}
                                                        className="resize-none"
                                                        disabled={isHR && !isSuperAdmin}
                                                    />
                                                </div>
                                            )}
                                        {leave.supervisor_comments && (
                                            <div className="mt-2 rounded bg-muted p-2 text-xs text-muted-foreground">
                                                Comments: {leave.supervisor_comments}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow - Center */}
                                <div className="flex flex-shrink-0 items-center justify-center px-4">
                                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                </div>

                                {/* Stage 2: HR Approval - Right */}
                                <div className="flex flex-1 flex-col items-end justify-end">
                                    <div className="mb-2 flex items-center justify-end gap-2">
                                        {leave.hr_status === 'approved' ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : leave.hr_status === 'rejected' ? (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        ) : leave.supervisor_status === 'approved' ? (
                                            <Clock className="h-5 w-5 text-yellow-600" />
                                        ) : (
                                            <Clock className="h-5 w-5 text-gray-400" />
                                        )}
                                        <Label className="text-sm font-semibold">Stage 2: HR Approval</Label>
                                    </div>
                                    <div className="mr-7 space-y-2 text-right">
                                        <div className="text-xs text-muted-foreground">
                                            Status:{' '}
                                            <span className="font-medium capitalize">
                                                {leave.supervisor_status !== 'approved' ? 'Waiting for Supervisor' : leave.hr_status || 'Pending'}
                                            </span>
                                        </div>
                                        {leave.hr_approver && (
                                            <div className="text-xs text-muted-foreground">
                                                Approved by: <span className="font-medium">{leave.hr_approver.name}</span>
                                            </div>
                                        )}
                                        {leave.hr_approved_at && (
                                            <div className="text-xs text-muted-foreground">
                                                Date: <span className="font-medium">{format(parseISO(leave.hr_approved_at), 'PPP')}</span>
                                            </div>
                                        )}
                                        {(isHR || isSuperAdmin) &&
                                            leave.supervisor_status === 'approved' &&
                                            (leave.hr_status === 'pending' || !leave.hr_status) && (
                                                <div className="mt-3 space-y-2">
                                                    <Select value={data.hr_status || 'pending'} onValueChange={(val) => setData('hr_status', val)}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select action" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {hrStatuses
                                                                .filter((s) => s.value !== 'pending')
                                                                .map((status) => (
                                                                    <SelectItem key={status.value} value={status.value}>
                                                                        {status.label}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Textarea
                                                        placeholder="HR comments (optional)"
                                                        value={data.hr_comments}
                                                        onChange={(e) => setData('hr_comments', e.target.value)}
                                                        rows={2}
                                                        className="resize-none"
                                                    />
                                                </div>
                                            )}
                                        {leave.hr_comments && (
                                            <div className="mt-2 rounded bg-muted p-2 text-xs text-muted-foreground">
                                                Comments: {leave.hr_comments}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status Section - Full Width */}
                            <div className="w-full">
                                <div className="" id="status">
                                    <div className="item-center flex">
                                        <Label htmlFor="leave-status" className="mr-1 text-sm font-medium">
                                            Status:
                                        </Label>

                                        <span className="mt-1 px-2 text-xs text-muted-foreground">Current status: </span>
                                        <span className="mb-2">{getStatusBadge(leave.leave_status || leave.status)}</span>
                                    </div>

                                    {/* Progress Bar in Status Area */}
                                    <div className="mt-3 space-y-2 rounded-lg border border-muted p-3">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span
                                                className={
                                                    leave.supervisor_status === 'approved'
                                                        ? 'text-primary'
                                                        : leave.supervisor_status === 'rejected'
                                                          ? 'text-red-600'
                                                          : 'text-muted-foreground'
                                                }
                                            >
                                                Stage 1: Supervisor{' '}
                                                {leave.supervisor_status === 'approved'
                                                    ? '✓'
                                                    : leave.supervisor_status === 'rejected'
                                                      ? '✗'
                                                      : '(Pending)'}
                                            </span>
                                            <span
                                                className={
                                                    leave.hr_status === 'approved'
                                                        ? 'text-primary'
                                                        : leave.hr_status === 'rejected'
                                                          ? 'text-red-600'
                                                          : leave.supervisor_status === 'approved'
                                                            ? 'text-yellow-600'
                                                            : 'text-muted-foreground'
                                                }
                                            >
                                                Stage 2: HR{' '}
                                                {leave.hr_status === 'approved'
                                                    ? '✓'
                                                    : leave.hr_status === 'rejected'
                                                      ? '✗'
                                                      : leave.supervisor_status === 'approved'
                                                        ? '(Waiting)'
                                                        : '(Not Started)'}
                                            </span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                </div>
                            </div>
                            <Separator className="my-4" />
                            <div className="space-y-2">
                                <Label htmlFor="leave-reason" className="text-sm font-medium">
                                    Reason
                                </Label>
                                <Input
                                    id="leave-reason"
                                    value={data.leave_reason}
                                    readOnly
                                    placeholder="Enter reason for leave"
                                    className="transition-all focus:ring-2 focus:ring-primary/20"
                                />
                                {errors.leave_reason && <div className="text-xs text-red-500">{errors.leave_reason}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leave-comments" className="text-sm font-medium">
                                    Additional Comments
                                </Label>
                                <Textarea
                                    id="leave-comments"
                                    value={data.leave_comments}
                                    onChange={(e) => setData('leave_comments', e.target.value)}
                                    placeholder="Any additional comments or notes"
                                    rows={3}
                                    className="resize-none transition-all focus:ring-2 focus:ring-primary/20"
                                />
                                {errors.leave_comments && <div className="text-xs text-red-500">{errors.leave_comments}</div>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Administrative Dates Section */}
                    <Card className="animate-fade-in border-main transition-all hover:shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <CardTitle className="text-primary">Administrative Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="date-reported" className="text-sm font-medium">
                                        Date Reported
                                    </Label>
                                    <DatePicker
                                        date={data.leave_date_reported}
                                        onDateChange={() => {}}
                                        placeholder="Select date reported"
                                        disabled={true}
                                    />
                                    {errors.leave_date_reported && <div className="text-xs text-red-500">{errors.leave_date_reported}</div>}
                                </div>
                                {can('Leave Status Approval') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="date-approved" className="text-sm font-medium">
                                            Date Approved
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Popover open={openApproved} onOpenChange={setOpenApproved}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !data.leave_date_approved && 'text-muted-foreground',
                                                        )}
                                                    >
                                                        <Clock className="mr-2 h-4 w-4" />
                                                        {data.leave_date_approved ? (
                                                            format(parseISO(data.leave_date_approved), 'PPP')
                                                        ) : (
                                                            <span>Select date approved</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={data.leave_date_approved ? parseISO(data.leave_date_approved) : undefined}
                                                        onSelect={(date) => {
                                                            setOpenApproved(false);
                                                            setData('leave_date_approved', date ? format(date, 'yyyy-MM-dd') : '');
                                                        }}
                                                        disabled={() => false}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        {errors.leave_date_approved && <div className="text-xs text-red-500">{errors.leave_date_approved}</div>}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Approval Workflow Section */}
                    {/* <Card className="animate-fade-in border-main transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <CardTitle className="text-primary">Approval Workflow</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        
                        <div className="flex items-center justify-between space-x-4">
                            
                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                    {leave.supervisor_status === 'approved' ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : leave.supervisor_status === 'rejected' ? (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    ) : (
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    )}
                                    <Label className="text-sm font-semibold">Stage 1: Supervisor Approval</Label>
                                </div>
                                <div className={`ml-7 space-y-2 ${isHR && !isSuperAdmin ? 'opacity-50' : ''}`}>
                                    <div className="text-xs text-muted-foreground">
                                        Status: <span className="font-medium capitalize">{leave.supervisor_status || 'Pending'}</span>
                                    </div>
                                    {leave.supervisor_approver && (
                                        <div className="text-xs text-muted-foreground">
                                            Approved by: <span className="font-medium">{leave.supervisor_approver.name}</span>
                                        </div>
                                    )}
                                    {leave.supervisor_approved_at && (
                                        <div className="text-xs text-muted-foreground">
                                            Date: <span className="font-medium">{format(parseISO(leave.supervisor_approved_at), 'PPP')}</span>
                                        </div>
                                    )}
                                    {(isSupervisor || isSuperAdmin) &&
                                        !(isHR && !isSuperAdmin) &&
                                        (leave.supervisor_status === 'pending' || !leave.supervisor_status) && (
                                            <div className="mt-3 space-y-2">
                                                <Select
                                                    value={data.supervisor_status || 'pending'}
                                                    onValueChange={(val) => setData('supervisor_status', val)}
                                                    disabled={isHR && !isSuperAdmin}
                                                >
                                                    <SelectTrigger className="w-full" disabled={isHR && !isSuperAdmin}>
                                                        <SelectValue placeholder="Select action" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {supervisorStatuses
                                                            .filter((s) => s.value !== 'pending')
                                                            .map((status) => (
                                                                <SelectItem key={status.value} value={status.value}>
                                                                    {status.label}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                <Textarea
                                                    placeholder="Supervisor comments (optional)"
                                                    value={data.supervisor_comments}
                                                    onChange={(e) => setData('supervisor_comments', e.target.value)}
                                                    rows={2}
                                                    className="resize-none"
                                                    disabled={isHR && !isSuperAdmin}
                                                />
                                            </div>
                                        )}
                                    {leave.supervisor_comments && (
                                        <div className="mt-2 rounded bg-muted p-2 text-xs text-muted-foreground">
                                            Comments: {leave.supervisor_comments}
                                        </div>
                                    )}
                                </div>
                            </div>

                          
                            <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />

                            
                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                    {leave.hr_status === 'approved' ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : leave.hr_status === 'rejected' ? (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    ) : leave.supervisor_status === 'approved' ? (
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    ) : (
                                        <Clock className="h-5 w-5 text-gray-400" />
                                    )}
                                    <Label className="text-sm font-semibold">Stage 2: HR Approval</Label>
                                </div>
                                <div className="ml-7 space-y-2">
                                    <div className="text-xs text-muted-foreground">
                                        Status:{' '}
                                        <span className="font-medium capitalize">
                                            {leave.supervisor_status !== 'approved' ? 'Waiting for Supervisor' : leave.hr_status || 'Pending'}
                                        </span>
                                    </div>
                                    {leave.hr_approver && (
                                        <div className="text-xs text-muted-foreground">
                                            Approved by: <span className="font-medium">{leave.hr_approver.name}</span>
                                        </div>
                                    )}
                                    {leave.hr_approved_at && (
                                        <div className="text-xs text-muted-foreground">
                                            Date: <span className="font-medium">{format(parseISO(leave.hr_approved_at), 'PPP')}</span>
                                        </div>
                                    )}
                                    {(isHR || isSuperAdmin) &&
                                        leave.supervisor_status === 'approved' &&
                                        (leave.hr_status === 'pending' || !leave.hr_status) && (
                                            <div className="mt-3 space-y-2">
                                                <Select value={data.hr_status || 'pending'} onValueChange={(val) => setData('hr_status', val)}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select action" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {hrStatuses
                                                            .filter((s) => s.value !== 'pending')
                                                            .map((status) => (
                                                                <SelectItem key={status.value} value={status.value}>
                                                                    {status.label}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                <Textarea
                                                    placeholder="HR comments (optional)"
                                                    value={data.hr_comments}
                                                    onChange={(e) => setData('hr_comments', e.target.value)}
                                                    rows={2}
                                                    className="resize-none"
                                                />
                                            </div>
                                        )}
                                    {leave.hr_comments && (
                                        <div className="mt-2 rounded bg-muted p-2 text-xs text-muted-foreground">Comments: {leave.hr_comments}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                       
                        {process.env.NODE_ENV === 'development' && (
                            <Alert className="mt-4 border-blue-300 bg-blue-50 text-blue-800">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    <div className="mb-1 font-semibold">Debug Info:</div>
                                    <div>User ID: {user?.id || 'N/A'}</div>
                                    <div>User Role: {isSupervisor ? 'Supervisor' : isHR ? 'HR' : isSuperAdmin ? 'Super Admin' : 'None'}</div>
                                    <div>User Roles: {user?.roles?.join(', ') || 'N/A'}</div>
                                    <div>isSupervisor: {String(isSupervisor)}</div>
                                    <div>isHR: {String(isHR)}</div>
                                    <div>isSuperAdmin: {String(isSuperAdmin)}</div>
                                    <div>Supervisor Status: {leave.supervisor_status || 'null'}</div>
                                    <div>HR Status: {leave.hr_status || 'null'}</div>
                                    <div>Leave Status: {leave.leave_status || leave.status}</div>
                                    <div>Employee Department: {employee.department || 'N/A'}</div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card> */}

                    {/* Action Buttons */}
                    <div className="animate-fade-in flex justify-end space-x-4 pt-6">
                        <Button variant="outline" className="transition-all hover:scale-105" disabled={processing} type="button" onClick={handleBack}>
                            Cancel
                        </Button>
                        {/* Show submit button for supervisors when they need to approve */}
                        {(isSupervisor || isSuperAdmin) && (leave.supervisor_status === 'pending' || !leave.supervisor_status) && (
                            <Button
                                variant="main"
                                disabled={processing || !data.supervisor_status || data.supervisor_status === 'pending'}
                                type="submit"
                            >
                                {processing ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Submit Supervisor Approval
                                    </>
                                )}
                            </Button>
                        )}
                        {/* Show submit button for HR when they need to approve */}
                        {(isHR || isSuperAdmin) && leave.supervisor_status === 'approved' && (leave.hr_status === 'pending' || !leave.hr_status) && (
                            <Button variant="main" disabled={processing || !data.hr_status || data.hr_status === 'pending'} type="submit">
                                {processing ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Submit HR Approval
                                    </>
                                )}
                            </Button>
                        )}
                        {/* Show general save button for Super Admin with full permissions */}
                        {isSuperAdmin &&
                            can('Leave Status Approval') &&
                            !((isSupervisor || isSuperAdmin) && (leave.supervisor_status === 'pending' || !leave.supervisor_status)) &&
                            !(
                                (isHR || isSuperAdmin) &&
                                leave.supervisor_status === 'approved' &&
                                (leave.hr_status === 'pending' || !leave.hr_status)
                            ) && (
                                <Button variant="main" disabled={processing} type="submit">
                                    {processing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            )}
                    </div>
                </div>
            </form>

            {/* PDF Preview Dialog - same flow/structure as daily-attendance view */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="h-[90vh] w-full min-w-[70vw] p-0">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle>Leave Request Preview</DialogTitle>
                    </DialogHeader>
                    <div className="h-[calc(90vh-80px)] w-full overflow-auto bg-gray-100">
                        <style>
                            {`
                            .react-pdf__Page {
                                margin: 0 !important;
                                padding: 0 !important;
                                max-width: 100% !important;
                            }
                            .react-pdf__Page__canvas {
                                margin: 0 !important;
                                display: block !important;
                                max-width: 100% !important;
                                width: 100% !important;
                                height: auto !important;
                            }
                            .react-pdf__Document {
                                display: flex !important;
                                flex-direction: column !important;
                                align-items: stretch !important;
                                width: 100% !important;
                            }
                            .react-pdf__Page__textContent {
                                width: 100% !important;
                            }
                        `}
                        </style>
                        <PDFViewer
                            width="100%"
                            height="100%"
                            style={{
                                borderRadius: '0',
                                border: 'none',
                            }}
                            showToolbar={true}
                        >
                            {LeavePDFTemplate({
                                leave: {
                                    id: leave.id,
                                    leave_start_date: data.leave_start_date,
                                    employee_name: data.employee_name,
                                    leave_type: data.leave_type,
                                    leave_end_date: data.leave_end_date,
                                    leave_days: data.leave_days.toString(),
                                    status: data.leave_status,
                                    leave_reason: data.leave_reason,
                                    leave_date_reported: data.leave_date_reported,
                                    leave_date_approved: data.leave_date_approved,
                                    leave_comments: data.leave_comments,
                                    picture: toAbsoluteUrl(data.picture),
                                    department: data.department,
                                    position: data.position,
                                    employeeid: data.employeeid,
                                },
                                companyName: 'CFARBEMCO',
                                logoPath: toAbsoluteUrl('/AGOC.png'),
                            })()}
                        </PDFViewer>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
