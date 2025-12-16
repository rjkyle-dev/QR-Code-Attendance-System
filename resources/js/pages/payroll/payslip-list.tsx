import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';

interface PayslipListProps {
    payrolls: Array<{
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
        status: string;
    }>;
    period_start: string;
    period_end: string;
    cutoff: string;
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

export default function PayslipList({ payrolls, period_start, period_end, cutoff }: PayslipListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const handleBack = () => {
        router.visit('/payroll');
    };

    const handleViewPayslip = (id: number) => {
        router.visit(`/payroll/${id}`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Calculate pagination
    const totalPages = Math.ceil(payrolls.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPayrolls = useMemo(() => {
        return payrolls.slice(startIndex, endIndex);
    }, [payrolls, startIndex, endIndex]);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <SidebarProvider>
            <Head title="Payroll List" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={[]} title="Payroll List" />
                    <Main fixed className="overflow-y-auto">
                        <div className="mb-4 flex justify-between items-center print:hidden">
                            <Button onClick={handleBack} variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                Period: {format(new Date(period_start), 'MMM dd')} -{' '}
                                {format(new Date(period_end), 'MMM dd, yyyy')} ({cutoff} Cut-off)
                            </div>
                        </div>

                        <div className="space-y-4">
                            {payrolls.length === 0 ? (
                                <Card>
                                    <CardContent className="p-6 text-center text-muted-foreground">
                                        No payroll records found for this period.
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {currentPayrolls.map((payroll) => (
                                        <Card key={payroll.id}>
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle>{payroll.employee.employee_name}</CardTitle>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            ID: {payroll.employee.employeeid} |{' '}
                                                            {payroll.employee.department} | {payroll.employee.position}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold">
                                                            Net Pay: {formatCurrency(payroll.net_pay)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Status: {payroll.status}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Gross Pay</p>
                                                        <p className="font-semibold">{formatCurrency(payroll.gross_pay)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Total Deductions</p>
                                                        <p className="font-semibold">
                                                            {formatCurrency(payroll.total_deductions)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Net Pay</p>
                                                        <p className="font-semibold text-emerald-600">
                                                            {formatCurrency(payroll.net_pay)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                    <Button
                                                        onClick={() => handleViewPayslip(payroll.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Payslip
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between border-t pt-4">
                                            <div className="text-sm text-muted-foreground">
                                                Showing {startIndex + 1} to {Math.min(endIndex, payrolls.length)} of {payrolls.length} payrolls
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handlePreviousPage}
                                                    disabled={currentPage === 1}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                    Previous
                                                </Button>
                                                
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                        // Show first page, last page, current page, and pages around current
                                                        if (
                                                            page === 1 ||
                                                            page === totalPages ||
                                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                                        ) {
                                                            return (
                                                                <Button
                                                                    key={page}
                                                                    variant={currentPage === page ? 'default' : 'outline'}
                                                                    size="sm"
                                                                    onClick={() => handlePageClick(page)}
                                                                    className="min-w-[2.5rem]"
                                                                >
                                                                    {page}
                                                                </Button>
                                                            );
                                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                            return <span key={page} className="px-2">...</span>;
                                                        }
                                                        return null;
                                                    })}
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}

