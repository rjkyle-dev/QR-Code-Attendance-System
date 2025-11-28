import { AppSidebar } from '@/components/app-sidebar';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, ClipboardList, Eye, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import DailyAttendancePDF from './components/daily-attendance-pdf';

// Mock data for preview
const mockRows = Array.from({ length: 20 }).map((_, i) => ({
    no: i + 1,
    employeeId: `E-${String(1000 + i)}`,
    name: `Employee ${i + 1}`,
    department: i % 2 === 0 ? 'Packing' : 'Field',
    shift: i % 3 === 0 ? 'Day' : 'Night',
    inAM: '07:59',
    outAM: '12:02',
    inPM: '13:00',
    outPM: '17:01',
    otIn: '-',
    otOut: '-',
    lateMin: i % 4 === 0 ? 5 : 0,
    undertimeMin: 0,
    status: 'Present',
}));

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

interface MicroteamEmployee {
    id: string;
    employee_name: string;
    employeeid: string;
    work_status: string;
    position: string;
    time_in: string | null;
    time_out: string | null;
}

interface MicroteamData {
    'MICROTEAM - 01': MicroteamEmployee[];
    'MICROTEAM - 02': MicroteamEmployee[];
    'MICROTEAM - 03': MicroteamEmployee[];
}

interface AddCrewData {
    'ADD CREW - 01': MicroteamEmployee[];
    'ADD CREW - 02': MicroteamEmployee[];
    'ADD CREW - 03': MicroteamEmployee[];
}

