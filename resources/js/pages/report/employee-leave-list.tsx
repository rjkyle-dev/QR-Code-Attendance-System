import { AppSidebar } from '@/components/app-sidebar';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { Head, router, usePage } from '@inertiajs/react';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ArrowLeft, CalendarDays, ClipboardList, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import LeaveFormPDF from './components/leave-form-pdf';

function SidebarHoverLogic({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const { handleMouseEnter, handleMouseLeave } = useSidebarHover();
    return (
        <>
            <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <AppSidebar onMouseLeave={handleMouseLeave} />
            {children}
        </>
    );
}

interface Leave {
    id: string;
    leave_type: string;
    leave_start_date: string;
    leave_end_date: string;
    leave_days: number;
    status: string;
    leave_reason: string;
    leave_date_reported: string;
    leave_date_approved: string | null;
    leave_comments: string | null;
    employee_name: string;
    employeeid: string;
    department: string;
    position: string;
    picture: string | null;
    supervisor_approver: { id: number; name: string } | null;
    hr_approver: { id: number; name: string } | null;
    department_hr: { id: number; name: string } | null;
    department_manager: { id: number; name: string } | null;
    used_credits: number | null;
    remaining_credits: number | null;
}

interface PageProps {
    leaves: Leave[];
}

export default function EmployeeLeaveListPage() {
    const { leaves } = usePage<PageProps>().props;
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [exporting, setExporting] = useState<string | null>(null);

    const handleViewPDF = (leave: Leave) => {
        setSelectedLeave(leave);
        setShowPreview(true);
    };

    const handleExportPDF = async (leave: Leave) => {
        setExporting(leave.id);
        try {
            const filename = `Leave_Form_${leave.employeeid}_${format(new Date(leave.leave_start_date), 'yyyy-MM-dd')}.pdf`;

            const pdfDocument = <LeaveFormPDF leave={leave} />;
            const instance = pdf(pdfDocument);
            const blob = await instance.toBlob();

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('PDF exported successfully');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error('Failed to export PDF');
        } finally {
            setExporting(null);
        }
    };

    // Format leave type for display
    const formatLeaveType = (type: string): string => {
        const typeMap: Record<string, string> = {
            'Vacation Leave': 'VL',
            'Sick Leave': 'SL',
            'Emergency Leave': 'EL',
            Voluntary: 'Voluntary',
            Resignation: 'Resignation',
        };
        return typeMap[type] || type;
    };

    return (
        <SidebarProvider>
            <Head title="Employee Leave List" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader
                        breadcrumbs={[
                            { title: 'Report', href: '/report' },
                            { title: 'Employee Leave List', href: '/report/employee-leave-list' },
                        ]}
                        title={''}
                    />
                    <Card className="m-5 space-y-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center">
                                <ClipboardList className="text-cfarbempco-green mr-2 h-5 w-5" />
                                Employee Leave List
                            </CardTitle>
                            <CardDescription>List of all approved leave applications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {leaves.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="text-muted-foreground">No approved leaves found</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {leaves.map((leave) => (
                                        <Card key={leave.id} className="border-emerald-200 bg-emerald-50/50 dark:bg-backgrounds transition-all duration-300 hover:scale-3d hover:shadow-lg">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center gap-3">
                                                    {leave.picture ? (
                                                        <img
                                                            src={leave.picture}
                                                            alt={leave.employee_name}
                                                            className="h-12 w-12 rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/AGOC.png';
                                                            }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="/AGOC.png"
                                                            alt={leave.employee_name}
                                                            className="h-12 w-12 rounded-full object-cover"
                                                        />
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <CardTitle className="truncate text-sm">{leave.employee_name}</CardTitle>
                                                        <CardDescription className="truncate text-xs">
                                                            {leave.employeeid} • {leave.department}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Leave Type:</span>
                                                        <span className="font-medium">{formatLeaveType(leave.leave_type)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Days:</span>
                                                        <span className="font-medium">{leave.leave_days} day(s)</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Period:</span>
                                                        <span className="text-right font-medium">
                                                            {format(new Date(leave.leave_start_date), 'MMM dd')} -{' '}
                                                            {format(new Date(leave.leave_end_date), 'MMM dd, yyyy')}
                                                        </span>
                                                    </div>
                                                    {leave.leave_date_approved && (
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">Approved:</span>
                                                            <span className="font-medium">
                                                                {format(new Date(leave.leave_date_approved), 'MMM dd, yyyy')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewPDF(leave)}>
                                                        <Eye className="mr-1 h-3 w-3" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => handleExportPDF(leave)}
                                                        disabled={exporting === leave.id}
                                                    >
                                                        <Download className="mr-1 h-3 w-3" />
                                                        {exporting === leave.id ? 'Exporting...' : 'Export'}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-start gap-2 pt-4">
                                <Button variant="outline" onClick={() => router.visit('/report')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </SidebarInset>
            </SidebarHoverLogic>

            {/* PDF Preview Dialog */}
            {selectedLeave && (
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogContent className="h-[90vh] w-full min-w-[70vw] p-0">
                        <DialogHeader className="px-6 pt-6 pb-4">
                            <DialogTitle>Leave Form Preview</DialogTitle>
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
                                <LeaveFormPDF leave={selectedLeave} />
                            </PDFViewer>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </SidebarProvider>
    );
}
