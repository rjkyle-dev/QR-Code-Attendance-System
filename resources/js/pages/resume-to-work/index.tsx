import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, FileText, Filter, Mail, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import EditResumeModal from './components/edit-resume-modal';
import PDFViewerModal from './components/pdf-viewer-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Resume to Work',
        href: '/resume-to-work',
    },
];

interface ApprovedLeave {
    id: string;
    employee_name: string | null;
    employee_id: string | null;
    employee_id_db: string;
    department: string | null;
    position: string | null;
    leave_type: string;
    leave_start_date: string;
    leave_end_date: string;
    leave_days: number;
    leave_reason: string;
    status: string;
    picture: string | null;
    supervisor_status: string;
    hr_status: string;
    supervisor_approved_at: string | null;
    hr_approved_at: string | null;
    hr_return_date: string | null;
    hr_return_date_formatted: string | null;
    hr_officer_name: string | null;
    supervisor_name: string | null;
}

interface ApprovedAbsence {
    id: string;
    employee_name: string;
    employee_id: string;
    employee_id_db: string;
    department: string;
    position: string;
    absence_type: string;
    from_date: string;
    to_date: string;
    days: number;
    reason: string;
    status: string;
    picture: string | null;
    supervisor_status: string;
    hr_status: string;
    supervisor_approved_at: string | null;
    hr_approved_at: string | null;
    hr_return_date: string | null;
    hr_return_date_formatted: string | null;
    hr_officer_name: string | null;
    supervisor_name: string | null;
}

interface Employee {
    id: string;
    employee_name: string;
    employeeid: string;
    department: string;
    position: string;
}

interface Props {
    approvedLeaves: ApprovedLeave[];
    approvedAbsences: ApprovedAbsence[];
    employees: Employee[];
    userRole?: {
        is_supervisor: boolean;
        is_super_admin: boolean;
        supervised_departments: string[];
    };
}

type CombinedItem = (ApprovedLeave & { type: 'leave' }) | (ApprovedAbsence & { type: 'absence' });

