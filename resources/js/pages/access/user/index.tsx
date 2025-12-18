import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { SingleUser } from '@/types/users';
import { Head, router, usePage } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useState } from 'react';
import AddUserModal from './components/add-user-modal';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import EditUserModal from './components/edit-user-modal';
import ViewUserModal from './components/view-user-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Management',
        href: '/permission/user/index',
    },
];

interface PageProps {
    users: SingleUser[];
    roles: Array<{
        id: number;
        name: string;
    }>;
    [key: string]: any;
}

export default function Index() {
    const { users, roles } = usePage<PageProps>().props;
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SingleUser | null>(null);

    const handleView = (user: SingleUser) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleEdit = (user: SingleUser) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        router.delete(route('user.destroy', id), {
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
            <Head title="User Management" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div>
                                <div className="ms-2 flex items-center">
                                    <Users className="size-11" />
                                    <div className="ms-2">
                                        <h2 className="flex text-2xl font-bold tracking-tight">Admin Management</h2>
                                        <p className="text-muted-foreground">Manage your organization's workforce</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                            <TabsContent value="overview" className="space-y-4">
                                <div className="flex flex-1 flex-col">
                                    <div className="relative flex flex-1 flex-col">
                                        <div className="@container/main flex flex-1 flex-col gap-2">
                                            <div className="flex flex-col">{/* <SectionCards /> */}</div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <Separator className="shadow-sm" />
                        </Tabs>
                        <div className="m-3 no-scrollbar">
                            <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                <CardHeader>
                                    <CardTitle>Admin List</CardTitle>
                                    <CardDescription>List of all admins in the system</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DataTable
                                        columns={columns(setIsModalOpen, handleView, handleEdit, handleDelete)}
                                        data={users || []}
                                        onAddUser={() => setIsModalOpen(true)}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>
            <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} roles={roles || []} />
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                roles={roles || []}
            />
            <ViewUserModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />
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
