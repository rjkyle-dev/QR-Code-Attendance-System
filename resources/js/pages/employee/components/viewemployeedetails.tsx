import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Employee } from '@/hooks/employees';
import { usePermission } from '@/hooks/user-permission';
import { useForm } from '@inertiajs/react';
import { Briefcase, Building, Calendar, Edit, Fingerprint, Key, Mail, MapPin, Phone, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import FingerprintCapture from './fingerprintcapture';

interface EmployeeDetailsModalProps {
    employee: Employee | null; // Accepts the new backend response shape
    isOpen: boolean;
    onClose: () => void;
    onEdit: (employee: Employee) => void;
    onDelete: (id: string, onSuccess: () => void) => void;
    onRegisterFingerprint?: (employee: Employee) => void;
}

const ViewEmployeeDetails = ({ isOpen, onClose, employee, onEdit, onDelete, onRegisterFingerprint }: EmployeeDetailsModalProps) => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [birth, setBirth] = useState<Date | undefined>(undefined);
    const [fingerprintData, setFingerprintData] = useState<any | null>(null);
    const [fingerprintSaved, setFingerprintSaved] = useState(false);
    const [savingFingerprint, setSavingFingerprint] = useState(false);
    const { can } = usePermission();
    // Add WebSocket logic to listen for fingerprint_data and display it
    const [wsFingerprintData, setWsFingerprintData] = useState<any | null>(null);
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'fingerprint_data') {
                    setWsFingerprintData(data);
                }
            } catch {}
        };
        return () => ws.close();
    }, []);

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
    const isAddCrew = data.work_status === 'Add Crew';

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
        }
    }, [employee]);

    const handleDelete = () => {
        if (employee) {
            onDelete(employee.id, onClose);
        }
    };

    // Function to check fingerprint status
    const getFingerprintStatus = () => {
        if (!employee) return { hasFingerprint: false, count: 0, status: 'No Employee' };

        if (employee.fingerprints && employee.fingerprints.length > 0) {
            return {
                hasFingerprint: true,
                count: employee.fingerprints.length,
                status: 'Fingerprint Registered',
            };
        }

        return {
            hasFingerprint: false,
            count: 0,
            status: 'No Fingerprint Registered',
        };
    };

    const fingerprintStatus = getFingerprintStatus();

    const handleFingerprintCapture = (fingerprintData: any) => {
        setFingerprintData(fingerprintData);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-h-[90vh] w-full overflow-y-auto border-2 border-green-200 bg-white shadow-2xl sm:max-w-[900px]">
                    <DialogHeader className="flex items-center border-b border-green-200 pb-4">
                        <User className="mr-3 h-6 w-6 text-green-600" />
                        <DialogTitle className="text-2xl font-bold text-green-800">Employee Details</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 p-6">
                        {/* Employee Details Section - Top Card */}
                        <Card className="border-2 border-green-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-8">
                                    {/* Profile Picture */}
                                    <div className="flex-shrink-0">
                                        <div className="relative h-32 w-32">
                                            {data.picture ? (
                                                <img
                                                    src={data.picture}
                                                    alt="Profile"
                                                    className="h-32 w-32 rounded-full border-4 border-green-300 object-cover shadow-lg"
                                                />
                                            ) : (
                                                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-green-300 bg-green-50">
                                                    <img
                                                        src="AGOC.png"
                                                        className="animate-scale-in dark:border-darksMain h-32 w-32 rounded-full border-2 border-cfar-400 object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 text-center">
                                            <h2 className="text-xl font-bold break-words text-green-800" title={data.employee_name}>
                                                {data.employee_name}
                                            </h2>
                                            {!isAddCrew && (
                                                <Badge className="mt-1 bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                                    ID: {data.employeeid}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Employee Details Grid - Improved overflow handling */}
                                    <div className="min-w-0 flex-1">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="flex min-w-0 items-center space-x-3">
                                                <User className="h-5 w-5 flex-shrink-0 text-green-600" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600">Gender:</span>
                                                <span className="min-w-0 truncate text-sm text-gray-800" title={data.gender}>
                                                    {data.gender}
                                                </span>
                                            </div>

                                            {!isAddCrew && (
                                                <div className="flex min-w-0 items-center space-x-3">
                                                    <Building className="h-5 w-5 flex-shrink-0 text-green-600" />
                                                    <span className="flex-shrink-0 text-sm font-medium text-gray-600">Department:</span>
                                                    <span className="min-w-0 truncate text-sm text-gray-800" title={data.department}>
                                                        {data.department}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex min-w-0 items-center space-x-3">
                                                <Calendar className="h-5 w-5 flex-shrink-0 text-green-600" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600">Birth Date:</span>
                                                <span
                                                    className="min-w-0 truncate text-sm text-gray-800"
                                                    title={data.date_of_birth ? formatDate(data.date_of_birth) : 'N/A'}
                                                >
                                                    {data.date_of_birth ? formatDate(data.date_of_birth) : 'N/A'}
                                                </span>
                                            </div>

                                            {!isAddCrew && (
                                                <div className="flex min-w-0 items-center space-x-3">
                                                    <Briefcase className="h-5 w-5 flex-shrink-0 text-green-600" />
                                                    <span className="flex-shrink-0 text-sm font-medium text-gray-600">Position:</span>
                                                    <span className="min-w-0 truncate text-sm text-gray-800" title={data.position}>
                                                        {data.position}
                                                    </span>
                                                </div>
                                            )}

                                            {!isAddCrew && (
                                                <div className="flex min-w-0 items-center space-x-3">
                                                    <User className="h-5 w-5 flex-shrink-0 text-green-600" />
                                                    <span className="flex-shrink-0 text-sm font-medium text-gray-600">Marital Status:</span>
                                                    <span className="min-w-0 truncate text-sm text-gray-800" title={data.marital_status}>
                                                        {data.marital_status}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex min-w-0 items-center space-x-3 sm:col-span-2">
                                                <Mail className="h-5 w-5 flex-shrink-0 text-green-600" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600">Email:</span>
                                                <span className="min-w-0 truncate text-sm text-gray-800" title={data.email}>
                                                    {data.email}
                                                </span>
                                            </div>

                                            <div className="flex min-w-0 items-center space-x-3 sm:col-span-2">
                                                <Phone className="h-5 w-5 flex-shrink-0 text-green-600" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600">Phone:</span>
                                                <span className="min-w-0 truncate text-sm text-gray-800" title={data.phone}>
                                                    {data.phone}
                                                </span>
                                            </div>

                                            <div className="flex min-w-0 items-center space-x-3 sm:col-span-2">
                                                <Key className="h-5 w-5 flex-shrink-0 text-green-600" />
                                                <span className="flex-shrink-0 text-sm font-medium text-gray-600">PIN:</span>
                                                <span className="min-w-0 truncate font-mono text-sm text-gray-800" title={data.pin || 'Not set'}>
                                                    {data.pin || 'Not set'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employment Information Section - Middle Card */}
                        {!isAddCrew && (
                            <Card className="border-2 border-green-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-green-800">Employment Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="flex min-w-0 items-center space-x-3">
                                            <Calendar className="h-5 w-5 flex-shrink-0 text-green-600" />
                                            <span className="flex-shrink-0 text-sm font-medium text-gray-600">Hired Date:</span>
                                            <span
                                                className="min-w-0 truncate text-sm text-gray-800"
                                                title={data.service_tenure ? formatDate(data.service_tenure) : 'N/A'}
                                            >
                                                {data.service_tenure ? formatDate(data.service_tenure) : 'N/A'}
                                            </span>
                                        </div>

                                        <div className="flex min-w-0 flex-col items-start space-y-2">
                                            <span className="text-sm font-medium text-gray-600">Employee Rating:</span>
                                            {employee && employee.latest_rating ? (
                                                <span className="min-w-0 truncate text-sm text-gray-800" title={employee.latest_rating}>
                                                    {employee.latest_rating}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-500">No rating</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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

                        {/* Government Accounts Section - Only for non-Add Crew */}
                        {!isAddCrew && (data.philhealth_user_id || data.sss_user_id || data.hdmf_user_id || data.tin_user_id) && (
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

                        {/* Fingerprints Section - Updated with registration functionality */}
                        <Card className="border-2 border-green-200 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold text-green-800">Fingerprints</CardTitle>
                                    {/* Fingerprint Status Badge - Updated with proper colors */}
                                    <Badge
                                        className={`px-3 py-1 text-sm font-medium ${
                                            fingerprintStatus.hasFingerprint
                                                ? 'border border-green-300 bg-green-100 text-green-800'
                                                : 'border border-red-300 bg-red-100 text-red-800'
                                        }`}
                                    >
                                        <Fingerprint
                                            className={`mr-2 h-4 w-4 ${fingerprintStatus.hasFingerprint ? 'text-green-600' : 'text-red-600'}`}
                                        />
                                        {fingerprintStatus.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Fingerprint Capture Component - Added from editemployeemodal.tsx */}
                                <div className="space-y-4">
                                    <div className="md:col-span-2">
                                        <h4 className="text-md mb-3 flex items-center gap-2 font-semibold text-green-800">
                                            <Fingerprint className="text-main h-4 w-4" />
                                            Fingerprint Capture
                                        </h4>
                                        <FingerprintCapture
                                            onFingerprintCaptured={handleFingerprintCapture}
                                            employeeId={data.employeeid}
                                            employeeDatabaseId={employee?.id}
                                            workStatus={data.work_status}
                                            employeeFingerprints={employee?.fingerprints || []}
                                        />

                                        {/* WebSocket Fingerprint Preview - Added from editemployeemodal.tsx */}
                                        {wsFingerprintData && (
                                            <div className="mt-4 text-center">
                                                <div className="mb-2 font-medium text-green-800">Fingerprint Preview:</div>
                                                <img
                                                    src={`data:image/png;base64,${wsFingerprintData.fingerprint_image}`}
                                                    alt="Fingerprint Preview"
                                                    className="mx-auto h-32 w-32 border object-contain"
                                                />
                                                <div className="text-xs text-green-600">
                                                    Captured at:{' '}
                                                    {wsFingerprintData.fingerprint_captured_at
                                                        ? new Date(wsFingerprintData.fingerprint_captured_at).toLocaleString()
                                                        : ''}
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
