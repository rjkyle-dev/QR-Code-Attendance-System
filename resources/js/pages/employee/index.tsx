import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import type { Employee } from '@/hooks/employees';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import AddEmployeeModal from './components/addemployeemodal';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import EditEmployeeModal from './components/editemployeemodal';
import { SectionCards } from './components/section-cards';
// import { Employees } from './components/columns';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { ContentLoading } from '@/components/ui/loading';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { usePermission } from '@/hooks/user-permission';
import axios from 'axios';
import { useEffect as useLayoutEffect } from 'react';
import RegisterFingerprintModal from './components/registerfingerprintmodal';
import ViewEmployeeDetails from './components/viewemployeedetails';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employee Management',
        href: '/employee',
    },
];

interface Props {
    employee: Employee[];
    totalDepartment: number;
    totalEmployee: number;
    workStatusCounts?: {
        Regular: number;
        'Add Crew': number;
        Probationary: number;
        // Sessional: number;
    };
    departments?: string[];
    positions?: string[];
    user_permissions?: {
        is_super_admin: boolean;
        is_supervisor: boolean;
        supervised_departments: string[];
    };
}

// Move SidebarHoverLogic outside the main component
function SidebarHoverLogic({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const { handleMouseEnter, handleMouseLeave } = useSidebarHover();

    return (
        <>
            {/* Show hover zone only when sidebar is collapsed to icons */}
            <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            {/* AppSidebar will handle its own hover behavior */}
            <AppSidebar />
            {children}
        </>
    );
}

export default function Employee({
    employee,
    totalEmployee,
    totalDepartment,
    workStatusCounts,
    departments = [],
    positions = [],
    user_permissions,
}: Props) {
    const { can } = usePermission();
    const [data, setData] = useState<Employee[]>(employee);
    const [editModelOpen, setEditModalOpen] = useState(false);
    const [isModelOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [registerFingerprintEmployee, setRegisterFingerprintEmployee] = useState<Employee | null>(null);
    const [isRegisterFingerprintOpen, setIsRegisterFingerprintOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setData(employee);
            setLoading(false);
        }, 500);
    }, [employee]);

    // Expose handler for table button
    useLayoutEffect(() => {
        (window as any).onRegisterFingerprint = (employee: Employee) => {
            setRegisterFingerprintEmployee(employee);
            setIsRegisterFingerprintOpen(true);
            toast.info(`Register fingerprint for ${employee.employee_name}`);
        };
        return () => {
            (window as any).onRegisterFingerprint = undefined;
        };
    }, []);

    const handleRegisterFingerprint = (employee: Employee) => {
        setRegisterFingerprintEmployee(employee);
        setIsRegisterFingerprintOpen(true);
        toast.info(`Register fingerprint for ${employee.employee_name}`);
    };

    const handleUpdate = (updatedEmployee: Employee) => {
        setData((prevData) => prevData.map((employee) => (employee.employeeid === updatedEmployee.employeeid ? updatedEmployee : employee)));
    };

    const handleEdit = (employee: Employee) => {
        // Logic for editing the employee (open the edit modal, prefill the data, etc.)
        console.log('Editing employee', employee);
        // You can set the state to open an edit modal, like:
        setSelectedEmployee(employee);
        setEditModalOpen(true); // Assuming you have a state for edit modal visibility
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        // Logic for deleting the employee (e.g., API call)
        router.delete(`/employee/${id}`, {
            onSuccess: () => {
                toast.success('Employee Deleted!', {
                    duration: 1500,
                });
                // Close the modal after successful deletion
                onSuccess(); // This will trigger the onClose callback to close the modal
            },
            onError: () => {
                toast.error('Failed to delete employee!', {
                    duration: 1500,
                });
            },
            preserveScroll: true,
        });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await axios.get<Employee[]>('/api/employee/all');
            setData(res.data);
            toast.success('Employee list refreshed!');
        } catch (err) {
            toast.error('Failed to refresh employee list!');
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <SidebarProvider>
            <Head title="Employees" />
            {/* <Toaster position="top-center" richColors /> */}
            {/* Sidebar hover logic */}
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    {loading ? (
                        <ContentLoading />
                    ) : (
                        <>
                            <Main fixed className="overflow-hidden">
                                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                                    <div>
                                        <div className="ms-2 flex items-center">
                                            <Users className="size-11" />
                                            <div className="ms-2">
                                                <h2 className="flex text-2xl font-bold tracking-tight">Employee</h2>
                                                <p className="text-muted-foreground">Manage your organization's workforce</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <TasksPrimaryButtons /> */}
                                </div>
                                <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                                    <TabsContent value="overview" className="space-y-4">
                                        <div className="flex flex-1 flex-col">
                                            <div className="relative flex flex-1 flex-col">
                                                <div className="@container/main flex flex-1 flex-col gap-2 overflow-hidden">
                                                    <div className="flex flex-col overflow-hidden">
                                                        <SectionCards
                                                            totalEmployee={totalEmployee}
                                                            employee={data}
                                                            totalDepartment={totalDepartment}
                                                            workStatusCounts={workStatusCounts}
                                                            isSupervisor={user_permissions?.is_supervisor || false}
                                                            roleContent={{
                                                                employeeLabel: user_permissions?.is_supervisor ? 'Your Employees' : 'Total Employee',
                                                                departmentLabel: user_permissions?.is_supervisor ? 'Your Departments' : 'Department',
                                                                activeLabel: user_permissions?.is_supervisor ? 'Active Team' : 'Active Accounts',
                                                                growthLabel: user_permissions?.is_supervisor ? 'Your Growth' : 'Growth Rate',
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
                                    <Card className="border-main dark:bg-backgrounds overflow-hidden bg-background drop-shadow-lg">
                                        <CardHeader>
                                            <CardTitle>Employee List</CardTitle>
                                            <CardDescription>List of employee</CardDescription>
                                        </CardHeader>
                                        <CardContent className="overflow-x-auto">
                                            {/* Replace with your data */}
                                            <DataTable
                                                columns={columns(
                                                    can,
                                                    setIsViewOpen,
                                                    (emp) => setViewEmployee(emp),
                                                    setIsModalOpen,
                                                    setEditModalOpen,
                                                    (emp) => setSelectedEmployee(emp),
                                                    (emp) => handleEdit(emp),
                                                    handleDelete,
                                                )}
                                                // data={employee}
                                                data={data}
                                                onRefresh={handleRefresh}
                                                refreshing={refreshing}
                                            />
                                            <EditEmployeeModal
                                                isOpen={editModelOpen}
                                                onClose={() => setEditModalOpen(false)}
                                                employee={selectedEmployee}
                                                onUpdate={handleUpdate}
                                            />
                                            <ViewEmployeeDetails
                                                isOpen={isViewOpen}
                                                onClose={() => setIsViewOpen(false)}
                                                employee={viewEmployee}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onRegisterFingerprint={handleRegisterFingerprint}
                                            />
                                            <AddEmployeeModal isOpen={isModelOpen} onClose={() => setIsModalOpen(false)} />
                                            <RegisterFingerprintModal
                                                isOpen={isRegisterFingerprintOpen}
                                                onClose={() => setIsRegisterFingerprintOpen(false)}
                                                employee={registerFingerprintEmployee}
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
