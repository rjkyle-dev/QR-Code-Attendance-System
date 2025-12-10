import LeavePDF from '@/components/pdf/leave-pdf';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { router, useForm, usePage } from '@inertiajs/react';
import { differenceInDays, format, parseISO } from 'date-fns';
import {
    AlertCircle,
    ArrowLeft,
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
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const leaveTypes = ['Annual Leave', 'Sick Leave', 'Emergency Leave', 'Maternity Leave', 'Paternity Leave', 'Bereavement Leave', 'Personal Leave'];
const leaveStatuses = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

export default function LeaveEditPage() {
    const leave = (usePage().props as any).leave;
    const employee = leave.employee || {};

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
        leave_status: leave.status || 'Pending',
        
    });

    const [openApproved, setOpenApproved] = useState(false);
    const [showPDF, setShowPDF] = useState(false);

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
        if (!data.leave_date_approved) {
            setData('leave_date_approved', format(new Date(), 'yyyy-MM-dd'));
            setTimeout(() => {
                put(route('leave.update', leave.id), {
                    onSuccess: () => {
                        toast.success('Leave status update successfully');
                    },
                    onError: (errors: any) => {
                        toast.error('Failed to update leave date approved');
                    },
                    preserveScroll: true,
                });
            }, 0);
        } else {
            put(route('leave.update', leave.id), {
                onSuccess: () => {
                    toast.success('Leave status update successfully');
                },
                onError: (errors: any) => {
                    toast.error('Failed to update leave status');
                },
                preserveScroll: true,
            });
        }
    };

    const handleBack = () => {
        router.visit(route('leave.index'));
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
        <form onSubmit={handleSubmit} className="animate-fade-in min-h-screen bg-background p-6">
            <div className="mb-2">
                <Alert className="border-yellow-300 bg-yellow-50 text-yellow-800">
                    <AlertCircle className="mr-2 inline-block h-4 w-4 align-text-bottom" />
                    <div className="flex flex-1/2 space-x-2">
                        Reminder: You can only change or update the
                        <span className="ml-2 font-semibold">status</span>
                        <span>of this leave request. All other fields are read-only.</span>
                        <TextLink href='#status' className='font-semibold text-yellow-800 underline-offset-2 '>Proceed</TextLink>
                    </div>
                </Alert>
            </div>
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <Button type="button" variant="outline" className="flex items-center gap-2" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Button type="button" variant="main" className="flex items-center gap-2" onClick={() => setShowPDF(true)}>
                    <Download className="h-4 w-4" />
                    Download PDF
                </Button>
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
                                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-main bg-muted">
                                        <img src={data.picture ? data.picture : '/AGOC.png'} alt="Employee" className="h-full w-full object-cover" />
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
                                        <Button
                                            variant="main"
                                            className="transition-all hover:scale-105"
                                            disabled={processing}
                                            type="button"
                                            // onClick={handleBack}
                                        >
                                            Sent
                                        </Button>
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
                                <DatePicker date={data.leave_start_date} onDateChange={() => {}} placeholder="Select start date" disabled={true} />
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                            <div className="" id='status'>
                                <div className="item-center flex">
                                    <Label htmlFor="leave-status" className="mr-1 text-sm font-medium">
                                        Status:
                                    </Label>

                                    <span className="mt-1 px-2 text-xs text-muted-foreground">Current status: </span>
                                    <span className="mb-2">{getStatusBadge(leave.leave_status || leave.status)}</span>
                                </div>
                                <Select value={data.leave_status} onValueChange={(val) => setData('leave_status', val)}>
                                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveStatuses.map((status) => (
                                            <SelectItem key={status} value={status} className="cursor-pointer">
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.leave_status && <div className="text-xs text-red-500">{errors.leave_status}</div>}
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
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="animate-fade-in flex justify-end space-x-4 pt-6">
                    <Button variant="outline" className="transition-all hover:scale-105" disabled={processing} type="button" onClick={handleBack}>
                        Cancel
                    </Button>
                    <Button className="bg-main-600 transition-all hover:scale-105 hover:bg-main" disabled={processing} type="submit">
                        {processing ? (
                            <>
                                <div className="n mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
            <Dialog open={showPDF} onOpenChange={setShowPDF}>
                <DialogContent className="max-w-3xl">{leave && <LeavePDF leave={leave} />}</DialogContent>
            </Dialog>
        </form>
    );
}
