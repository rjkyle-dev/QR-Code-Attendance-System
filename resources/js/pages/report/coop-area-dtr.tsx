import { AppSidebar } from '@/components/app-sidebar';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { Head, router } from '@inertiajs/react';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowLeft, ClipboardList, Eye, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import CoopAreaDTRPDF from './components/coop-area-dtr-pdf';

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

interface CoopAreaEmployee {
    id: string;
    employee_name: string;
    employeeid: string;
    work_status: string;
    position: string;
    time_in: string | null;
    time_out: string | null;
}

interface CoopAreaData {
    coopArea: CoopAreaEmployee[];
    engineeringGroup: CoopAreaEmployee[];
}

export default function CoopAreaDTRPage() {
    const [reportDate, setReportDate] = useState<Date | undefined>(new Date());
    const [exportFormat, setExportFormat] = useState<'pdf' | 'xlsx'>('pdf');
    const [data, setData] = useState<CoopAreaData>({
        coopArea: [],
        engineeringGroup: [],
    });
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const titleDate = useMemo(() => (reportDate ? format(reportDate, 'MMMM dd, yyyy') : ''), [reportDate]);

    // Fetch coop area data when reportDate changes
    useEffect(() => {
        if (reportDate) {
            fetchCoopAreaData();
        }
    }, [reportDate]);

    const fetchCoopAreaData = async () => {
        if (!reportDate) return;

        setLoading(true);
        try {
            const dateStr = format(reportDate, 'yyyy-MM-dd');
            // TODO: Replace with actual API endpoint for coop area data
            const response = await axios.get('/api/coop-area/for-date', {
                params: { date: dateStr },
            });

            if (response.data) {
                setData({
                    coopArea: response.data.coopArea || [],
                    engineeringGroup: response.data.engineeringGroup || [],
                });
            }
        } catch (error) {
            console.error('Error fetching coop area data:', error);
            // For now, use empty data if API doesn't exist
            setData({
                coopArea: [],
                engineeringGroup: [],
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!reportDate) {
            toast.error('Please select a date');
            return;
        }

        if (exportFormat === 'pdf') {
            setExporting(true);
            try {
                const dateStr = reportDate ? format(reportDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
                const filename = `COOP_AREA_DTR_${dateStr}.pdf`;

                const pdfDocument = <CoopAreaDTRPDF reportDate={reportDate} data={data} />;
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
                setExporting(false);
            }
        } else {
            toast.info('Excel export coming soon');
        }
    };

    // Helper function to split employee name
    const splitEmployeeName = (fullName: string): { lastName: string; firstName: string } => {
        if (!fullName || !fullName.trim()) return { lastName: '', firstName: '' };
        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length === 0) return { lastName: '', firstName: '' };
        const lastName = nameParts[nameParts.length - 1];
        const firstName = nameParts.slice(0, -1).join(' ');
        return { lastName, firstName };
    };

    // Helper function to format time
    const formatTime = (timeStr: string | null): string => {
        if (!timeStr) return '';
        if (timeStr.includes(':')) {
            const parts = timeStr.split(':');
            return `${parts[0]}:${parts[1]}`;
        }
        return timeStr;
    };

    // Helper function to get remarks
    const getRemarks = (employee: CoopAreaEmployee): string => {
        if (employee?.time_in && employee?.time_out) {
            return 'AWP';
        } else if (!employee?.time_in && !employee?.time_out) {
            return '';
        }
        return 'SL';
    };

    return (
        <SidebarProvider>
            <Head title="COOP AREA Daily Time Record" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader
                        breadcrumbs={[
                            { title: 'Report', href: '/report' },
                            { title: 'COOP AREA DTR', href: '/report/coop-area-dtr' },
                        ]}
                        title={''}
                    />
                    <Card className="border-main m-5 space-y-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center">
                                <ClipboardList className="text-cfarbempco-green mr-2 h-5 w-5" />
                                COOP AREA Daily Time Record (DTR)
                            </CardTitle>
                            <CardDescription>Generate and export the COOP AREA daily attendance record.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Report body */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex w-full flex-row items-center justify-center">
                                            <div className="flex flex-col items-start">
                                                <div className="text-base font-semibold">COOP AREA Daily Time Record (DTR)</div>
                                            </div>
                                        </div>
                                        <div className="flex w-full flex-row items-center justify-start">
                                            <div className="flex flex-col items-start">
                                                <div className="text-sm font-semibold">CFARBEMPCO</div>
                                                <div className="mt-2 text-sm">
                                                    <span className="font-bold">DATE:</span> {titleDate}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COOP AREA Table */}
                                    <div className="mt-4">
                                        <div className="border">
                                            <div className="border-b px-2 py-1 text-[10px] font-semibold">COOP AREA</div>
                                            <div className="overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-10 text-[10px]">No.</TableHead>
                                                            <TableHead className="text-[10px]">LastName</TableHead>
                                                            <TableHead className="text-[10px]">FirstName</TableHead>
                                                            <TableHead className="w-20 text-[10px]">TIME IN</TableHead>
                                                            <TableHead className="w-20 text-[10px]">TIME OUT</TableHead>
                                                            <TableHead className="w-32 text-[10px]">REMARKS (AWP/AWOP/SL)</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {Array.from({ length: 14 }).map((_, i) => {
                                                            const employee = data.coopArea[i];
                                                            const { lastName, firstName } = employee
                                                                ? splitEmployeeName(employee.employee_name)
                                                                : { lastName: '', firstName: '' };
                                                            return (
                                                                <TableRow key={i}>
                                                                    <TableCell className="text-[10px]">{String(i + 1).padStart(2, '0')}</TableCell>
                                                                    <TableCell className="text-[10px]">{lastName}</TableCell>
                                                                    <TableCell className="text-[10px]">{firstName}</TableCell>
                                                                    <TableCell className="text-[10px]">
                                                                        {employee ? formatTime(employee.time_in) : ''}
                                                                    </TableCell>
                                                                    <TableCell className="text-[10px]">
                                                                        {employee ? formatTime(employee.time_out) : ''}
                                                                    </TableCell>
                                                                    <TableCell className="text-[10px]">
                                                                        {employee ? getRemarks(employee) : ''}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ENGEERING GROUP Table */}
                                    <div className="mt-4">
                                        <div className="mb-2 text-sm font-semibold">ENGEERING GROUP</div>
                                        <div className="border">
                                            <div className="overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-10 text-[10px]">No.</TableHead>
                                                            <TableHead className="text-[10px]">LastName</TableHead>
                                                            <TableHead className="text-[10px]">FirstName</TableHead>
                                                            <TableHead className="w-20 text-[10px]">TIME IN</TableHead>
                                                            <TableHead className="w-20 text-[10px]">TIME OUT</TableHead>
                                                            <TableHead className="w-32 text-[10px]">REMARKS (AWP/AWOP/SL)</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {Array.from({ length: 3 }).map((_, i) => {
                                                            const employee = data.engineeringGroup[i];
                                                            const { lastName, firstName } = employee
                                                                ? splitEmployeeName(employee.employee_name)
                                                                : { lastName: '', firstName: '' };
                                                            return (
                                                                <TableRow key={i}>
                                                                    <TableCell className="text-[10px]">{String(i + 1).padStart(2, '0')}</TableCell>
                                                                    <TableCell className="text-[10px]">{lastName}</TableCell>
                                                                    <TableCell className="text-[10px]">{firstName}</TableCell>
                                                                    <TableCell className="text-[10px]">
                                                                        {employee ? formatTime(employee.time_in) : ''}
                                                                    </TableCell>
                                                                    <TableCell className="text-[10px]">
                                                                        {employee ? formatTime(employee.time_out) : ''}
                                                                    </TableCell>
                                                                    <TableCell className="text-[10px]">
                                                                        {employee ? getRemarks(employee) : ''}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Checked By */}
                                    <div className="mt-6">
                                        <div className="mb-2 text-sm font-bold">Checked By:</div>
                                        <div className="h-px w-40 bg-black" />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center justify-start gap-2">
                                    <Button variant="outline" onClick={() => router.visit('/report')}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline">
                                        <Save className="mr-2 h-4 w-4" />
                                        Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            if (!reportDate) {
                                                toast.error('Please select a date');
                                                return;
                                            }
                                            setShowPreview(true);
                                        }}
                                        disabled={!reportDate}
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                    <Button variant="main" onClick={handleExport} disabled={exporting}>
                                        {exporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </SidebarInset>
            </SidebarHoverLogic>

            {/* PDF Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="h-[90vh] w-full min-w-[70vw] p-0">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle>COOP AREA DTR Preview</DialogTitle>
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
                        {reportDate && (
                            <PDFViewer
                                width="100%"
                                height="100%"
                                style={{
                                    borderRadius: '0',
                                    border: 'none',
                                }}
                                showToolbar={true}
                            >
                                <CoopAreaDTRPDF reportDate={reportDate} data={data} />
                            </PDFViewer>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
