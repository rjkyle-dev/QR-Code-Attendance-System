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
import { Toaster } from 'sonner';
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
        href: '/service-tenure/index',
    },
];

export default function Index() {
    const [loading, setLoading] = useState(true);

    return (
        <SidebarProvider>
            <Head title="Service Tenure" />
            <Toaster position="top-right" richColors />
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
                                        <h2 className="flex text-2xl font-bold tracking-tight">Dashboard</h2>
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
                                    <CardTitle>Dashboard</CardTitle>
                                    <CardDescription>Dashboard of Service Tenure</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Replace with your data */}
                                    <DataTable columns={columns([])} data={[]} />
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
