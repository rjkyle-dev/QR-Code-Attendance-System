import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { ContentLoading } from '@/components/ui/loading';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import type { Employee } from '@/hooks/employees';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BanknoteIcon } from 'lucide-react';
import { useState } from 'react';
import { PayrollPeriodSelector } from './components/payroll-period-selector';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { usePermission } from '@/hooks/user-permission';
import ViewEmployeeDetails from './components/viewemployeedetails';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payroll',
        href: '/payroll',
    },
];

interface Props {
    employee?: Employee[];
    totalDepartment?: number;
    totalEmployee?: number;
    workStatusCounts?: {
        Regular: number;
        'Add Crew': number;
        Probationary: number;
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

export default function Payroll({
    employee = [],
    totalEmployee = 0,
    totalDepartment = 0,
    workStatusCounts,
    departments = [],
    positions = [],
    user_permissions,
}: Props) {
    const { can } = usePermission();
    const [loading] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

    const handleGenerateReport = (data: { month: Date; cutoff: string; employeeId?: string }) => {
        router.post('/payroll/generate', {
            month: data.month.toISOString(),
            cutoff: data.cutoff,
            employee_id: data.employeeId,
        });
    };

    return (
        <SidebarProvider>
            <Head title="Payroll" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    {loading ? (
                        <ContentLoading />
                    ) : (
                        <Main fixed className="overflow-y-auto">
                            <div className="mb-6 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                                <div>
                                    <div className="ms-2 flex items-center">
                                        <BanknoteIcon className="size-11 text-emerald-600" />
                                        <div className="ms-2">
                                            <h2 className="flex text-2xl font-bold tracking-tight">Payroll Management</h2>
                                            <p className="text-muted-foreground">Complete payroll processing system</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <PayrollPeriodSelector employees={employee} onGenerate={handleGenerateReport} />
                            </div>
                            <Separator className="shadow-sm" />

                            <div className="m-3 no-scrollbar">
                                    <Card className="border-main dark:bg-backgrounds overflow-hidden bg-background drop-shadow-lg">
                                        <CardHeader>
                                            <CardTitle>Employee List</CardTitle>
                                            <CardDescription>List of employee</CardDescription>
                                        </CardHeader>
                                        <CardContent className="overflow-x-auto">
                                            <DataTable
                                                columns={columns(
                                                    can,
                                                    setIsViewOpen,
                                                    setViewEmployee
                                                )}
                                                data={employee}
                                            />
                                        </CardContent>
                                    </Card>
                            </div>
                        </Main>
                    )}
                </SidebarInset>
            </SidebarHoverLogic>
            
            {/* View Employee Modal */}
            {isViewOpen && viewEmployee && (
                <ViewEmployeeDetails
                    employee={viewEmployee}
                    isOpen={isViewOpen}
                    onClose={() => {
                        setIsViewOpen(false);
                        setViewEmployee(null);
                    }}
                    onEdit={() => {}}
                    onDelete={() => {}}
                />
            )}
        </SidebarProvider>
    );
}
