import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Calendar, Clock, FileText, Plus, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Request Forms', href: '/employee-view/absence' },
    { title: 'Absence Requests', href: '/employee-view/absence/requests' },
];

interface AbsenceRequest {
    id: number;
    absence_type: string;
    from_date: string;
    to_date: string;
    days: number;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    is_partial_day: boolean;
    submitted_at: string;
    approved_at?: string;
    approval_comments?: string;
}

interface Employee {
    id: number;
    employeeid: string;
    employee_name: string;
    firstname: string;
    lastname: string;
    department: string;
    position: string;
    picture?: string;
}

interface Props {
    employee: Employee;
    absenceRequests: AbsenceRequest[];
}

export default function AbsenceRequests({ employee, absenceRequests = [] }: Props) {
    const [requests, setRequests] = useState<AbsenceRequest[]>(absenceRequests);
    const [loading, setLoading] = useState(false);
    const { props } = usePage<{ absenceRequests?: AbsenceRequest[] }>();

    // Update local state when server data changes
    useEffect(() => {
        if (props.absenceRequests && Array.isArray(props.absenceRequests)) {
            setRequests(props.absenceRequests);
        }
    }, [props.absenceRequests]);

    // Set up real-time updates using Echo
    useEffect(() => {
        const echo = (window as any).Echo;
        if (!echo || !employee?.id) return;

        const channelName = `employee.${employee.id}`;
        const employeeChannel = echo.channel(channelName);

        employeeChannel.listen('.RequestStatusUpdated', (e: any) => {
            console.log('Absence status update received:', e);

            if (e.type === 'absence_status') {
                setRequests((prev) =>
                    prev.map((request) =>
                        request.id === e.request_id
                            ? {
                                  ...request,
                                  status: e.status,
                                  approved_at:
                                      e.status !== 'pending'
                                          ? new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
                                          : request.approved_at,
                                  approval_comments: e.meta?.approval_comments || request.approval_comments,
                              }
                            : request,
                    ),
                );

                const statusText = e.status === 'approved' ? 'approved' : e.status === 'rejected' ? 'rejected' : String(e.status);
                toast.success(`Your absence request has been ${statusText}!`);
            }
        });

        return () => {
            employeeChannel.stopListening('.RequestStatusUpdated');
        };
    }, [employee?.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return '✅';
            case 'pending':
                return '⏳';
            case 'rejected':
                return '❌';
            default:
                return '📋';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            // Refresh the page data
            window.location.reload();
        } catch (error) {
            toast.error('Failed to refresh data');
        } finally {
            setLoading(false);
        }
    };

    const groupedRequests = {
        pending: requests.filter((r) => r.status === 'pending'),
        approved: requests.filter((r) => r.status === 'approved'),
        rejected: requests.filter((r) => r.status === 'rejected'),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absence Requests" />
            <Toaster position="top-center" richColors />

            <div className="w-full space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xl font-semibold">
                            <FileText className="h-5 w-5 text-emerald-600" />
                            <span>My Absence Requests</span>
                        </div>
                        <p className="text-sm text-muted-foreground">View and track your absence requests</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button size="sm" onClick={() => (window.location.href = '/employee-view/absence/request')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Request
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="all" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
                        <TabsTrigger value="pending">Pending ({groupedRequests.pending.length})</TabsTrigger>
                        <TabsTrigger value="approved">Approved ({groupedRequests.approved.length})</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected ({groupedRequests.rejected.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        <AbsenceRequestsTable requests={requests} />
                    </TabsContent>

                    <TabsContent value="pending" className="space-y-4">
                        <AbsenceRequestsTable requests={groupedRequests.pending} />
                    </TabsContent>

                    <TabsContent value="approved" className="space-y-4">
                        <AbsenceRequestsTable requests={groupedRequests.approved} />
                    </TabsContent>

                    <TabsContent value="rejected" className="space-y-4">
                        <AbsenceRequestsTable requests={groupedRequests.rejected} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function AbsenceRequestsTable({ requests }: { requests: AbsenceRequest[] }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return '✅';
            case 'pending':
                return '⏳';
            case 'rejected':
                return '❌';
            default:
                return '📋';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (requests.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No absence requests found</h3>
                    <p className="mb-4 text-center text-muted-foreground">You haven't submitted any absence requests yet.</p>
                    <Button onClick={() => (window.location.href = '/employee-view/absence/request')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Submit New Request
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Absence Requests</CardTitle>
                <CardDescription>Your submitted absence requests and their current status</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Date Range</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell className="font-medium">
                                    {request.absence_type}
                                    {request.is_partial_day && (
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            Partial Day
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {formatDate(request.from_date)} - {formatDate(request.to_date)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {request.days} {request.days === 1 ? 'day' : 'days'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${getStatusColor(request.status)} border`}>
                                        <span className="mr-1">{getStatusIcon(request.status)}</span>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{formatDateTime(request.submitted_at)}</TableCell>
                                <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm">
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