export default function DailyAttendancePage() {
    const [reportDate, setReportDate] = useState<Date | undefined>(new Date());
    const [exportFormat, setExportFormat] = useState<'pdf' | 'xlsx'>('pdf');
    const [area, setArea] = useState<string>('all');
    const [microteams, setMicroteams] = useState<MicroteamData>({
        'MICROTEAM - 01': [],
        'MICROTEAM - 02': [],
        'MICROTEAM - 03': [],
    });
    const [addCrew, setAddCrew] = useState<AddCrewData>({
        'ADD CREW - 01': [],
        'ADD CREW - 02': [],
        'ADD CREW - 03': [],
    });
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [phValue, setPhValue] = useState<string>('');
    const [showPreview, setShowPreview] = useState(false);
    const [microteamSort, setMicroteamSort] = useState<'none' | 'asc' | 'desc'>('none');
    const [addCrewSort, setAddCrewSort] = useState<'none' | 'asc' | 'desc'>('none');
    const [hrName, setHrName] = useState<string>('HR Personnel');
    const [managerName, setManagerName] = useState<string>('Manager');
    const reportCardRef = useRef<HTMLDivElement>(null);
    const phInputRef = useRef<HTMLInputElement>(null);
    const currentFetchDateRef = useRef<string | null>(null);

    const titleDate = useMemo(() => (reportDate ? format(reportDate, 'MMMM dd, yyyy') : ''), [reportDate]);
    const titleDay = useMemo(() => (reportDate ? format(reportDate, 'EEEE') : ''), [reportDate]);

    // Function to disable future dates (tomorrow and beyond)
    const isDateDisabled = (date: Date): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        // Disable if date is after today (tomorrow and future dates)
        return checkDate > today;
    };

    // Fetch microteam data when reportDate changes
    useEffect(() => {
        if (reportDate) {
            fetchMicroteamData();
        }
    }, [reportDate]);

    // Fetch HR and Manager data on component mount
    useEffect(() => {
        fetchHRAndManager();
    }, []);

    const fetchHRAndManager = async () => {
        try {
            // Fetch HR
            const hrResponse = await axios.get('/api/daily-checking/hr', {
                params: { department: 'Packing Plant' },
            });
            if (hrResponse.data?.name) {
                setHrName(hrResponse.data.name);
            }

            // Fetch Manager
            const managerResponse = await axios.get('/api/daily-checking/manager', {
                params: { department: 'Packing Plant' },
            });
            if (managerResponse.data?.name) {
                setManagerName(managerResponse.data.name);
            }
        } catch (error: any) {
            console.error('Error fetching HR and Manager data:', error);
            // Keep default values on error
        }
    };

    const fetchMicroteamData = async () => {
        if (!reportDate) return;

        const dateStr = format(reportDate, 'yyyy-MM-dd');

        // Track the current fetch date to ignore stale responses
        currentFetchDateRef.current = dateStr;

        setLoading(true);
        // Reset data immediately when date changes to prevent showing stale data
        setMicroteams({
            'MICROTEAM - 01': [],
            'MICROTEAM - 02': [],
            'MICROTEAM - 03': [],
        });
        setAddCrew({
            'ADD CREW - 01': [],
            'ADD CREW - 02': [],
            'ADD CREW - 03': [],
        });

        try {
            const response = await axios.get('/api/daily-checking/for-date', {
                params: { date: dateStr },
            });

            // Check if this response is still for the current selected date
            // (ignore if user changed date while request was in flight)
            if (currentFetchDateRef.current !== dateStr) {
                console.log(`Ignoring stale response for date: ${dateStr}, current date is: ${currentFetchDateRef.current}`);
                return;
            }

            // Verify the response is for the correct date
            // Check if response has actual data (not just empty arrays)
            // Also verify that employees have time_in OR time_out for this specific date
            const hasMicroteamData =
                response.data?.microteams &&
                (response.data.microteams['MICROTEAM - 01']?.length > 0 ||
                    response.data.microteams['MICROTEAM - 02']?.length > 0 ||
                    response.data.microteams['MICROTEAM - 03']?.length > 0);

            const hasAddCrewData =
                response.data?.add_crew &&
                ((Array.isArray(response.data.add_crew) && response.data.add_crew.length > 0) ||
                    response.data.add_crew['MICROTEAM - 01']?.length > 0 ||
                    response.data.add_crew['MICROTEAM - 02']?.length > 0 ||
                    response.data.add_crew['MICROTEAM - 03']?.length > 0);

            const hasData = hasMicroteamData || hasAddCrewData;

            // Verify the response date matches the requested date
            if (response.data?.date && response.data.date !== dateStr) {
                console.log(`Date mismatch: requested ${dateStr}, got ${response.data.date}`);
                // Still proceed if data exists, but log the mismatch
            }

            // Double-check we're still fetching for the same date
            if (currentFetchDateRef.current !== dateStr) {
                console.log(`Date changed during fetch, ignoring response for: ${dateStr}`);
                return;
            }

            if (hasData) {
                // Only set data if we have actual data for the selected date
                if (hasMicroteamData && response.data.microteams) {
                    // Include ALL employees regardless of time_in/time_out status
                    const verifiedMicroteams: MicroteamData = {
                        'MICROTEAM - 01': (response.data.microteams['MICROTEAM - 01'] || []).filter((emp: MicroteamEmployee) => emp),
                        'MICROTEAM - 02': (response.data.microteams['MICROTEAM - 02'] || []).filter((emp: MicroteamEmployee) => emp),
                        'MICROTEAM - 03': (response.data.microteams['MICROTEAM - 03'] || []).filter((emp: MicroteamEmployee) => emp),
                    };

                    // Only set if at least one microteam has data
                    if (
                        verifiedMicroteams['MICROTEAM - 01'].length > 0 ||
                        verifiedMicroteams['MICROTEAM - 02'].length > 0 ||
                        verifiedMicroteams['MICROTEAM - 03'].length > 0
                    ) {
                        setMicroteams(verifiedMicroteams);
                    }
                }

                // Handle Add Crew employees grouped by microteam
                if (hasAddCrewData && response.data.add_crew) {
                    const addCrewData: AddCrewData = {
                        'ADD CREW - 01': [],
                        'ADD CREW - 02': [],
                        'ADD CREW - 03': [],
                    };

                    // Check if it's the new format (grouped by microteam) or old format (array)
                    if (
                        response.data.add_crew['MICROTEAM - 01'] ||
                        response.data.add_crew['MICROTEAM - 02'] ||
                        response.data.add_crew['MICROTEAM - 03']
                    ) {
                        // New format: grouped by microteam
                        // Include ALL employees regardless of time_in/time_out status
                        addCrewData['ADD CREW - 01'] = (response.data.add_crew['MICROTEAM - 01'] || []).filter((emp: MicroteamEmployee) => emp);
                        addCrewData['ADD CREW - 02'] = (response.data.add_crew['MICROTEAM - 02'] || []).filter((emp: MicroteamEmployee) => emp);
                        addCrewData['ADD CREW - 03'] = (response.data.add_crew['MICROTEAM - 03'] || []).filter((emp: MicroteamEmployee) => emp);
                    } else if (Array.isArray(response.data.add_crew) && response.data.add_crew.length > 0) {
                        // Old format: array (fallback for backward compatibility)
                        response.data.add_crew.forEach((employee: MicroteamEmployee, index: number) => {
                            if (employee) {
                                const crewIndex = index % 3;
                                const crewKey = `ADD CREW - ${String(crewIndex + 1).padStart(2, '0')}` as keyof AddCrewData;
                                addCrewData[crewKey].push(employee);
                            }
                        });
                    }

                    // Only set if at least one add crew has data
                    if (
                        addCrewData['ADD CREW - 01'].length > 0 ||
                        addCrewData['ADD CREW - 02'].length > 0 ||
                        addCrewData['ADD CREW - 03'].length > 0
                    ) {
                        setAddCrew(addCrewData);
                    }
                }
            } else {
                // No data for selected date - ensure arrays stay empty
                console.log(`No data found for date: ${dateStr}`);
                // Data is already reset above, but ensure it stays empty
                setMicroteams({
                    'MICROTEAM - 01': [],
                    'MICROTEAM - 02': [],
                    'MICROTEAM - 03': [],
                });
                setAddCrew({
                    'ADD CREW - 01': [],
                    'ADD CREW - 02': [],
                    'ADD CREW - 03': [],
                });
            }
        } catch (error: any) {
            console.error('Error fetching microteam data:', error);
            // If it's a 404 or no data error, keep empty state
            if (error.response?.status === 404 || error.response?.status === 204) {
                console.log(`No records found for selected date: ${dateStr}`);
            } else {
                toast.error('Failed to load microteam data');
            }
            // Ensure data is cleared on error
            setMicroteams({
                'MICROTEAM - 01': [],
                'MICROTEAM - 02': [],
                'MICROTEAM - 03': [],
            });
            setAddCrew({
                'ADD CREW - 01': [],
                'ADD CREW - 02': [],
                'ADD CREW - 03': [],
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
                // Get PH value from input
                const ph = phInputRef.current?.value || phValue || '';

                // Generate PDF using @react-pdf/renderer
                const dateStr = reportDate ? format(reportDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
                const filename = `Daily_Attendance_Report_${dateStr}.pdf`;

                // Apply sorting to microteams and addCrew for PDF export
                const sortedMicroteams: MicroteamData = {
                    'MICROTEAM - 01': sortEmployees(microteams['MICROTEAM - 01'] || [], microteamSort),
                    'MICROTEAM - 02': sortEmployees(microteams['MICROTEAM - 02'] || [], microteamSort),
                    'MICROTEAM - 03': sortEmployees(microteams['MICROTEAM - 03'] || [], microteamSort),
                };
                const sortedAddCrew: AddCrewData = {
                    'ADD CREW - 01': sortEmployees(addCrew['ADD CREW - 01'] || [], addCrewSort),
                    'ADD CREW - 02': sortEmployees(addCrew['ADD CREW - 02'] || [], addCrewSort),
                    'ADD CREW - 03': sortEmployees(addCrew['ADD CREW - 03'] || [], addCrewSort),
                };

                const pdfDocument = (
                    <DailyAttendancePDF
                        reportDate={reportDate}
                        microteams={sortedMicroteams}
                        addCrew={sortedAddCrew}
                        ph={ph}
                        hrName={hrName}
                        managerName={managerName}
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

                // After PDF export, refresh data to be ready for next date
                // Clear current data and fetch fresh data for the selected date
                setTimeout(() => {
                    if (reportDate) {
                        fetchMicroteamData();
                    }
                }, 500);
            } catch (error) {
                console.error('Error exporting PDF:', error);
                toast.error('Failed to export PDF');
            } finally {
                setExporting(false);
            }
        } else {
            // Handle Excel export later
            toast.info('Excel export coming soon');
        }
    };

    // Helper function to format time
    const formatTime = (timeStr: string | null): string => {
        if (!timeStr) return '';
        // If time is in HH:mm:ss format, extract HH:mm
        if (timeStr.includes(':')) {
            const parts = timeStr.split(':');
            return `${parts[0]}:${parts[1]}`;
        }
        return timeStr;
    };

    // Helper function to format employee name: "Lastname FirstInitial."
    // Example: "RJ Kyle G. Labrador" -> "Labrador R."
    const formatEmployeeName = (fullName: string): string => {
        if (!fullName || !fullName.trim()) return '';

        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length === 0) return '';

        // Last part is the last name
        const lastName = nameParts[nameParts.length - 1];

        // First part is the first name, get its first character
        const firstName = nameParts[0];
        const firstInitial = firstName.charAt(0).toUpperCase();

        return `${lastName} ${firstInitial}.`;
    };

    // Helper function to sort employees by name
    const sortEmployees = (employees: MicroteamEmployee[], sortOrder: 'none' | 'asc' | 'desc'): MicroteamEmployee[] => {
        if (sortOrder === 'none') return employees;

        const sorted = [...employees].sort((a, b) => {
            const nameA = (a.employee_name || '').toLowerCase();
            const nameB = (b.employee_name || '').toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

        return sortOrder === 'asc' ? sorted : sorted.reverse();
    };

    // Get sorted microteam employees
    const getSortedMicroteamEmployees = (microteamKey: keyof MicroteamData): MicroteamEmployee[] => {
        const employees = microteams[microteamKey] || [];
        return sortEmployees(employees, microteamSort);
    };

    // Get sorted Add Crew employees
    const getSortedAddCrewEmployees = (addCrewKey: keyof AddCrewData): MicroteamEmployee[] => {
        const employees = addCrew[addCrewKey] || [];
        return sortEmployees(employees, addCrewSort);
    };

    // Helper function to count all displayed employees (regardless of time_in/time_out status)
    const countAllEmployees = (employees: MicroteamEmployee[]): number => {
        return employees.filter((emp) => emp).length;
    };

    // Helper function to count present employees (those with both time_in and time_out)
    const countPresentEmployees = (employees: MicroteamEmployee[]): number => {
        return employees.filter((emp) => emp?.time_in && emp?.time_out).length;
    };

    // Calculate summary counts using useMemo for performance
    const summaryCounts = useMemo(() => {
        // Present Regular counts for each microteam - count ALL displayed employees
        const presentRegularM1 = countAllEmployees(microteams['MICROTEAM - 01'] || []);
        const presentRegularM2 = countAllEmployees(microteams['MICROTEAM - 02'] || []);
        const presentRegularM3 = countAllEmployees(microteams['MICROTEAM - 03'] || []);
        const presentRegularTotal = presentRegularM1 + presentRegularM2 + presentRegularM3;

        // Add Crew counts for each group - count ALL displayed employees
        const addCrewM1 = countAllEmployees(addCrew['ADD CREW - 01'] || []);
        const addCrewM2 = countAllEmployees(addCrew['ADD CREW - 02'] || []);
        const addCrewM3 = countAllEmployees(addCrew['ADD CREW - 03'] || []);
        const addCrewTotal = addCrewM1 + addCrewM2 + addCrewM3;

        // Total (Present Regular + Add Crew)
        const totalM1 = presentRegularM1 + addCrewM1;
        const totalM2 = presentRegularM2 + addCrewM2;
        const totalM3 = presentRegularM3 + addCrewM3;
        const totalOverall = presentRegularTotal + addCrewTotal;

        return {
            presentRegular: {
                m1: presentRegularM1,
                m2: presentRegularM2,
                m3: presentRegularM3,
                total: presentRegularTotal,
            },
            addCrew: {
                m1: addCrewM1,
                m2: addCrewM2,
                m3: addCrewM3,
                total: addCrewTotal,
            },
            total: {
                m1: totalM1,
                m2: totalM2,
                m3: totalM3,
                total: totalOverall,
            },
        };
    }, [microteams, addCrew]);

    // Helper function to get summary value for a specific row and column
    const getSummaryValue = (rowName: string, column: 'm1' | 'm2' | 'm3' | 'total'): string => {
        switch (rowName) {
            case 'PRESENT REGULAR':
                return summaryCounts.presentRegular[column].toString();
            case 'ADD CREW':
                return summaryCounts.addCrew[column].toString();
            case 'TOTAL':
                return summaryCounts.total[column].toString();
            default:
                return ''; // Other rows (AWP, AWOP/AWOL, etc.) remain empty for now
        }
    };

    return (
        <SidebarProvider>
            <Head title="Daily Attendance Report" />
            {/* <Toaster position="top-right" richColors /> */}
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader
                        breadcrumbs={[
                            { title: 'Report', href: '/report' },
                            { title: 'Daily Attendance', href: '/report/daily-attendance' },
                        ]}
                        title={''}
                    />
                    <Card className="border-main m-5 space-y-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center">
                                <ClipboardList className="text-cfarbempco-green mr-2 h-5 w-5" />
                                Daily Attendance Report (DTR)
                            </CardTitle>
                            <CardDescription>Generate and export the daily attendance record.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Date Selection */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Select Date:</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-[240px] justify-start text-left font-normal',
                                                    !reportDate && 'text-muted-foreground',
                                                )}
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {reportDate ? titleDate : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={reportDate}
                                                onSelect={setReportDate}
                                                disabled={isDateDisabled}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {reportDate && <div className="text-sm text-muted-foreground">{titleDay}</div>}
                            </div>

                            {/* Report body matching provided structure */}
                            <Card>
                                <CardContent className="p-4">
                                    <div ref={reportCardRef}>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex w-full flex-row items-center justify-between">
                                                <div className="flex flex-col items-start">
                                                    <div className="text-sm font-semibold">CFARBEMPCO</div>
                                                    <div className="mt-1 flex items-center">
                                                        <span className="mr-2 text-sm font-semibold">PH:</span>
                                                        <Input
                                                            ref={phInputRef}
                                                            type="text"
                                                            placeholder="PH"
                                                            className="w-20"
                                                            value={phValue}
                                                            onChange={(e) => setPhValue(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-1 justify-center">
                                                    <div className="text-center text-base font-bold">Daily Attendance Report (DTR)</div>
                                                </div>
                                                <div className="flex min-w-[110px] flex-col items-end">
                                                    <div className="text-sm">
                                                        <span className="font-bold">Date:</span> {titleDate}
                                                    </div>
                                                    <div className="mr-[55px] text-sm">
                                                        <span className="font-bold">Day:</span> {titleDay}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Microteam tables */}
                                        <div className="mt-4">
                                            {/* Sorting controls for Microteams */}
                                            <div className="mb-2 flex items-center gap-2">
                                                <span className="text-xs font-semibold">Sort Microteams:</span>
                                                <Select
                                                    value={microteamSort}
                                                    onValueChange={(value: 'none' | 'asc' | 'desc') => setMicroteamSort(value)}
                                                >
                                                    <SelectTrigger className="h-8 w-40 text-xs">
                                                        <SelectValue placeholder="Sort by..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">No Sort</SelectItem>
                                                        <SelectItem value="asc">A-Z (Ascending)</SelectItem>
                                                        <SelectItem value="desc">Z-A (Descending)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                {(['MICROTEAM - 01', 'MICROTEAM - 02', 'MICROTEAM - 03'] as const).map((title) => {
                                                    const sortedEmployees = getSortedMicroteamEmployees(title);
                                                    const maxRows = 25;
                                                    const rowsToShow = Math.max(maxRows, sortedEmployees.length);

                                                    return (
                                                        <div key={title} className="border">
                                                            <div className="border-b px-2 py-1 text-[10px] font-semibold">{title}</div>
                                                            <div className="overflow-hidden">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead className="w-10 text-[10px]">No</TableHead>
                                                                            <TableHead className="text-[10px]">Name</TableHead>
                                                                            <TableHead className="w-24 text-[10px]">Remarks</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {Array.from({ length: rowsToShow }).map((_, i) => {
                                                                            const employee = sortedEmployees[i];
                                                                            return (
                                                                                <TableRow key={i}>
                                                                                    <TableCell className="text-[10px]">
                                                                                        {String(i + 1).padStart(2, '0')}
                                                                                    </TableCell>
                                                                                    <TableCell className="text-[10px]">
                                                                                        {employee ? formatEmployeeName(employee.employee_name) : ''}
                                                                                    </TableCell>
                                                                                    <TableCell className="text-[10px]">
                                                                                        {employee?.time_in && employee?.time_out ? 'Present' : ''}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        })}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Add Crew tables */}
                                        <div className="mt-4">
                                            {/* Sorting controls for Add Crew */}
                                            <div className="mb-2 flex items-center gap-2">
                                                <span className="text-xs font-semibold">Sort Add Crew:</span>
                                                <Select value={addCrewSort} onValueChange={(value: 'none' | 'asc' | 'desc') => setAddCrewSort(value)}>
                                                    <SelectTrigger className="h-8 w-40 text-xs">
                                                        <SelectValue placeholder="Sort by..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">No Sort</SelectItem>
                                                        <SelectItem value="asc">A-Z (Ascending)</SelectItem>
                                                        <SelectItem value="desc">Z-A (Descending)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                {(['ADD CREW - 01', 'ADD CREW - 02', 'ADD CREW - 03'] as const).map((title) => {
                                                    const sortedEmployees = getSortedAddCrewEmployees(title);
                                                    const maxRows = 8;
                                                    const rowsToShow = Math.max(maxRows, sortedEmployees.length);

                                                    return (
                                                        <div key={title} className="border">
                                                            <div className="border-b px-2 py-1 text-[10px] font-semibold">{title}</div>
                                                            <div className="overflow-hidden">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead className="w-10 text-[10px]">No</TableHead>
                                                                            <TableHead className="text-[10px]">Name</TableHead>
                                                                            <TableHead className="w-24 text-[10px]">Remarks</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {Array.from({ length: rowsToShow }).map((_, i) => {
                                                                            const employee = sortedEmployees[i];
                                                                            return (
                                                                                <TableRow key={i}>
                                                                                    <TableCell className="text-[10px]">
                                                                                        {String(i + 1).padStart(2, '0')}
                                                                                    </TableCell>
                                                                                    <TableCell className="text-[10px]">
                                                                                        {employee ? formatEmployeeName(employee.employee_name) : ''}
                                                                                    </TableCell>
                                                                                    <TableCell className="text-[10px]">
                                                                                        {employee?.time_in && employee?.time_out ? 'Present' : ''}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        })}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Summary table */}
                                        <div className="mt-4 border">
                                            <div className="border-b px-2 py-1 text-[10px] font-semibold">Summary</div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="text-[10px]"></TableHead>
                                                        <TableHead className="w-16 text-center text-[10px]">M1</TableHead>
                                                        <TableHead className="w-16 text-center text-[10px]">M2</TableHead>
                                                        <TableHead className="w-16 text-center text-[10px]">M3</TableHead>
                                                        <TableHead className="w-20 text-center text-[10px]">TOTAL</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {[
                                                        'PRESENT REGULAR',
                                                        'ADD CREW',
                                                        'TOTAL',
                                                        'AWP',
                                                        'AWOP/AWOL',
                                                        'NL/SL/VL/EL',
                                                        'OUTSIDE/CW/SD/FR',
                                                        'OVERALL TOTAL',
                                                    ].map((row) => (
                                                        <TableRow key={row}>
                                                            <TableCell className="text-[10px]">{row}</TableCell>
                                                            <TableCell className="text-center text-[10px]">{getSummaryValue(row, 'm1')}</TableCell>
                                                            <TableCell className="text-center text-[10px]">{getSummaryValue(row, 'm2')}</TableCell>
                                                            <TableCell className="text-center text-[10px]">{getSummaryValue(row, 'm3')}</TableCell>
                                                            <TableCell className="text-center text-[10px]">{getSummaryValue(row, 'total')}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Signatories */}
                                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                                            <div className="text-center text-[10px]">
                                                <div className="mb-1">Prepared by:</div>
                                                <div className="">PHMC</div>
                                                <div className="mx-auto mb-1 h-px w-40 bg-black" />
                                            </div>
                                            <div className="text-center text-[10px]">
                                                <div className="mb-1">Noted by:</div>
                                                <div className="">{hrName}</div>
                                                <div className="mx-auto mb-1 h-px w-40 bg-black" />
                                            </div>
                                            <div className="text-center text-[10px]">
                                                <div className="mb-1">Approved by:</div>
                                                <div className="">{managerName}</div>
                                                <div className="mx-auto mb-1 h-px w-40 bg-black" />
                                            </div>
                                        </div>
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
                        <DialogTitle>Daily Attendance Report Preview</DialogTitle>
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
                                <DailyAttendancePDF
                                    reportDate={reportDate}
                                    microteams={{
                                        'MICROTEAM - 01': getSortedMicroteamEmployees('MICROTEAM - 01'),
                                        'MICROTEAM - 02': getSortedMicroteamEmployees('MICROTEAM - 02'),
                                        'MICROTEAM - 03': getSortedMicroteamEmployees('MICROTEAM - 03'),
                                    }}
                                    addCrew={{
                                        'ADD CREW - 01': getSortedAddCrewEmployees('ADD CREW - 01'),
                                        'ADD CREW - 02': getSortedAddCrewEmployees('ADD CREW - 02'),
                                        'ADD CREW - 03': getSortedAddCrewEmployees('ADD CREW - 03'),
                                    }}
                                    ph={phValue}
                                    hrName={hrName}
                                    managerName={managerName}
                                />
                            </PDFViewer>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
