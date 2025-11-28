import { AppSidebar } from '@/components/app-sidebar';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { Head, router } from '@inertiajs/react';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import axios from 'axios';
import { ArrowLeft, ClipboardList, Eye, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import GenderDevelopmentPDF from './components/gender-development-pdf';

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

interface Employee {
    id: string;
    employee_name: string;
    gender: string | null;
    date_of_birth: string | null;
}

interface GenderDistribution {
    male: number;
    female: number;
    total: number;
}

interface AgeRangeDistribution {
    '20-30': { male: number; female: number; total: number };
    '31-40': { male: number; female: number; total: number };
    '41-50': { male: number; female: number; total: number };
    '51+': { male: number; female: number; total: number };
}

export default function GenderDevelopmentPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [observations, setObservations] = useState<string>('');
    const [preparedBy, setPreparedBy] = useState<{ id: number; name: string } | null>(null);
    const [notedBy, setNotedBy] = useState<{ id: number; name: string } | null>(null);

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth: string | null): number | null => {
        if (!dateOfBirth) return null;
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Get age range from age
    const getAgeRange = (age: number | null): string | null => {
        if (age === null) return null;
        if (age >= 20 && age <= 30) return '20-30';
        if (age >= 31 && age <= 40) return '31-40';
        if (age >= 41 && age <= 50) return '41-50';
        if (age >= 51) return '51+';
        return null;
    };

    // Calculate gender distribution
    const genderDistribution = useMemo<GenderDistribution>(() => {
        const male = employees.filter((emp) => emp.gender?.toLowerCase() === 'male').length;
        const female = employees.filter((emp) => emp.gender?.toLowerCase() === 'female').length;
        const total = employees.length;
        return { male, female, total };
    }, [employees]);

    // Calculate age range distribution
    const ageRangeDistribution = useMemo<AgeRangeDistribution>(() => {
        const ranges: AgeRangeDistribution = {
            '20-30': { male: 0, female: 0, total: 0 },
            '31-40': { male: 0, female: 0, total: 0 },
            '41-50': { male: 0, female: 0, total: 0 },
            '51+': { male: 0, female: 0, total: 0 },
        };

        employees.forEach((emp) => {
            const age = calculateAge(emp.date_of_birth);
            const range = getAgeRange(age);
            if (range && emp.gender) {
                const gender = emp.gender.toLowerCase();
                if (gender === 'male') {
                    ranges[range as keyof AgeRangeDistribution].male++;
                } else if (gender === 'female') {
                    ranges[range as keyof AgeRangeDistribution].female++;
                }
                ranges[range as keyof AgeRangeDistribution].total++;
            }
        });

        return ranges;
    }, [employees]);

    // Fetch employees data, HR, and Manager
    useEffect(() => {
        fetchEmployees();
        fetchHR();
        fetchManager();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/employees');
            const employeeData = response.data.data || response.data || [];
            setEmployees(employeeData);
        } catch (error: any) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load employee data');
        } finally {
            setLoading(false);
        }
    };

    const fetchHR = async () => {
        try {
            const response = await axios.get('/api/gender-development/hr');
            setPreparedBy(response.data);
        } catch (error: any) {
            console.error('Error fetching HR:', error);
            // Don't show error toast, just log it
        }
    };

    const fetchManager = async () => {
        try {
            const response = await axios.get('/api/gender-development/manager');
            setNotedBy(response.data);
        } catch (error: any) {
            console.error('Error fetching Manager:', error);
            // Don't show error toast, just log it
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const reportData = {
                male_count: genderDistribution.male,
                female_count: genderDistribution.female,
                total_count: genderDistribution.total,
                age_20_30_male: ageRangeDistribution['20-30'].male,
                age_20_30_female: ageRangeDistribution['20-30'].female,
                age_20_30_total: ageRangeDistribution['20-30'].total,
                age_31_40_male: ageRangeDistribution['31-40'].male,
                age_31_40_female: ageRangeDistribution['31-40'].female,
                age_31_40_total: ageRangeDistribution['31-40'].total,
                age_41_50_male: ageRangeDistribution['41-50'].male,
                age_41_50_female: ageRangeDistribution['41-50'].female,
                age_41_50_total: ageRangeDistribution['41-50'].total,
                age_51_plus_male: ageRangeDistribution['51+'].male,
                age_51_plus_female: ageRangeDistribution['51+'].female,
                age_51_plus_total: ageRangeDistribution['51+'].total,
                observations: observations,
                prepared_by_user_id: preparedBy?.id || null,
                noted_by_user_id: notedBy?.id || null,
                report_date: new Date().toISOString().split('T')[0],
            };

            await axios.post('/api/gender-development/store', reportData);
            toast.success('Report saved successfully');
        } catch (error: any) {
            console.error('Error saving report:', error);
            toast.error(error.response?.data?.message || 'Failed to save report');
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const filename = `Gender_And_Development_Report_${new Date().toISOString().split('T')[0]}.pdf`;

            const pdfDocument = (
                <GenderDevelopmentPDF
                    genderDistribution={genderDistribution}
                    ageRangeDistribution={ageRangeDistribution}
                    observations={observations}
                    preparedBy={preparedBy?.name || ''}
                    notedBy={notedBy?.name || ''}
                />
            );
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
    };

    // Calculate percentages
    const getPercentage = (value: number, total: number): string => {
        if (total === 0) return '0.00';
        return ((value / total) * 100).toFixed(2);
    };

    return (
        <SidebarProvider>
            <Head title="Gender and Development Report" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader
                        breadcrumbs={[
                            { title: 'Report', href: '/report' },
                            { title: 'Gender and Development', href: '/report/gender-development' },
                        ]}
                        title={''}
                    />
                    <Card className="border-main m-5 space-y-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center">
                                <ClipboardList className="text-cfarbempco-green mr-2 h-5 w-5" />
                                Gender and Development Report
                            </CardTitle>
                            <CardDescription>Generate and export the gender and development report.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-muted-foreground">Loading employee data...</div>
                                </div>
                            ) : (
                                <>
                                    {/* Report Preview */}
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="space-y-6">
                                                {/* Header */}
                                                <div className="text-center">
                                                    <div className="text-lg font-bold">CFARBEMPCO</div>
                                                    <div className="mt-2 text-base font-bold">GENDER AND DEVELOPMENT REPORT</div>
                                                </div>

                                                {/* Gender Distribution Summary */}
                                                <div className="space-y-2">
                                                    <div className="text-sm font-bold">Gender Distribution Summary</div>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="text-xs">Gender</TableHead>
                                                                <TableHead className="text-center text-xs">Total Employees</TableHead>
                                                                <TableHead className="text-center text-xs">Percentage</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell className="text-xs">Male</TableCell>
                                                                <TableCell className="text-center text-xs">{genderDistribution.male}</TableCell>
                                                                <TableCell className="text-center text-xs">
                                                                    {getPercentage(genderDistribution.male, genderDistribution.total)}%
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="text-xs">Female</TableCell>
                                                                <TableCell className="text-center text-xs">{genderDistribution.female}</TableCell>
                                                                <TableCell className="text-center text-xs">
                                                                    {getPercentage(genderDistribution.female, genderDistribution.total)}%
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="text-xs font-semibold">Total</TableCell>
                                                                <TableCell className="text-center text-xs font-semibold">
                                                                    {genderDistribution.total}
                                                                </TableCell>
                                                                <TableCell className="text-center text-xs font-semibold">100.00%</TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>

                                                {/* Age Range Distribution by Gender */}
                                                <div className="space-y-2">
                                                    <div className="text-sm font-bold">Age Range Distribution by Gender</div>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="text-xs">Age Range</TableHead>
                                                                <TableHead className="text-center text-xs">Male</TableHead>
                                                                <TableHead className="text-center text-xs">Female</TableHead>
                                                                <TableHead className="text-center text-xs">Total</TableHead>
                                                                <TableHead className="text-center text-xs">Percentage</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {(['20-30', '31-40', '41-50', '51+'] as const).map((range) => {
                                                                const data = ageRangeDistribution[range];
                                                                const rangeTotal = data.male + data.female;
                                                                const rangePercentage = getPercentage(rangeTotal, genderDistribution.total);
                                                                return (
                                                                    <TableRow key={range}>
                                                                        <TableCell className="text-xs">{range} years old</TableCell>
                                                                        <TableCell className="text-center text-xs">{data.male}</TableCell>
                                                                        <TableCell className="text-center text-xs">{data.female}</TableCell>
                                                                        <TableCell className="text-center text-xs">{rangeTotal}</TableCell>
                                                                        <TableCell className="text-center text-xs">{rangePercentage}%</TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                            <TableRow>
                                                                <TableCell className="text-xs font-semibold">Total</TableCell>
                                                                <TableCell className="text-center text-xs font-semibold">
                                                                    {genderDistribution.male}
                                                                </TableCell>
                                                                <TableCell className="text-center text-xs font-semibold">
                                                                    {genderDistribution.female}
                                                                </TableCell>
                                                                <TableCell className="text-center text-xs font-semibold">
                                                                    {genderDistribution.total}
                                                                </TableCell>
                                                                <TableCell className="text-center text-xs font-semibold">100.00%</TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>

                                                {/* Observations / Remarks */}
                                                <div className="space-y-2">
                                                    <div className="text-sm font-bold">Observations / Remarks:</div>
                                                    <Textarea
                                                        placeholder="Enter observations or remarks..."
                                                        value={observations}
                                                        onChange={(e) => setObservations(e.target.value)}
                                                        className="min-h-[60px]"
                                                    />
                                                </div>

                                                {/* Prepared By and Noted By */}
                                                <div className="flex flex-row gap-2 space-y-2">
                                                    <div className="flex flex-1 flex-col">
                                                        <div className="mb-1 text-sm font-bold">Prepared By:</div>
                                                        <div className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                                                            {preparedBy?.name || 'Loading...'}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-1 flex-col">
                                                        <div className="mb-1 text-sm font-bold">Noted By:</div>
                                                        <div className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                                                            {notedBy?.name || 'Loading...'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center justify-start gap-2">
                                            <Button variant="outline" onClick={() => router.visit('/report')}>
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" onClick={handleSave} disabled={saving}>
                                                <Save className="mr-2 h-4 w-4" />
                                                {saving ? 'Saving...' : 'Save'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setShowPreview(true);
                                                }}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Button>
                                            <Button variant="main" onClick={handleExport} disabled={exporting}>
                                                {exporting ? 'Exporting...' : 'Export PDF'}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </SidebarInset>
            </SidebarHoverLogic>

            {/* PDF Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="h-[90vh] w-full min-w-[70vw] p-0">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle>Gender and Development Report Preview</DialogTitle>
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
                            <GenderDevelopmentPDF
                                genderDistribution={genderDistribution}
                                ageRangeDistribution={ageRangeDistribution}
                                observations={observations}
                                preparedBy={preparedBy?.name || ''}
                                notedBy={notedBy?.name || ''}
                            />
                        </PDFViewer>
                    </div>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
