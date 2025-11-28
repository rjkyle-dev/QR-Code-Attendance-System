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
import { ArrowLeft, ClipboardList, Download, Eye, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AbsenceFormPDF from './components/absence-form-pdf';

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

interface Absence {
    id: string;
    absence_type: string;
    from_date: string;
    to_date: string;
    days: number;
    is_partial_day: boolean;
    status: string;
    reason: string;
    submitted_at: string;
    approved_at: string | null;
    hr_approved_at: string | null;
    employee_name: string;
    employeeid: string;
    department: string;
    position: string;
    picture: string | null;
    supervisor_approver: { id: number; name: string } | null;
    hr_approver: { id: number; name: string } | null;
}

interface PageProps {
    absences: Absence[];
    hrEmployee: { id: number; name: string } | null;
    [key: string]: any;
}

export default function EmployeeAbsenteeismReportPage() {
    const { absences, hrEmployee } = usePage<PageProps>().props;
    const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [exporting, setExporting] = useState<string | null>(null);

    const handleViewPDF = (absence: Absence) => {
        setSelectedAbsence(absence);
        setShowPreview(true);
    };

    const handleExportPDF = async (absence: Absence) => {
        setExporting(absence.id);
        try {
            const filename = `Absence_Form_${absence.employeeid}_${format(new Date(absence.from_date), 'yyyy-MM-dd')}.pdf`;

            const pdfDocument = <AbsenceFormPDF absence={absence} hrEmployeeName={hrEmployee?.name || ''} />;
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

    // Format absence type for display
    const formatAbsenceType = (type: string): string => {
        const typeMap: Record<string, string> = {
            'Annual Leave': 'AL',
            'Personal Leave': 'PL',
            'Maternity/Paternity': 'M/P',
            'Sick Leave': 'SL',
            'Emergency Leave': 'EL',
            Other: 'Other',
        };
        return typeMap[type] || type;
    };

    return (
        <SidebarProvider>
            <Head title="Employee Absenteeism Report" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader
                        breadcrumbs={[
                            { title: 'Report', href: '/report' },
                            { title: 'Employee Absenteeism Report', href: '/report/employee-absenteeism-report' },
                        ]}
                        title={''}
                    />
                    <Card className="m-5 space-y-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center">
                                <ClipboardList className="text-cfarbempco-green mr-2 h-5 w-5" />
                                Employee Absenteeism Report
                            </CardTitle>
                            <CardDescription>List of all approved absence applications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {absences.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="text-muted-foreground">No approved absences found</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {absences.map((absence) => (
                                        <Card key={absence.id} className="border-emerald-200 bg-emerald-50/50 dark:bg-backgrounds transition-all duration-300 hover:scale-3d hover:shadow-lg">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center gap-3">
                                                    {absence.picture ? (
                                                        <img
                                                            src={absence.picture}
                                                            alt={absence.employee_name}
                                                            className="h-12 w-12 rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/Logo.png';
                                                            }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="/Logo.png"
                                                            alt={absence.employee_name}
                                                            className="h-12 w-12 rounded-full object-cover"
                                                        />
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <CardTitle className="truncate text-sm">{absence.employee_name}</CardTitle>
                                                        <CardDescription className="truncate text-xs">
                                                            {absence.employeeid} • {absence.department}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Type:</span>
                                                        <span className="font-medium">{formatAbsenceType(absence.absence_type)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Days:</span>
                                                        <span className="font-medium">
                                                            {absence.days} day(s)
                                                            {absence.is_partial_day && ' (Partial)'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Period:</span>
                                                        <span className="text-right font-medium">
                                                            {format(new Date(absence.from_date), 'MMM dd')} -{' '}
                                                            {format(new Date(absence.to_date), 'MMM dd, yyyy')}
                                                        </span>
                                                    </div>
                                                    {absence.hr_approved_at && (
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">Approved:</span>
                                                            <span className="font-medium">
                                                                {format(new Date(absence.hr_approved_at), 'MMM dd, yyyy')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewPDF(absence)}>
                                                        <Eye className="mr-1 h-3 w-3" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => handleExportPDF(absence)}
                                                        disabled={exporting === absence.id}
                                                    >
                                                        <Download className="mr-1 h-3 w-3" />
                                                        {exporting === absence.id ? 'Exporting...' : 'Export'}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                            <div className="ml-5 flex items-center justify-start gap-2 pt-4">
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
            {selectedAbsence && (
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogContent className="h-[90vh] w-full min-w-[70vw] p-0">
                        <DialogHeader className="px-6 pt-6 pb-4">
                            <DialogTitle>Absence Form Preview</DialogTitle>
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
                                <AbsenceFormPDF absence={selectedAbsence} hrEmployeeName={hrEmployee?.name || ''} />
                            </PDFViewer>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </SidebarProvider>
    );
}
