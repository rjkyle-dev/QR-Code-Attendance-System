import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, UserCheck, UserX, Building, Briefcase, FileText } from 'lucide-react';
import { type Absence } from './columns';

interface ViewAbsenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    absence: Absence | null;
}

const ViewAbsenceModal = ({ isOpen, onClose, absence }: ViewAbsenceModalProps) => {
    if (!absence) return null;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-800',
                    borderColor: 'border-green-200',
                    icon: UserCheck,
                    iconColor: 'text-green-600'
                };
            case 'rejected':
                return {
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-800',
                    borderColor: 'border-red-200',
                    icon: UserX,
                    iconColor: 'text-red-600'
                };
            default:
                return {
                    bgColor: 'bg-yellow-50',
                    textColor: 'text-yellow-800',
                    borderColor: 'border-yellow-200',
                    icon: Clock,
                    iconColor: 'text-yellow-600'
                };
        }
    };

    const getTypeColor = (type: string) => {
        const typeColors = {
            'Annual Leave': 'bg-purple-100 text-purple-800 border-purple-200',
            'Personal Leave': 'bg-blue-100 text-blue-800 border-blue-200',
            'Sick Leave': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Emergency Leave': 'bg-red-100 text-red-800 border-red-200',
            'Maternity/Paternity': 'bg-pink-100 text-pink-800 border-pink-200',
            'Other': 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const statusConfig = getStatusConfig(absence.status);
    const StatusIcon = statusConfig.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-2 border-cfar-400">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-900">Absence Request Details</DialogTitle>
                    <DialogDescription className="text-gray-600">Complete information about the absence request</DialogDescription>
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
                                    <AvatarImage src={absence.picture} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                                        {(absence.full_name || absence.employee_name)
                                            ? (absence.full_name || absence.employee_name)
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()
                                            : 'EMP'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {absence.full_name || absence.employee_name}
                                        </h3>
                                        <p className="text-sm text-gray-600">Employee ID: {absence.employee_id_number}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Building className="h-4 w-4 text-blue-600" />
                                            <span>{absence.department}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Briefcase className="h-4 w-4 text-blue-600" />
                                            <span>{absence.position}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Absence Details Card */}
                    <Card className="border-2 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-green-900">
                                <Calendar className="h-5 w-5" />
                                Absence Request Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Status and Type Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Absence Type</span>
                                        <div className="mt-1">
                                            <Badge className={`${getTypeColor(absence.absence_type)} border px-3 py-1 text-sm font-semibold`}>
                                                {absence.absence_type}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-medium text-gray-700">Request Status</span>
                                    <div className="mt-1">
                                        <Badge 
                                            className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border px-4 py-2 text-sm font-semibold`}
                                        >
                                            <StatusIcon className={`mr-2 h-4 w-4 ${statusConfig.iconColor}`} />
                                            {absence.status.charAt(0).toUpperCase() + absence.status.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Date and Duration Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">From Date</p>
                                            <p className="text-lg font-semibold text-gray-900">{absence.from_date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-600">To Date</p>
                                            <p className="text-lg font-semibold text-gray-900">{absence.to_date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Duration</p>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                                <span className="text-lg font-semibold text-gray-900">
                                                    {absence.days} {absence.days === 1 ? 'day' : 'days'}
                                                </span>
                                            </div>
                                        </div>
                                        {absence.is_partial_day && (
                                            <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                                                Partial Day
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Submitted On</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {format(new Date(absence.submitted_at), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>

                                    {absence.approved_at && (
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Processed On</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {format(new Date(absence.approved_at), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reason Card */}
                    <Card className="border-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-purple-900">
                                <FileText className="h-5 w-5" />
                                Reason for Absence
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-white rounded-lg border border-gray-200 min-h-[80px]">
                                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                                    {absence.reason || 'No reason provided'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105 transition-transform"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewAbsenceModal;
