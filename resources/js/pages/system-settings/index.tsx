import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BanknoteIcon, Building2, Briefcase, Settings } from 'lucide-react';
import { Toaster } from 'sonner';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'System Settings',
        href: '/system-settings',
    },
];

export default function Index() {
    const handleProceed = (type: string) => {
        switch (type) {
            case 'payroll':
                router.visit('/system-settings/payroll');
                break;
            case 'department':
                router.visit('/system-settings/department');
                break;
            case 'position':
                router.visit('/system-settings/position');
                break;
            default:
                break;
        }
    };

    return (
        <SidebarProvider>
            <Head title="System Settings" />
            <Toaster position="top-right" richColors />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div>
                                <div className="ms-2 flex items-center">
                                    <Settings className="size-11" />
                                    <div className="ms-2">
                                        <h2 className="flex text-2xl font-bold tracking-tight">System Settings</h2>
                                        <p className="text-muted-foreground">Manage your organization's system configurations</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="m-3 no-scrollbar">
                            {/* Bento Grid Layout */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {/* Payroll Card */}
                                <Card className="group relative overflow-hidden border-main bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-backgrounds dark:to-backgrounds transition-all duration-300 hover:shadow-xl hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <CardHeader className="relative">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <BanknoteIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <CardTitle className="text-xl font-bold">Payroll</CardTitle>
                                        <CardDescription className="mt-2">
                                            Customize payroll calculation values, rates, and deduction settings
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="relative">
                                        <Button
                                            onClick={() => handleProceed('payroll')}
                                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                        >
                                            Proceed
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Department Card */}
                                <Card className="group relative overflow-hidden border-main bg-gradient-to-br from-emerald-50 to-green-50 dark:from-backgrounds dark:to-backgrounds transition-all duration-300 hover:shadow-xl hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <CardHeader className="relative">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                            <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <CardTitle className="text-xl font-bold">Department</CardTitle>
                                        <CardDescription className="mt-2">
                                            Manage department settings and configurations
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="relative">
                                        <Button
                                            onClick={() => handleProceed('department')}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                                        >
                                            Proceed
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Position Card */}
                                <Card className="group relative overflow-hidden border-main bg-gradient-to-br from-purple-50 to-pink-50 dark:from-backgrounds dark:to-backgrounds transition-all duration-300 hover:shadow-xl hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <CardHeader className="relative">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                            <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <CardTitle className="text-xl font-bold">Position</CardTitle>
                                        <CardDescription className="mt-2">
                                            Configure position settings and role assignments
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="relative">
                                        <Button
                                            onClick={() => handleProceed('position')}
                                            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                                        >
                                            Proceed
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
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
