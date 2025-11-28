import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import EditEmployeeModal from './components/editemployeemodal';
// import { QuickActions } from './components/QuickActions';
import { SectionCards } from './components/section-cards';
import { Attendance } from './types/attendance';
// import { Attendance } from './components/columns';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { ContentLoading } from '@/components/ui/loading';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import axios from 'axios';
import ViewEmployeeDetails from './components/viewemployeedetails';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attendance Management',
        href: '/attendance',
    },
];

interface Props {
    attendanceData: Attendance[];
    sessions: any[];
    totalEmployee: number;
    prevTotalEmployee: number;
    totalDepartment: number;
    prevTotalDepartment: number;
    user_permissions?: {
        is_super_admin: boolean;
        is_supervisor: boolean;
        supervised_departments: string[];
    };
}

export default function Index({
    attendanceData,
    sessions = [],
    totalEmployee = 0,
    prevTotalEmployee = 0,
    totalDepartment = 0,
    prevTotalDepartment = 0,
    user_permissions,
}: Props) {
    const [data, setData] = useState<Attendance[]>(attendanceData);
    const [editModelOpen, setEditModalOpen] = useState(false);
    const [isModelOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Attendance | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewEmployee, setViewEmployee] = useState<Attendance | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setData(attendanceData);
        setLoading(false);
    }, [attendanceData]);

    const handleUpdate = (updatedEmployee: Attendance) => {
        setData((prevData) => prevData.map((attendanceData) => (attendanceData.id === updatedEmployee.id ? updatedEmployee : attendanceData)));
    };

    const handleEdit = (attendanceData: Attendance) => {
        // Logic for editing the attendanceData (open the edit modal, prefill the data, etc.)
        console.log('Editing attendanceData', attendanceData);
        // You can set the state to open an edit modal, like:
        setSelectedEmployee(attendanceData);
        setEditModalOpen(true); // Assuming you have a state for edit modal visibility
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        // Delete attendance via correct endpoint
        router.delete(`/attendance/${id}`, {
            onSuccess: () => {
                toast.success('Employee Deleted!', {
                    duration: 1500,
                });
                // Close the modal after successful deletion
                onSuccess(); // This will trigger the onClose callback to close the modal
            },
            onError: () => {
                toast.error('Failed to delete attendanceData!', {
                    duration: 1500,
                });
            },
            preserveScroll: true,
        }); 
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await axios.get('/api/attendance/all');
            setData(res.data);
            toast.success('Attendance list refreshed!');
        } catch (err) {
            toast.error('Failed to refresh attendance list!');
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <SidebarProvider>
            <Head title="Attendance" />
            {/* <Toaster position="top-right" richColors /> */}
            {/* Sidebar hover logic */}
            <SidebarHoverLogic>
                <SidebarInset>
                    {/* <HeaderShrink/> */}
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
                                                <h2 className="flex text-2xl font-bold tracking-tight">Attendance</h2>
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
                                                <div className="@container/main flex flex-1 flex-col gap-2">
                                                    <div className="flex flex-col">
                                                        <SectionCards
                                                            attendanceData={data}
                                                            totalEmployee={totalEmployee}
                                                            prevTotalEmployee={prevTotalEmployee}
                                                            totalDepartment={totalDepartment}
                                                            prevTotalDepartment={prevTotalDepartment}
                                                            isSupervisor={user_permissions?.is_supervisor || false}
                                                            roleContent={{
                                                                attendanceLabel: user_permissions?.is_supervisor
                                                                    ? 'Your Attendance'
                                                                    : 'Total Attendance',
                                                                presentLabel: user_permissions?.is_supervisor ? 'Your Present' : 'Present',
                                                                lateLabel: user_permissions?.is_supervisor ? 'Your Late' : 'Late Arrivals',
                                                                leaveLabel: user_permissions?.is_supervisor ? 'Your Leave' : 'On Leave',
                                                            }}
                                                        />
                                                        {/* <SectionCards totalRevenue={totalRevenue} payments={[]} totalEmployee={totalEmployee} /> */}
                                                    </div>
                                                    {/* Quick Actions Component */}
                                                    {/* <div className="mt-4">
                                                        <QuickActions
                                                            totalToday={
                                                                data.filter((att) => {
                                                                    const today = new Date().toISOString().split('T')[0];
                                                                    const attDate = att.attendanceDate?.split('T')[0];
                                                                    return attDate === today;
                                                                }).length
                                                            }
                                                            onRefresh={handleRefresh}
                                                            refreshing={refreshing}
                                                        />
                                                    </div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <Separator className="shadow-sm" />
                                </Tabs>
                                <div className="m-3 no-scrollbar">
                                    <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                        <CardHeader>
                                            <CardTitle>Attendance List</CardTitle>
                                            <CardDescription>List of Attendance</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Replace with your data */}
                                            <DataTable
                                                columns={columns(
                                                    setIsViewOpen, // Pass setIsViewOpen
                                                    setViewEmployee, // Pass setViewEmployee
                                                    setIsModalOpen,
                                                    setEditModalOpen,
                                                    setSelectedEmployee,
                                                    handleEdit,
                                                    handleDelete,
                                                )}
                                                data={data}
                                                attendance={data}
                                                onRefresh={handleRefresh}
                                                refreshing={refreshing}
                                                sessions={sessions}
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
                                            />
                                            {/* <AddAttendanceModal isOpen={isModelOpen} onClose={() => setIsModalOpen(false)} /> */}
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
