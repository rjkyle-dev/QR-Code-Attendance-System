import LeavePDFTemplate from '@/components/pdf/leave-pdf-template';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { usePermission } from '@/hooks/user-permission';
import { pdf } from '@react-pdf/renderer';
import { Briefcase, Building, Calendar, CheckCircle, Clock, Download, Star, Trash2, User, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Leave } from '../types/leave';

interface LeaveDetailsModalProps {
    leave: Leave | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (leave: Leave) => void;
    onDelete: (id: string, onSuccess: () => void) => void;
}

const ViewLeaveDetails = ({ isOpen, onClose, leave, onEdit, onDelete }: LeaveDetailsModalProps) => {
    const { can } = usePermission();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={`h-5 w-5 ${index < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
        ));
    };

    const [preview, setPreview] = useState<string>('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [data, setData] = useState({
        id: '',
        leave_start_date: '',
        employee_name: '',
        leave_type: '',
        leave_end_date: '',
        leave_days: '',
        status: '',
        leave_reason: '',
        leave_date_reported: '',
        leave_date_approved: '',
        leave_comments: '',
        picture: '',
        department: '',
        position: '',
        employeeid: '',
    });

    useEffect(() => {
        if (leave) {
            console.log('Populating form with leave:', leave);
            populateForm(leave);
        }
    }, [leave]);

    const populateForm = (data: Leave) => {
        setData({
            id: data.id,
            leave_start_date: data.leave_start_date,
            employee_name: data.employee_name,
            leave_type: data.leave_type,
            leave_end_date: data.leave_end_date,
            leave_days: data.leave_days,
            status: data.status,
            leave_reason: data.leave_reason,
            leave_date_reported: data.leave_date_reported,
            leave_date_approved: data.leave_date_approved,
            leave_comments: data.leave_comments,
            picture: data.picture,
            employeeid: data.employeeid,
            department: data.department,
            position: data.position,
        });
        setPreview(data.picture);
    };

    const handleDelete = () => {
        if (leave) {
            onDelete(leave.id, onClose);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'Pending':
                return {
                    bgColor: 'bg-yellow-50',
                    textColor: 'text-yellow-800',
                    borderColor: 'border-yellow-200',
                    icon: Clock,
                    iconColor: 'text-yellow-600',
                };
            case 'Approved':
                return {
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-800',
                    borderColor: 'border-green-200',
                    icon: CheckCircle,
                    iconColor: 'text-green-600',
                };
            case 'Rejected':
                return {
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-800',
                    borderColor: 'border-red-200',
                    icon: XCircle,
                    iconColor: 'text-red-600',
                };
            default:
                return {
                    bgColor: 'bg-gray-50',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-200',
                    icon: Clock,
                    iconColor: 'text-gray-600',
                };
        }
    };

    const statusConfig = getStatusConfig(data.status);
    const StatusIcon = statusConfig.icon;

    // Build absolute URLs for images to ensure PDF can access them
    const toAbsoluteUrl = (url?: string) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${origin}${path}`;
    };

    const handleDownloadPDF = async () => {
        if (!leave) return;
        const LeaveDocument = LeavePDFTemplate({
            leave: { ...leave, picture: toAbsoluteUrl(leave.picture) },
            companyName: 'CFARBEMCO',
            logoPath: toAbsoluteUrl('/Logo.png'),
        });
        const instance = pdf(LeaveDocument());
        const blob = await instance.toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leave-request-${leave.employeeid || 'employee'}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-2 border-cfar-400">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-900">Leave Request Details</DialogTitle>
                    <DialogDescription className="text-gray-600">Complete information about the leave request</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Employee Information Card */}
                    <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-900">
                                <User className="h-5 w-5" />
                                Employee Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start space-x-4">
                                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                    <AvatarImage src={data.picture} className="size-20" />
                                    <AvatarFallback className="bg-blue-100 text-lg font-semibold text-blue-600">
                                        {data.employee_name
                                            ? data.employee_name
                                                  .split(' ')
                                                  .map((n) => n[0])
                                                  .join('')
                                                  .toUpperCase()
                                            : 'EMP'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{data.employee_name}</h3>
                                        <p className="text-sm text-gray-600">Employee ID: {data.employeeid}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Building className="h-4 w-4 text-blue-600" />
                                            <span>{data.department}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Briefcase className="h-4 w-4 text-blue-600" />
                                            <span>{data.position}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Details Card */}
                    <Card className="border-2 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-green-900">
                                <Calendar className="h-5 w-5" />
                                Leave Request Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Request Status</span>
                                <Badge
                                    className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border px-4 py-2 text-sm font-semibold`}
                                >
                                    <StatusIcon className={`mr-2 h-4 w-4 ${statusConfig.iconColor}`} />
                                    {data.status}
                                </Badge>
                            </div>

                            <Separator />

                            {/* Leave Information Grid */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Leave Type</p>
                                        <p className="text-lg font-semibold text-gray-900">{data.leave_type}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Duration</p>
                                        <p className="text-lg font-semibold text-blue-600">{data.leave_days} days</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Start Date</p>
                                        <p className="text-lg font-semibold text-gray-900">{formatDate(data.leave_start_date)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">End Date</p>
                                        <p className="text-lg font-semibold text-gray-900">{formatDate(data.leave_end_date)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Submitted On</p>
                                        <p className="text-lg font-semibold text-gray-900">{formatDate(data.leave_date_reported)}</p>
                                    </div>
                                </div>

                                {data.leave_date_approved && (
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Approved On</p>
                                            <p className="text-lg font-semibold text-gray-900">{formatDate(data.leave_date_approved)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reason and Comments Card */}
                    <Card className="border-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-purple-900">Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Leave Reason</label>
                                <div className="min-h-[80px] rounded-lg border border-gray-200 bg-white p-4">
                                    <p className="leading-relaxed text-gray-900">{data.leave_reason || 'No reason provided'}</p>
                                </div>
                            </div>

                            {data.leave_comments && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Comments</label>
                                    <div className="min-h-[80px] rounded-lg border border-gray-200 bg-white p-4">
                                        <p className="leading-relaxed text-gray-900">{data.leave_comments}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-4">
                    {can('Download Leave PDF') && (
                        <Button
                            variant="outline"
                            onClick={handleDownloadPDF}
                            className="border-blue-500 bg-blue-50 text-blue-600 transition-transform hover:scale-105 hover:bg-blue-100"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    )}
                    {/* {can('Update Leave') && (
                        <Link href={route('leave.edit', data.id)}>
                            <Button
                                variant="outline"
                                className="border-green-500 bg-green-50 text-green-600 transition-transform hover:scale-105 hover:bg-green-100"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                
                            </Button>
                        </Link>
                    )} */}
                    {can('Delete Leave') && (
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="border-red-500 bg-red-50 text-red-600 transition-transform hover:scale-105 hover:bg-red-100"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Request
                        </Button>
                    )}
                </div>
            </DialogContent>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            {data.employee_name || data.employeeid
                                ? `Are you sure you want to delete the leave request for ${data.employee_name ? data.employee_name : ''}${data.employeeid ? ` (ID: ${data.employeeid})` : ''}? This action cannot be undone.`
                                : 'Are you sure you want to delete this leave request? This action cannot be undone.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-gray-300">
                            Cancel
                        </Button>
                        {can('Delete Leave') && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    handleDelete();
                                    setShowDeleteConfirm(false);
                                }}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};

export default ViewLeaveDetails;
