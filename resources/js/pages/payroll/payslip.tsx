import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import PayslipView from './components/payslip-view';

interface PayslipProps {
    payroll: {
        id: number;
        employee: {
            employee_name: string;
            employeeid: string;
            department: string;
            position: string;
        };
        payroll_date: string;
        cutoff_period: string;
        period_start: string;
        period_end: string;
        gross_pay: number;
        total_deductions: number;
        net_pay: number;
        earnings: Array<{ type: string; amount: number; quantity?: number }>;
        deductions: Array<{ type: string; amount: number }>;
        details: Array<{ type: string; hours: number; rate: number; amount: number }>;
        attendance_deductions?: {
            absent_days: number;
            late_hours: number;
            undertime_hours: number;
            absent_deduction: number;
            late_deduction: number;
            undertime_deduction: number;
        };
    };
}

function SidebarHoverLogic({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const { handleMouseEnter, handleMouseLeave } = useSidebarHover();

    return (
        <>
            <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <AppSidebar />
            {children}
        </>
    );
}

export default function Payslip({ payroll }: PayslipProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Implement PDF download
        console.log('Download PDF');
    };

    const handleBack = () => {
        router.visit('/payroll');
    };

    return (
        <SidebarProvider>
            <Head title="Payslip" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={[]} title="Payslip" />
                    <Main fixed className="overflow-y-auto">
                        <div className="mb-4 flex justify-between gap-2 print:hidden">
                            <Button onClick={handleBack} variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <div className="flex gap-2">
                                <Button onClick={handlePrint} variant="outline">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </Button>
                                <Button onClick={handleDownload} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                        <Card className="print:shadow-none">
                            <CardContent className="p-6">
                                <PayslipView payroll={payroll} />
                            </CardContent>
                        </Card>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}

