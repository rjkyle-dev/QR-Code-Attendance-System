import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { ContentLoading } from '@/components/ui/loading';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import type { Employee } from '@/hooks/employees';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BanknoteIcon } from 'lucide-react';
import { useState } from 'react';
import { PayrollPeriodSelector } from './components/payroll-period-selector';

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
    const [loading] = useState(false);

    const handleGenerateReport = (data: { month: Date; cutoff: string; employeeId?: string }) => {
        console.log('Generate payroll report:', data);
        // TODO: Implement payroll report generation
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
                        </Main>
                    )}
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}
