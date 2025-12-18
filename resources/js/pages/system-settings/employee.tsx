import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { SectionCards } from './components/section-cards';
// import { Employees } from './components/columns';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service Tenure',
        href: '/service-tenure',
    },
];

interface Props {
    employees_all: any[];
}

export default function Index({ employees_all }: Props) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(employees_all);
    const [editModelOpen, setEditModalOpen] = useState(false);
    const [isModelOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewEmployee, setViewEmployee] = useState<any | null>(null);

    const handleEdit = (employee: any) => {
        setSelectedEmployee(employee);
        setEditModalOpen(true);
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        // Implement delete logic here
        console.log('Delete employee with ID:', id);
        onSuccess();
    };

    return (
        <SidebarProvider>
            <Head title="Service Tenure" />
            <SidebarHoverLogic>
                <SidebarInset>
                    {/* <HeaderShrink/> */}
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div>
                                <div className="ms-2 flex items-center">
                                    <Users className="size-11" />
                                    <div className="ms-2">
                                        <h2 className="flex text-2xl font-bold tracking-tight">Service Tenure</h2>
                                        <p className="text-muted-foreground">Manage your organization's service tenure</p>
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
                                                {/* <SectionCards /> */}
                                                {/* <SectionCards totalRevenue={totalRevenue} payments={[]} totalEmployee={totalEmployee} /> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            {/* <Separator className="shadow-sm" /> */}
                        </Tabs>
                        <div className="m-3 no-scrollbar">
                            <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                <CardHeader>
                                    <CardTitle>Service Tenure</CardTitle>
                                    <CardDescription>List of Service Tenure Employee</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DataTable
                                        columns={columns(
                                            setIsViewOpen,
                                            setViewEmployee,
                                            setIsModalOpen,
                                            setEditModalOpen,
                                            setSelectedEmployee,
                                            handleEdit,
                                            handleDelete,
                                        )}
                                        data={data}
                                        showRecalculateButton={false}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </Main>
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
