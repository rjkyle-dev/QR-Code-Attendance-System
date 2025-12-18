import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentLoading } from '@/components/ui/loading';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { columns, type Absence } from './components/columns';
import { DataTable } from './components/data-table';
import { SectionCards } from './components/section-cards';
import ViewAbsenceModal from './components/view-absence-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Absence Management',
        href: '/absence',
    },
];

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    department: string;
    position: string;
    remaining_credits?: number;
    used_credits?: number;
    total_credits?: number;
}

interface Props {
    absences: Absence[];
    employees: Employee[];
    monthlyAbsenceStats?: Array<{
        month: string;
        year: number;
        absences: number;
        percentage: number;
        date: string;
    }>;
    user_permissions?: {
        is_super_admin: boolean;
        is_supervisor: boolean;
        supervised_departments: string[];
    };
}

export default function Index({ absences = [], employees = [], monthlyAbsenceStats = [], user_permissions }: Props) {
    // State for view modal
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewAbsence, setViewAbsence] = useState<Absence | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Absence[]>(absences);

    useEffect(() => {
        setTimeout(() => {
            setData(absences);
            setLoading(false);
        }, 500);
    }, [absences]);

    // Real-time updates via Echo
    useEffect(() => {
        const echo: any = (window as any).Echo;
        if (!echo) {
            console.warn('Echo not available for real-time updates');
            return;
        }

        console.log('Setting up real-time listeners for absence index');

        // Listen on notifications channel for general absence requests
        const notificationsChannel = echo.channel('notifications');
        notificationsChannel
            .listen('.AbsenceRequested', (e: any) => {
                console.log('Received AbsenceRequested event on index page:', e);
                if (e && e.absence) {
                    const newAbsence: Absence = {
                        id: String(e.absence.id),
                        full_name: e.absence.full_name || e.absence.employee_name || 'Employee',
                        employee_id_number: e.absence.employee_id_number || '',
                        department: e.absence.department || '',
                        position: e.absence.position || '',
                        absence_type: e.absence.absence_type,
                        from_date: e.absence.from_date,
                        to_date: e.absence.to_date,
                        submitted_at: e.absence.submitted_at || new Date().toISOString(),
                        approved_at: e.absence.approved_at || null,
                        days: e.absence.days || 1,
                        reason: e.absence.reason || '',
                        is_partial_day: !!e.absence.is_partial_day,
                        status: e.absence.status || 'pending',
                        picture: e.absence.picture || '',
                        employee_name: e.absence.employee_name || '',
                        remaining_credits: e.absence.remaining_credits || 0,
                        used_credits: e.absence.used_credits || 0,
                        total_credits: e.absence.total_credits || 0,
                    };

                    // Check if this absence already exists to avoid duplicates
                    setData((prev) => {
                        const exists = prev.some((r) => r.id === newAbsence.id);
                        if (exists) {
                            console.log('Absence already exists, not adding duplicate');
                            return prev;
                        }
                        console.log('Adding new absence request to index list');
                        return [newAbsence, ...prev];
                    });
                }
            })
            .listen('.RequestStatusUpdated', (e: any) => {
                console.log('Received RequestStatusUpdated event on index page:', e);
                if (String(e.type || '') !== 'absence_status') return;
                setData((prev) => prev.map((r) => (String(r.id) === String(e.request_id) ? { ...r, status: e.status } : r)));
            });

        return () => {
            console.log('Cleaning up Echo listeners on index page');
            notificationsChannel.stopListening('.AbsenceRequested');
            notificationsChannel.stopListening('.RequestStatusUpdated');
        };
    }, []);

    const handleEdit = (absence: Absence) => {
        setSelectedAbsence(absence);
        setIsEditOpen(true);
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        // Logic for deleting the employee (e.g., API call)
        router.delete(`/absence/${id}`, {
            onSuccess: () => {
                toast.success('Absence Deleted!', {
                    duration: 1500,
                });
                // Close the modal after successful deletion
                onSuccess(); // This will trigger the onClose callback to close the modal
            },
            onError: () => {
                toast.error('Failed to delete absence!', {
                    duration: 1500,
                });
            },
            preserveScroll: true,
        });
    };

    return (
        <SidebarProvider>
            <Head title="Absence" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    {loading ? (
                        <ContentLoading />
                    ) : (
                        <>
                            <Main fixed>
                                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                                    <div>
                                        <div className="ms-2 flex items-center">
                                            <Users className="size-11" />
                                            <div className="ms-2">
                                                <h2 className="flex text-2xl font-bold tracking-tight">Absence</h2>
                                                <p className="text-muted-foreground">Manage your organization's absence requests</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                                    <TabsContent value="overview" className="space-y-4">
                                        <div className="flex flex-1 flex-col">
                                            <div className="relative flex flex-1 flex-col">
                                                <div className="@container/main flex flex-1 flex-col gap-2">
                                                    <div className="flex flex-col">
                                                        <SectionCards
                                                            isSupervisor={user_permissions?.is_supervisor || false}
                                                            totalEmployee={data.length}
                                                            totalDepartment={data.filter((a) => a.status === 'approved').length}
                                                            activeAccounts={data.filter((a) => a.status === 'pending').length}
                                                            growthRate={Math.round(
                                                                (data.filter((a) => a.status === 'rejected').length / (data.length || 1)) * 100,
                                                            )}
                                                            roleContent={{
                                                                employeeLabel: user_permissions?.is_supervisor ? 'Your Absences' : 'Total Absences',
                                                                departmentLabel: user_permissions?.is_supervisor ? 'Your Approved' : 'Approved',
                                                                activeLabel: user_permissions?.is_supervisor ? 'Your Pending' : 'Pending',
                                                                growthLabel: user_permissions?.is_supervisor ? 'Your Rejected Rate' : 'Rejected Rate',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <Separator className="shadow-sm" />
                                </Tabs>

                                <div className="m-3 no-scrollbar">
                                    <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-semibold">Absence List</CardTitle>
                                            <CardDescription>List of employee absences</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <DataTable
                                                columns={columns(
                                                    setIsViewOpen,
                                                    setViewAbsence,
                                                    setIsAddOpen,
                                                    setIsEditOpen,
                                                    setSelectedAbsence,
                                                    handleEdit,
                                                    handleDelete,
                                                )}
                                                data={data}
                                                employees={employees}
                                            />
                                            <ViewAbsenceModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} absence={viewAbsence} />
                                        </CardContent>
                                    </Card>
                                </div>
                            </Main>
                        </>
                    )}
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}

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
