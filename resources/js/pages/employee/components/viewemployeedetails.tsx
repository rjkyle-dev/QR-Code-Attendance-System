import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Employee } from '@/hooks/employees';
import { usePermission } from '@/hooks/user-permission';
import { useForm } from '@inertiajs/react';
import { Briefcase, Building, Calendar, Download, Edit, Key, Mail, MapPin, Phone, QrCode, Trash2, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface EmployeeDetailsModalProps {
    employee: Employee | null; // Accepts the new backend response shape
    isOpen: boolean;
    onClose: () => void;
    onEdit: (employee: Employee) => void;
    onDelete: (id: string, onSuccess: () => void) => void;
    onRegisterFingerprint?: (employee: Employee) => void;
}

interface QRCodeData {
    token: string;
    expires_at: string;
    expires_in: number;
    qr_data: {
        employee_id: number;
        employeeid: string;
        token: string;
        expires_at: string;
        signature: string;
    };
}

const ViewEmployeeDetails = ({ isOpen, onClose, employee, onEdit, onDelete, onRegisterFingerprint }: EmployeeDetailsModalProps) => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [birth, setBirth] = useState<Date | undefined>(undefined);
    const { can } = usePermission();
    const [qrData, setQrData] = useState<QRCodeData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const [preview, setPreview] = useState<string>('');

    // Create view-specific initial data with string picture for display
    const initialEmployeeViewData: Employee = {
        employeeid: '',
        employee_name: '',
        firstname: '',
        middlename: '',
        lastname: '',
        gender: '',
        department: '',
        position: '',
        phone: '',
        work_status: '',
        marital_status: '',
        email: '',
        address: '',
        service_tenure: '',
        date_of_birth: '',
        picture: '',
        city: '',
        state: '',
        country: '',
        zip_code: '',
        nationality: '',
        tin_user_id: '',
        sss_user_id: '',
        philhealth_user_id: '',
        hdmf_user_id: '',
        gmail_password: '',
        nbi_clearance: '',
        pin: '',
    };

    const { data, setData, errors, processing, reset, post } = useForm<Employee>(initialEmployeeViewData);

    // Flow helpers based on Work Status
    const hasWorkStatus = !!data.work_status;

    useEffect(() => {
        if (employee) {
            setData({
                employeeid: employee.employeeid,
                employee_name: employee.employee_name,
                firstname: employee.firstname,
                middlename: employee.middlename || '',
                lastname: employee.lastname,
                gender: employee.gender,
                department: employee.department,
                position: employee.position,
                phone: employee.phone,
                work_status: employee.work_status,
                marital_status: employee.marital_status || employee.status,
                service_tenure: employee.service_tenure,
                date_of_birth: employee.date_of_birth,
                email: employee.email,
                picture: employee.picture,
                nationality: employee.nationality,
                address: employee.address,
                city: employee.city,
                state: employee.state,
                country: employee.country,
                zip_code: employee.zip_code,
                tin_user_id: employee.tin_user_id || '',
                sss_user_id: employee.sss_user_id || '',
                philhealth_user_id: employee.philhealth_user_id || '',
                hdmf_user_id: employee.hdmf_user_id || '',
                gmail_password: employee.gmail_password || '',
                nbi_clearance: employee.nbi_clearance || '',
                pin: employee.pin || '',
            });

            if (employee.picture) {
                setPreview(employee.picture);
            }

            if (employee.service_tenure) {
                setDate(new Date(employee.service_tenure));
            }
            if (employee.date_of_birth) {
                setBirth(new Date(employee.date_of_birth));
            }

            // Generate QR code when employee is loaded
            if (employee.id && isOpen) {
                generateQrCode();
            }
        } else {
            setQrData(null);
        }
    }, [employee, isOpen]);

    const handleDelete = () => {
        if (employee) {
            onDelete(employee.id, onClose);
        }
    };

    const generateQrCode = async () => {
        if (!employee?.id) {
            return;
        }

        try {
            setIsGenerating(true);
            const response = await axios.post('/api/qr-code/generate-for-employee', {
                employee_id: employee.id,
                expires_in: 300, // 5 minutes
            });

            const data = response.data;

            if (data.success) {
                setQrData(data);
            } else {
                toast.error(data.message || 'Failed to generate QR code');
            }
        } catch (error: any) {
            console.error('QR code generation error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate QR code. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!qrData || !employee) return;

        try {
            // Find the QR code SVG element
            const svgElement = document.querySelector(`#qr-code-svg-${employee.id}`) as SVGSVGElement;
            if (!svgElement) {
                toast.error('QR code not found');
                return;
            }

            // Convert SVG to image
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const downloadUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = `qr-code-${employee.employeeid || employee.id}-${Date.now()}.png`;
                        link.click();
                        URL.revokeObjectURL(downloadUrl);
                        URL.revokeObjectURL(url);
                        toast.success('QR Code downloaded successfully');
                    }
                });
            };
            img.src = url;
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download QR code');
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-h-[90vh] w-full overflow-y-auto border-2 border-green-200 bg-white shadow-2xl dark:border-green-800 dark:bg-card sm:max-w-[900px]">
                    <DialogHeader className="flex items-center border-b border-green-200 pb-4 dark:border-green-800">
                        <User className="mr-3 h-6 w-6 text-green-600 dark:text-green-400" />
                        <DialogTitle className="text-2xl font-bold text-green-800 dark:text-green-200">Employee Details</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 p-6">
                        {/* Employee Details Section - Top Card */}
                        <Card className="border-2 border-green-200 shadow-sm dark:border-green-800">
                            <CardContent className="p-6">
                                <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-8">
                                    {/* Profile Picture */}
                                    <div className="flex-shrink-0">
                                        <div className="relative h-32 w-32">
                                            {data.picture ? (
                                                <img
                                                    src={data.picture}
                                                    alt="Profile"
                                                    className="h-32 w-32 rounded-full border-4 border-green-300 object-cover shadow-lg dark:border-green-700"
                                                />
                                            ) : (
                                                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20">
                                                    <img
                                                        src="AGOC.png"
                                                        className="animate-scale-in dark:border-darksMain h-32 w-32 rounded-full border-2 border-cfar-400 object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 text-center">
                                            <h2 className="text-xl font-bold break-words text-green-800 dark:text-green-200" title={data.employee_name}>
                                                {data.employee_name}
                                            </h2>
                                            <Badge className="mt-1 bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                                ID: {data.employeeid}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Employee Details Grid - Improved overflow handling */}
                                    <div className="min-w-0 flex-1">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="flex min-w-0 items-center space-x-3">
                                                <User className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">Gender:</span>
                                                <span className="min-w-0 truncate text-sm text-gray-800 dark:text-gray-200" title={data.gender}>
                                                    {data.gender}
                                                </span>
                                            </div>

                                            <div className="flex min-w-0 items-center space-x-3">
                                                <Building className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">Department:</span>
                                                <span className="min-w-0 truncate text-sm text-gray-800 dark:text-gray-200" title={data.department}>
                                                    {data.department}
                                                </span>
                                            </div>

                                            <div className="flex min-w-0 items-center space-x-3">
                                                <Calendar className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">Birth Date:</span>
                                                <span
                                                    className="min-w-0 truncate text-sm text-gray-800 dark:text-gray-200"
                                                    title={data.date_of_birth ? formatDate(data.date_of_birth) : 'N/A'}
                                                >
                                                    {data.date_of_birth ? formatDate(data.date_of_birth) : 'N/A'}
                                                </span>
                                            </div>

                                            <div className="flex min-w-0 items-center space-x-3">
                                                <Briefcase className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">Position:</span>
                                                <span className="min-w-0 truncate text-sm text-gray-800 dark:text-gray-200" title={data.position}>
                                                    {data.position}
                                                </span>
                                            </div>

                                            <div className="flex min-w-0 items-center space-x-3">
                                                <User className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">Marital Status:</span>
                                                <span className="min-w-0 truncate text-sm text-gray-800 dark:text-gray-200" title={data.marital_status}>
                                                    {data.marital_status}
                                                </span>
                                            </div>

                                            <div className="flex min-w-0 items-center space-x-3 sm:col-span-2">
                                                <Mail className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                                                <span className="min-w-0 truncate text-sm text-gray-800 dark:text-gray-200" title={data.email}>
                                                    {data.email}
                                                </span>
                                            </div>

                                            <div className="flex min-w-0 items-center space-x-3 sm:col-span-2">
                                                <Phone className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">Phone:</span>
                                                <span className="min-w-0 truncate text-sm text-gray-800 dark:text-gray-200" title={data.phone}>
                                                    {data.phone}
                                                </span>
                                            </div>

                                            <div className="flex min-w-0 items-center space-x-3 sm:col-span-2">
                                                <Key className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">PIN:</span>
                                                <span className="min-w-0 truncate font-mono text-sm text-gray-800 dark:text-gray-200" title={data.pin || 'Not set'}>
                                                    {data.pin || 'Not set'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employment Information Section - Middle Card */}
                        <Card className="border-2 border-green-200 shadow-sm dark:border-green-800">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-200">Employment Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="flex min-w-0 items-center space-x-3">
                                            <Calendar className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                            <span className="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">Hired Date:</span>
                                            <span
                                                className="min-w-0 truncate text-sm text-gray-800 dark:text-gray-200"
                                                title={data.service_tenure ? formatDate(data.service_tenure) : 'N/A'}
                                            >
                                                {data.service_tenure ? formatDate(data.service_tenure) : 'N/A'}
                                            </span>
                                        </div>

                                        <div className="flex min-w-0 flex-col items-start space-y-2">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Employee Rating:</span>
                                            {employee && employee.latest_rating ? (
                                                <span className="min-w-0 truncate text-sm text-gray-800 dark:text-gray-200" title={employee.latest_rating}>
                                                    {employee.latest_rating}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">No rating</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        {/* Contact Information Section */}
                        <Card className="border-2 border-green-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-green-800">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="flex min-w-0 items-center space-x-3">
                                        <MapPin className="h-5 w-5 flex-shrink-0 text-green-600" />
                                        <span className="flex-shrink-0 text-sm font-medium text-gray-600">Address:</span>
                                        <span className="min-w-0 truncate text-sm text-gray-800" title={data.address}>
                                            {data.address}
                                        </span>
                                    </div>

                                    <div className="flex min-w-0 items-center space-x-3">
                                        <MapPin className="h-5 w-5 flex-shrink-0 text-green-600" />
                                        <span className="flex-shrink-0 text-sm font-medium text-gray-600">City:</span>
                                        <span className="min-w-0 truncate text-sm text-gray-800" title={data.city}>
                                            {data.city}
                                        </span>
                                    </div>

                                    <div className="flex min-w-0 items-center space-x-3">
                                        <MapPin className="h-5 w-5 flex-shrink-0 text-green-600" />
                                        <span className="flex-shrink-0 text-sm font-medium text-gray-600">State:</span>
                                        <span className="min-w-0 truncate text-sm text-gray-800" title={data.state}>
                                            {data.state}
                                        </span>
                                    </div>

                                    <div className="flex min-w-0 items-center space-x-3">
                                        <MapPin className="h-5 w-5 flex-shrink-0 text-green-600" />
                                        <span className="flex-shrink-0 text-sm font-medium text-gray-600">Country:</span>
                                        <span className="min-w-0 truncate text-sm text-gray-800" title={data.country}>
                                            {data.country}
                                        </span>
                                    </div>

                                    <div className="flex min-w-0 items-center space-x-3">
                                        <MapPin className="h-5 w-5 flex-shrink-0 text-green-600" />
                                        <span className="flex-shrink-0 text-sm font-medium text-gray-600">Zip Code:</span>
                                        <span className="min-w-0 truncate text-sm text-gray-800" title={data.zip_code}>
                                            {data.zip_code}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Government Accounts Section */}
                        {(data.philhealth_user_id || data.sss_user_id || data.hdmf_user_id || data.tin_user_id) && (
                            <Card className="border-2 border-green-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-green-800">Government Accounts</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* HDMF Section */}
                                        {data.hdmf_user_id && (
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                <h4 className="mb-3 text-base font-semibold text-green-800">HDMF (Pag-IBIG)</h4>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div className="flex min-w-0 flex-col space-y-1">
                                                        <span className="text-xs font-medium text-gray-600">ID:</span>
                                                        <span className="min-w-0 truncate text-sm text-gray-800" title={data.hdmf_user_id}>
                                                            {data.hdmf_user_id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* SSS Section */}
                                        {data.sss_user_id && (
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                <h4 className="mb-3 text-base font-semibold text-green-800">SSS</h4>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div className="flex min-w-0 flex-col space-y-1">
                                                        <span className="text-xs font-medium text-gray-600">ID:</span>
                                                        <span className="min-w-0 truncate text-sm text-gray-800" title={data.sss_user_id}>
                                                            {data.sss_user_id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Philhealth Section */}
                                        {data.philhealth_user_id && (
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                <h4 className="mb-3 text-base font-semibold text-green-800">Philhealth</h4>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div className="flex min-w-0 flex-col space-y-1">
                                                        <span className="text-xs font-medium text-gray-600">ID:</span>
                                                        <span className="min-w-0 truncate text-sm text-gray-800" title={data.philhealth_user_id}>
                                                            {data.philhealth_user_id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* TIN Section */}
                                        {data.tin_user_id && (
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                <h4 className="mb-3 text-base font-semibold text-green-800">TIN</h4>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div className="flex min-w-0 flex-col space-y-1">
                                                        <span className="text-xs font-medium text-gray-600">ID:</span>
                                                        <span className="min-w-0 truncate text-sm text-gray-800" title={data.tin_user_id}>
                                                            {data.tin_user_id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Gmail Account (PIN) Section */}
                                        {(data.email || data.gmail_password) && (
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                <h4 className="mb-3 text-base font-semibold text-green-800">Gmail Account (PIN)</h4>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    {data.email && (
                                                        <div className="flex min-w-0 flex-col space-y-1">
                                                            <span className="text-xs font-medium text-gray-600">Email:</span>
                                                            <span className="min-w-0 truncate text-sm text-gray-800" title={data.email}>
                                                                {data.email}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {can('View Password') && (
                                                        <div className="flex min-w-0 flex-col space-y-1">
                                                            <span className="text-xs font-medium text-gray-600">Password/PIN:</span>
                                                            <span className="min-w-0 truncate text-sm text-gray-800">
                                                                {'•'.repeat(Math.min(data.gmail_password.length, 12))}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* QR Code Section */}
                        <Card className="border-2 border-green-200 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold text-green-800">QR Code</CardTitle>
                                    <Badge className="border border-green-300 bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                        <QrCode className="mr-2 h-4 w-4 text-green-600" />
                                        Attendance QR Code
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {qrData ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="rounded-lg border-4 border-green-300 bg-white p-4 shadow-lg">
                                                <QRCodeSVG
                                                    id={`qr-code-svg-${employee?.id}`}
                                                    value={JSON.stringify(qrData.qr_data)}
                                                    size={256}
                                                    level="H"
                                                    includeMargin={true}
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={handleDownload}
                                                    className="bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download QR Code
                                                </Button>
                                                <Button
                                                    onClick={generateQrCode}
                                                    disabled={isGenerating}
                                                    variant="outline"
                                                    className="px-6 py-2"
                                                >
                                                    {isGenerating ? 'Generating...' : 'Refresh QR Code'}
                                                </Button>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">
                                                    This QR code is valid for 5 minutes and can be used for attendance scanning.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 py-8">
                                            {isGenerating ? (
                                                <>
                                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                                                    <p className="text-sm text-gray-600">Generating QR code...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <QrCode className="h-12 w-12 text-gray-400" />
                                                    <p className="text-sm text-gray-600">No QR code available</p>
                                                    <Button
                                                        onClick={generateQrCode}
                                                        className="bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                                                    >
                                                        Generate QR Code
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 border-t border-green-200 pt-6">
                            <Button onClick={() => onEdit(employee!)} className="bg-green-600 px-6 py-2 text-white hover:bg-green-700">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Employee
                            </Button>
                            <Button onClick={handleDelete} variant="destructive" className="px-6 py-2">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Employee
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ViewEmployeeDetails;