export default function Index({ approvedLeaves = [], approvedAbsences = [], employees = [] }: Props) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CombinedItem | null>(null);
    const [showPDF, setShowPDF] = useState(false);
    const [pdfData, setPdfData] = useState<any>(null);
    const [sendingEmail, setSendingEmail] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterDepartment, setFilterDepartment] = useState<string>('all');

    // Combine leaves and absences into a single array
    const allItems: CombinedItem[] = [
        ...approvedLeaves.map((leave) => ({ ...leave, type: 'leave' as const })),
        ...approvedAbsences.map((absence) => ({ ...absence, type: 'absence' as const })),
    ];

    // Get unique departments from all items
    const availableDepartments = useMemo(() => {
        const departments = new Set<string>();
        allItems.forEach((item) => {
            if (item.department) {
                departments.add(item.department);
            }
        });
        return Array.from(departments).sort();
    }, [allItems]);

    // Apply filters
    const filteredItems = useMemo(() => {
        let filtered = allItems;

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter((item) => item.type === filterType);
        }

        // Filter by department
        if (filterDepartment !== 'all') {
            filtered = filtered.filter((item) => item.department === filterDepartment);
        }

        return filtered;
    }, [allItems, filterType, filterDepartment]);

    // Limit to 8 items for display
    const combinedItems = filteredItems.slice(0, 8);

    // Check if any filters are active
    const hasActiveFilters = filterType !== 'all' || filterDepartment !== 'all';

    const clearFilters = () => {
        setFilterType('all');
        setFilterDepartment('all');
    };

    const handleEdit = (item: CombinedItem) => {
        // Set the selected item and open the edit modal
        // This will allow creating/editing a resume-to-work request from the approved leave/absence
        setSelectedItem(item);
        setIsEditOpen(true);
    };

    const handleSend = (item: CombinedItem) => {
        // Create a resume-to-work request first, then send email
        // For now, we'll create a temporary request ID based on the leave/absence
        const requestId = item.type === 'leave' ? `leave_${item.id}` : `absence_${item.id}`;
        setSendingEmail(requestId);

        // Note: This assumes a resume-to-work request exists or will be created
        // You may need to adjust this based on your actual implementation
        router.post(
            route('resume-to-work.send-email', requestId),
            {},
            {
                onSuccess: () => {
                    toast.success('Email sent successfully!');
                    setSendingEmail(null);
                },
                onError: (errors: any) => {
                    const errorMessage = errors?.message || Object.values(errors).flat().join(', ') || 'Failed to send email. Please try again.';
                    toast.error(errorMessage);
                    setSendingEmail(null);
                },
                preserveScroll: true,
            },
        );
    };

    const handlePDF = (item: CombinedItem) => {
        // Use HR updated return date if available, otherwise use original return date
        const returnDate = item.hr_return_date || (item.type === 'leave' ? item.leave_end_date : item.to_date);

        // Create resume-to-work request data for PDF
        const pdfRequest = {
            id: item.type === 'leave' ? `LEAVE-${item.id}` : `ABS-${item.id}`,
            employee_name: item.employee_name || 'N/A',
            employee_id: item.employee_id || 'N/A',
            employee_id_number: item.employee_id || 'N/A',
            department: item.department || 'N/A',
            position: item.position || 'N/A',
            return_date: returnDate,
            previous_absence_reference: item.type === 'leave' ? `Leave Request #${item.id}` : `Absence #${item.id}`,
            comments: item.type === 'leave' ? item.leave_reason : item.reason,
            status: 'processed' as const,
            processed_by: 'HR',
            processed_at: item.type === 'leave' ? item.hr_approved_at : item.hr_approved_at,
            supervisor_notified: true,
            supervisor_notified_at: item.type === 'leave' ? item.supervisor_approved_at : item.supervisor_approved_at,
            created_at: item.type === 'leave' ? item.leave_start_date : item.from_date,
            hr_officer_name: item.hr_officer_name || null,
            supervisor_name: item.supervisor_name || null,
        };

        setPdfData(pdfRequest);
        setShowPDF(true);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <SidebarProvider>
            <Head title="Resume to Work" />
            <Toaster position="top-center" richColors />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div className="flex items-center gap-4">
                                <div className="ms-2 flex items-center">
                                    <Users className="size-11" />
                                    <div className="ms-2">
                                        <h2 className="flex text-2xl font-bold tracking-tight">Resume to Work</h2>
                                        <p className="text-muted-foreground">View approved leaves and absences for resume to work requests</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Section */}
                        <div className="m-3 mb-4 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Filters:</span>
                            </div>

                            {/* Type Filter */}
                            <div className="w-full sm:w-48">
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="leave">Leave Requests</SelectItem>
                                        <SelectItem value="absence">Absence Requests</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Department Filter */}
                            {availableDepartments.length > 0 && (
                                <div className="w-full sm:w-48">
                                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Departments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            {availableDepartments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Clear Filters Button */}
                            {hasActiveFilters && (
                                <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-2">
                                    <X className="h-4 w-4" />
                                    Clear Filters
                                </Button>
                            )}

                            {/* Results Count */}
                            <div className="ml-auto text-sm text-muted-foreground">
                                Showing {combinedItems.length} of {filteredItems.length} approved record(s)
                            </div>
                        </div>

                        {/* Bento Grid Container - 4 columns, scrollable, max 8 cards (2 rows) */}
                        <div className="m-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 175px)' }}>
                            {combinedItems.length === 0 ? (
                                <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="text-lg font-semibold">No Approved Records</p>
                                        <p className="text-sm text-muted-foreground">There are no approved leaves or absences to display.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {combinedItems.map((item) => (
                                        <Card
                                            key={`${item.type}-${item.id}`}
                                            className="border-emerald-200 bg-emerald-50/50 dark:bg-backgrounds transition-all duration-300 hover:scale-3d hover:shadow-lg"
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="line-clamp-1 text-base font-semibold">
                                                            {item.employee_name || 'Unknown Employee'}
                                                        </CardTitle>
                                                        <CardDescription className="mt-1 text-xs">
                                                            {item.type === 'leave' ? 'Leave Request' : 'Absence Request'}
                                                        </CardDescription>
                                                    </div>
                                                    {item.picture && (
                                                        <img
                                                            src={item.picture}
                                                            alt={item.employee_name || 'Employee'}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-2 pb-3">
                                                <div className="space-y-1.5 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Type:</span>
                                                        <span className="font-medium">
                                                            {item.type === 'leave' ? item.leave_type : item.absence_type}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Period:</span>
                                                        <span className="text-right font-medium">
                                                            {item.type === 'leave'
                                                                ? `${formatDate(item.leave_start_date)} - ${formatDate(item.leave_end_date)}`
                                                                : `${formatDate(item.from_date)} - ${formatDate(item.to_date)}`}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Days:</span>
                                                        <span className="font-medium">
                                                            {item.type === 'leave' ? item.leave_days : item.days} day(s)
                                                        </span>
                                                    </div>
                                                    {/* HR Modified Return Date */}
                                                    {item.hr_return_date && (
                                                        <div className="flex items-center justify-between rounded-md bg-blue-50 px-2 py-1.5 dark:bg-blue-950/30">
                                                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                                                HR Return Date:
                                                            </span>
                                                            <span className="text-right text-xs font-semibold text-blue-900 dark:text-blue-200">
                                                                {item.hr_return_date_formatted || formatDate(item.hr_return_date)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Department:</span>
                                                        <span className="text-right font-medium">{item.department || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Position:</span>
                                                        <span className="text-right font-medium">{item.position || 'N/A'}</span>
                                                    </div>
                                                    {item.type === 'leave' && item.leave_reason && (
                                                        <div className="border-t pt-1">
                                                            <span className="text-xs text-muted-foreground">Reason:</span>
                                                            <p className="mt-1 line-clamp-2 text-xs">{item.leave_reason}</p>
                                                        </div>
                                                    )}
                                                    {item.type === 'absence' && item.reason && (
                                                        <div className="border-t pt-1">
                                                            <span className="text-xs text-muted-foreground">Reason:</span>
                                                            <p className="mt-1 line-clamp-2 text-xs">{item.reason}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex gap-2 border-t pt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleEdit(item)}
                                                    disabled={sendingEmail === `${item.type}_${item.id}`}
                                                >
                                                    <Edit className="mr-1 h-3 w-3" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleSend(item)}
                                                    disabled={sendingEmail === `${item.type}_${item.id}` || sendingEmail !== null}
                                                >
                                                    <Mail className="mr-1 h-3 w-3" />
                                                    {sendingEmail === `${item.type}_${item.id}` ? 'Sending...' : 'Send'}
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePDF(item)}>
                                                    <FileText className="mr-1 h-3 w-3" />
                                                    PDF
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                            {/* <Button variant="outline" onClick={() => router.visit('/resume-to-work')} className="mt-5 flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button> */}
                        </div>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>

            {/* Edit Modal */}
            <EditResumeModal
                isOpen={isEditOpen}
                onClose={() => {
                    setIsEditOpen(false);
                    setSelectedItem(null);
                }}
                employees={employees}
                request={
                    selectedItem
                        ? {
                              id: selectedItem.id,
                              employee_name: selectedItem.employee_name || '',
                              employee_id: selectedItem.type === 'leave' ? selectedItem.employee_id_db : selectedItem.employee_id_db,
                              department: selectedItem.department || '',
                              position: selectedItem.position || '',
                              return_date: selectedItem.type === 'leave' ? selectedItem.leave_end_date : selectedItem.to_date,
                              previous_absence_reference: selectedItem.type === 'leave' ? `Leave #${selectedItem.id}` : `Absence #${selectedItem.id}`,
                              comments: selectedItem.type === 'leave' ? selectedItem.leave_reason : selectedItem.reason,
                              status: 'pending',
                          }
                        : null
                }
            />

            {/* PDF Viewer Modal */}
            <PDFViewerModal isOpen={showPDF} onClose={() => setShowPDF(false)} pdfData={pdfData} />
        </SidebarProvider>
    );
}

function SidebarHoverLogic({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const { handleMouseEnter } = useSidebarHover();
    return (
        <>
            <AppSidebar />
            {children}
        </>
    );
}
