import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentLoading } from '@/components/ui/loading';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Employees } from '@/hooks/employees';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import axios from 'axios';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { SectionCards } from './components/section-cards';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluation Management',
        href: '/evaluation',
    },
];

interface Props {
    employees: any[];
    evaluations: Evaluation[];
    employees_all: Employees[];
    user_permissions: {
        can_evaluate: boolean;
        is_super_admin: boolean;
        is_supervisor: boolean;
        evaluable_departments: string[];
    };
}

export default function Index({ evaluations, employees, employees_all, user_permissions }: Props) {
    const [data, setData] = useState<Evaluation[]>(evaluations);
    const [editModelOpen, setEditModalOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewEvaluation, setViewEvaluation] = useState<Evaluation | null>(null);
    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Debug logging
    console.log('Evaluation Index Props:', {
        evaluationsCount: evaluations?.length,
        employeesCount: employees?.length,
        employees_allCount: employees_all?.length,
        user_permissions,
        sampleEmployees: employees_all?.slice(0, 3),
        isSupervisor: user_permissions?.is_supervisor,
        evaluableDepartments: user_permissions?.evaluable_departments,
    });

    useEffect(() => {
        setTimeout(() => {
            setData(evaluations);
            setLoading(false);
        }, 500);
    }, [evaluations]);

    const handleUpdate = (updatedEvaluation: Evaluation) => {
        setData((prevData) => prevData.map((evaluation) => (evaluation.id === updatedEvaluation.id ? updatedEvaluation : evaluation)));
    };

    const handleEdit = (evaluation: Evaluation) => {
        setSelectedEvaluation(evaluation);
        setEditModalOpen(true);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await axios.get<Evaluation[]>('/api/evaluation/all', {
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                withCredentials: true,
            });
            setData(res.data);
            toast.success('Employee list refreshed!');
        } catch (err) {
            console.error('Refresh error:', err);
            toast.error('Failed to refresh employee list!');
        } finally {
            setRefreshing(false);
        }
    };

    const handleDelete = (id: number, onSuccess: () => void) => {
        router.delete(`/evaluation/${id}`, {
            onSuccess: () => {
                toast.success('Evaluation Deleted!', {
                    duration: 1500,
                });
                onSuccess();
            },
            onError: () => {
                toast.error('Failed to delete evaluation!', {
                    duration: 1500,
                });
            },
            preserveScroll: true,
        });
    };

    // Ensure all employees are mapped to Evaluation type structure
    const allEmployeesAsEvaluations: Evaluation[] = employees_all.map((emp) => ({
        id: Number(emp.id),
        employee_id: Number(emp.employee_id),
        ratings: emp.ratings || null,
        rating_date: emp.rating_date || null,
        work_quality: emp.work_quality || null,
        safety_compliance: emp.safety_compliance || null,
        punctuality: emp.punctuality || null,
        teamwork: emp.teamwork || null,
        organization: emp.organization || null,
        equipment_handling: emp.equipment_handling || null,
        comment: emp.comment || null,
        period: emp.period || null,
        year: emp.year || new Date().getFullYear(),
        employee_name: emp.employee_name,
        picture: emp.picture,
        department: emp.department,
        position: emp.position,
        employeeid: emp.employeeid,
        evaluation_frequency: emp.evaluation_frequency || 'annual', // Add the missing field
    }));

    // Debug logging for mapped data
    console.log('Mapped Employees Data:', {
        totalCount: allEmployeesAsEvaluations.length,
        departments: [...new Set(allEmployeesAsEvaluations.map((emp) => emp.department))],
        sampleEmployees: allEmployeesAsEvaluations.slice(0, 3),
    });

    return (
        <SidebarProvider>
            <Head title="Evaluation" />

            {/* Sidebar hover logic */}
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
                                                <h2 className="flex text-2xl font-bold tracking-tight">Evaluation</h2>
                                                <p className="text-muted-foreground">Manage your organization's workforce</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Debug information for supervisors */}
                                {/* {user_permissions?.is_supervisor && (
                                    <div className="mb-4 rounded bg-blue-50 p-4 text-sm">
                                        <div className="font-medium text-blue-800">Supervisor Debug Info:</div>
                                        <div className="text-blue-700">
                                            <div>• Total Employees: {employees_all?.length || 0}</div>
                                            <div>• Supervised Departments: {user_permissions.evaluable_departments?.join(', ') || 'None'}</div>
                                            <div>• Department Count: {user_permissions.evaluable_departments?.length || 0}</div>
                                            <div>
                                                • Sample Employees:{' '}
                                                {employees_all
                                                    ?.slice(0, 3)
                                                    .map((emp) => emp.employee_name)
                                                    .join(', ') || 'None'}
                                            </div>
                                        </div>
                                    </div>
                                )} */}
                                {/* <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                                    <TabsContent value="overview" className="space-y-4">
                                        <div className="flex flex-1 flex-col">
                                            <div className="relative flex flex-1 flex-col">
                                                <div className="@container/main flex flex-1 flex-col gap-2">
                                                    <div className="flex flex-col">
                                                        <SectionCards
                                                            isSupervisor={user_permissions?.is_supervisor || false}
                                                            totalEmployee={employees_all?.length || 0}
                                                            totalDepartment={
                                                                user_permissions?.is_supervisor
                                                                    ? user_permissions.evaluable_departments?.length || 0
                                                                    : 7
                                                            }
                                                            activeAccounts={employees_all?.length || 0}
                                                            pendingCount={evaluations?.length || 0}
                                                            roleContent={{
                                                                employeeLabel: user_permissions?.is_supervisor ? 'Your Employees' : 'Total Employee',
                                                                departmentLabel: user_permissions?.is_supervisor ? 'Your Departments' : 'Department',
                                                                activeLabel: user_permissions?.is_supervisor ? 'Active Team' : 'Active Accounts',
                                                                pendingLabel: user_permissions?.is_supervisor ? 'Pending Reviews' : 'Pendings',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <Separator className="shadow-sm" />
                                </Tabs> */}
                                <div className="m-3 no-scrollbar">
                                    <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                        <CardHeader>
                                            <CardTitle>Evaluation List</CardTitle>
                                            <CardDescription>List of Evaluation</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <DataTable
                                                columns={columns}
                                                data={allEmployeesAsEvaluations}
                                                employees={employees}
                                                employees_all={employees_all}
                                                onRefresh={handleRefresh}
                                                refreshing={refreshing}
                                                user_permissions={user_permissions}
                                            />
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
