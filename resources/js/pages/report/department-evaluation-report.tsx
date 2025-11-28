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
import { ArrowLeft, ClipboardList, Download, Eye, FileText, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AdminPDF from './components/admin-pdf';
import EvaluationFormPDF from './components/evaluation-form-pdf';

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

interface Evaluation {
    id: number;
    employee_id: number;
    employee_name: string;
    employeeid: string;
    department: string;
    position: string;
    picture: string | null;
    rating_date: string | null;
    evaluation_year: number | null;
    evaluation_period: number | null;
    period_label: string | null;
    total_rating: number | null;
    evaluator: string | null;
    observations: string | null;
    department_supervisor: { id: number; name: string } | null;
    department_manager: { id: number; name: string } | null;
    attendance: {
        days_late: number;
        days_absent: number;
        rating: number;
        remarks: string | null;
    } | null;
    attitudes: {
        supervisor_rating: number;
        supervisor_remarks: string | null;
        coworker_rating: number;
        coworker_remarks: string | null;
    } | null;
    workAttitude: {
        responsible: number;
        job_knowledge: number;
        cooperation: number;
        initiative: number;
        dependability: number;
        remarks: string | null;
    } | null;
    workFunctions: Array<{
        function_name: string;
        work_quality: number;
        work_efficiency: number;
    }>;
}

interface PageProps {
    evaluations: Evaluation[];
    department: string;
    [key: string]: any;
}

export default function DepartmentEvaluationReportPage() {
    const { evaluations, department } = usePage<PageProps>().props;
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [exporting, setExporting] = useState<number | null>(null);

    const handleViewPDF = (evaluation: Evaluation) => {
        setSelectedEvaluation(evaluation);
        setShowPreview(true);
    };

    const handleExportPDF = async (evaluation: Evaluation) => {
        setExporting(evaluation.id);
        try {
            const filename = `Evaluation_${evaluation.employeeid}_${format(new Date(evaluation.rating_date || new Date()), 'yyyy-MM-dd')}.pdf`;

            // Use AdminPDF for Management & Staff(Admin) department, otherwise use EvaluationFormPDF
            const isAdminDepartment = evaluation.department === 'Management & Staff(Admin)';
            const pdfDocument = isAdminDepartment ? <AdminPDF evaluation={evaluation} /> : <EvaluationFormPDF evaluation={evaluation} />;
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

    // Format rating for display
    const formatRating = (rating: number | null | string | undefined): string => {
        if (rating === null || rating === undefined || rating === '') return 'N/A';
        const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
        if (isNaN(numRating)) return 'N/A';
        return numRating.toFixed(1);
    };

    return (
        <SidebarProvider>
            <Head title={`${department} Performance Report`} />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader
                        breadcrumbs={[
                            { title: 'Report', href: '/report' },
                            { title: `${department} Performance Report`, href: '#' },
                        ]}
                        title={''}
                    />
                    <Card className="m-5 space-y-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center">
                                <ClipboardList className="text-cfarbempco-green mr-2 h-5 w-5" />
                                {department} Performance Report
                            </CardTitle>
                            <CardDescription>List of all employee evaluations for {department}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {evaluations.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="text-muted-foreground">No evaluations found for this department</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid max-h-[calc(100vh-300px)] grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {evaluations.map((evaluation) => (
                                        <Card
                                            key={evaluation.id}
                                            className="border-purple-200 bg-purple-50/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:bg-background"
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center gap-3">
                                                    {evaluation.picture ? (
                                                        <img
                                                            src={evaluation.picture}
                                                            alt={evaluation.employee_name}
                                                            className="h-12 w-12 rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/Logo.png';
                                                            }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="/Logo.png"
                                                            alt={evaluation.employee_name}
                                                            className="h-12 w-12 rounded-full object-cover"
                                                        />
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <CardTitle className="truncate text-sm">{evaluation.employee_name}</CardTitle>
                                                        <CardDescription className="truncate text-xs">
                                                            {evaluation.employeeid} • {evaluation.position}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Rating:</span>
                                                        <span className="flex items-center gap-1 font-medium">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            {formatRating(evaluation.total_rating)}
                                                        </span>
                                                    </div>
                                                    {evaluation.rating_date && (
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">Date:</span>
                                                            <span className="font-medium">
                                                                {format(new Date(evaluation.rating_date), 'MMM dd, yyyy')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {evaluation.period_label && (
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">Period:</span>
                                                            <span className="font-medium">
                                                                {evaluation.period_label} {evaluation.evaluation_year}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {evaluation.evaluator && (
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">Evaluator:</span>
                                                            <span className="max-w-[120px] truncate font-medium">{evaluation.evaluator}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewPDF(evaluation)}>
                                                        <Eye className="mr-1 h-3 w-3" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => handleExportPDF(evaluation)}
                                                        disabled={exporting === evaluation.id}
                                                    >
                                                        <Download className="mr-1 h-3 w-3" />
                                                        {exporting === evaluation.id ? 'Exporting...' : 'Export'}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center justify-start gap-2 pt-4">
                                <Button variant="outline" onClick={() => router.visit('/report?tab=evaluation')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </SidebarInset>
            </SidebarHoverLogic>

            {/* PDF Preview Dialog */}
            {selectedEvaluation && (
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogContent className="h-[90vh] w-full min-w-[70vw] p-0">
                        <DialogHeader className="px-6 pt-6 pb-4">
                            <DialogTitle>Evaluation Form Preview</DialogTitle>
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
                                {selectedEvaluation.department === 'Management & Staff(Admin)' ? (
                                    <AdminPDF evaluation={selectedEvaluation} />
                                ) : (
                                    <EvaluationFormPDF evaluation={selectedEvaluation} />
                                )}
                            </PDFViewer>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </SidebarProvider>
    );
}
