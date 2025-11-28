'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CalendarDays, CheckCircle, Clock, CreditCard, FileText, User, XCircle } from 'lucide-react';

interface AbsenceRequest {
    id: string;
    absence_type: string;
    from_date: string;
    to_date: string;
    days: number;
    status: string;
    reason: string;
    submitted_at: string;
    approved_at: string | null;
    approval_comments: string | null;
    is_partial_day: boolean;
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

interface ViewAbsenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    absence: AbsenceRequest | null;
}

export function ViewAbsenceModal({ isOpen, onClose, absence }: ViewAbsenceModalProps) {
    if (!absence) return null;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
                        Absence Request Details
                    </DialogTitle>
                    <DialogDescription>View detailed information about your absence request</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Employee Information */}
                    <div className="flex items-center space-x-4 rounded-lg bg-gray-50 p-4">
                        <div className="flex-shrink-0">
                            {absence.picture ? (
                                <img src={absence.picture} alt="Profile" className="border-main h-16 w-16 rounded-full border-2 object-cover" />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-100">
                                    <User className="h-8 w-8 text-gray-500" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{absence.employee_name}</h3>
                            <p className="text-sm text-gray-600">ID: {absence.employeeid}</p>
                            <p className="text-sm text-gray-600">
                                {absence.position} - {absence.department}
                            </p>
                        </div>
                        <div className="text-right">
                            <Badge className={`${getStatusColor(absence.status)} flex items-center gap-1`}>
                                {getStatusIcon(absence.status)}
                                {absence.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Absence Details */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-orange-600" />
                                <span className="font-medium">Absence Type</span>
                            </div>
                            <p className="ml-6 text-sm text-gray-600">{absence.absence_type}</p>

                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Duration</span>
                            </div>
                            <p className="ml-6 text-sm text-gray-600">
                                {absence.days} day{absence.days > 1 ? 's' : ''} {absence.is_partial_day ? '(Partial Day)' : ''}
                            </p>

                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-purple-600" />
                                <span className="font-medium">Absence Period</span>
                            </div>
                            <p className="ml-6 text-sm text-gray-600">
                                {new Date(absence.from_date).toLocaleDateString()} - {new Date(absence.to_date).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-600" />
                                <span className="font-medium">Submitted Date</span>
                            </div>
                            <p className="ml-6 text-sm text-gray-600">{new Date(absence.submitted_at).toLocaleDateString()}</p>

                            {absence.approved_at && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="font-medium">Approved Date</span>
                                    </div>
                                    <p className="ml-6 text-sm text-gray-600">{new Date(absence.approved_at).toLocaleDateString()}</p>
                                </>
                            )}

                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-600" />
                                <span className="font-medium">Created</span>
                            </div>
                            <p className="ml-6 text-sm text-gray-600">{new Date(absence.created_at).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Absence Credits Information */}
                    <div className="rounded-lg bg-orange-50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-900">Absence Credits</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-orange-600">{absence.remaining_credits}</p>
                                <p className="text-xs text-orange-700">Remaining</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{absence.used_credits}</p>
                                <p className="text-xs text-blue-700">Used</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{absence.total_credits}</p>
                                <p className="text-xs text-green-700">Total</p>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">Reason for Absence</span>
                        </div>
                        <p className="ml-6 rounded-md bg-gray-50 p-3 text-sm text-gray-600">{absence.reason}</p>
                    </div>

                    {/* Approval Comments */}
                    {absence.approval_comments && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-600" />
                                <span className="font-medium">Approval Comments</span>
                            </div>
                            <p className="ml-6 rounded-md bg-gray-50 p-3 text-sm text-gray-600">{absence.approval_comments}</p>
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
