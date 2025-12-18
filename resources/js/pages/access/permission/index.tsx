import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { SinglePermission } from '@/types/role_permission';
import { Head, router, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import PermissionModal from './components/permission-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permission Management',
        href: '/permission/access/index',
    },
];

interface PageProps {
    permissions: SinglePermission[];
    [key: string]: any;
}

export default function Index() {
    const { permissions } = usePage<PageProps>().props;
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleView = (permission: SinglePermission) => {
        // Handle view logic
        console.log('View permission:', permission);
    };

    const handleEdit = (permission: SinglePermission) => {
        // Handle edit logic
        console.log('Edit permission:', permission);
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        router.delete(route('permission.destroy', id), {
            onSuccess: () => {
                onSuccess();
            },
            onError: (errors) => {
                console.error('Delete failed:', errors);
            },
        });
    };

    return (
        <SidebarProvider>
            <Head title="Permission Management" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div>
                                <div className="ms-2 flex items-center">
                                    <ShieldCheck className="size-11" />
                                    <div className="ms-2">
                                        <h2 className="flex text-2xl font-bold tracking-tight">Permission Management</h2>
                                        <p className="text-muted-foreground">Manage your application permissions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
              <TabsContent value="overview" className="space-y-4">
                <div className="flex flex-1 flex-col">
                  <div className="relative flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                      <div className="flex flex-col">
                        <SectionCards />
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
                                    <CardTitle>Permission List</CardTitle>
                                    <CardDescription>List of all permissions in the system</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DataTable
                                        columns={columns(setIsModalOpen, handleView, handleEdit, handleDelete)}
                                        data={permissions || []}
                                        onAddPermission={() => setIsModalOpen(true)}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>
            <PermissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
