'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CalendarDays, CheckCircle, Clock, CreditCard, FileText, User, XCircle } from 'lucide-react';

interface LeaveRequest {
    id: string;
    leave_type: string;
    leave_start_date: string;
    leave_end_date: string;
    leave_days: number;
    leave_status: string;
    leave_reason: string;
    leave_date_reported: string;
    leave_date_approved: string | null;
    leave_comments: string;
    created_at: string;
    employee_name: string;
    picture: string;
    department: string;
    employeeid: string;
    position: string;
    remaining_credits: number;
    used_credits: number;
    total_credits: number;
}

interface ViewLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    leave: LeaveRequest | null;
}

export function ViewLeaveModal({ isOpen, onClose, leave }: ViewLeaveModalProps) {
    if (!leave) return null;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'Rejected':
                return <XCircle className="h-4 w-4" />;
            case 'Pending':
                return <AlertCircle className="h-4 w-4" />;
            case 'Cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Cancelled':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Leave Request Details
                    </DialogTitle>
                    <DialogDescription>View detailed information about your leave request</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Employee Information */}
                    <div className="flex items-center space-x-4 rounded-lg bg-gray-50 p-4">
                        <div className="flex-shrink-0">
                            {leave.picture ? (
                                <img src={leave.picture} alt="Profile" className="border-main h-16 w-16 rounded-full border-2 object-cover" />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-100">
                                    <User className="h-8 w-8 text-gray-500" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{leave.employee_name}</h3>
                            <p className="text-sm text-gray-600">ID: {leave.employeeid}</p>
                            <p className="text-sm text-gray-600">
                                {leave.position} - {leave.department}
                            </p>
                        </div>
                        <div className="text-right">
                            <Badge className={`${getStatusColor(leave.leave_status)} flex items-center gap-1`}>
                                {getStatusIcon(leave.leave_status)}
                                {leave.leave_status}
                            </Badge>
                        </div>
                    </div>

                    {/* Leave Details */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">Leave Type</span>
                            </div>
                            <p className="ml-6 text-sm text-gray-600">{leave.leave_type}</p>

                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Duration</span>
                            </div>
                            <p className="ml-6 text-sm text-gray-600">
                                {leave.leave_days} day{leave.leave_days > 1 ? 's' : ''}
                            </p>

                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-purple-600" />
                                <span className="font-medium">Leave Period</span>
                            </div>
                            <p className="ml-6 text-sm text-gray-600">
                                {new Date(leave.leave_start_date).toLocaleDateString()} - {new Date(leave.leave_end_date).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-600" />
                                <span className="font-medium">Reported Date</span>
                            </div>
                            <p className="ml-6 text-sm text-gray-600">{new Date(leave.leave_date_reported).toLocaleDateString()}</p>

                            {leave.leave_date_approved && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="font-medium">Approved Date</span>
                                    </div>
                                    <p className="ml-6 text-sm text-gray-600">{new Date(leave.leave_date_approved).toLocaleDateString()}</p>
                                </>
                            )}

                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-600" />
                                <span className="font-medium">Submitted</span>
                            </div>
                            <p className="ml-6 text-sm text-gray-600">{new Date(leave.created_at).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Leave Credits Information */}
                    <div className="rounded-lg bg-blue-50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">Leave Credits</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{leave.remaining_credits}</p>
                                <p className="text-xs text-blue-700">Remaining</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-600">{leave.used_credits}</p>
                                <p className="text-xs text-orange-700">Used</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{leave.total_credits}</p>
                                <p className="text-xs text-green-700">Total</p>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">Reason for Leave</span>
                        </div>
                        <p className="ml-6 rounded-md bg-gray-50 p-3 text-sm text-gray-600">{leave.leave_reason}</p>
                    </div>

                    {/* Comments */}
                    {leave.leave_comments && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-600" />
                                <span className="font-medium">Comments</span>
                            </div>
                            <p className="ml-6 rounded-md bg-gray-50 p-3 text-sm text-gray-600">{leave.leave_comments}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
