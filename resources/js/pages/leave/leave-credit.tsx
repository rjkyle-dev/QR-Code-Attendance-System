import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { departments } from '@/hooks/data';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CreditDisplay } from './components/credit-display';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Leave',
        href: '/leave',
    },
    {
        title: 'Leave Credit Summary',
        href: '/leave/credit-summary',
    },
];

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    department: string;
    position: string;
    remaining_credits?: number;
    used_credits?: number;
    total_credits?: number;
}

interface Props {
    employees: Employee[];
    monthlyLeaveStats?: Array<{
        month: string;
        year: number;
        leaves: number;
        percentage: number;
        date: string;
    }>;
    user_permissions?: {
        is_super_admin: boolean;
        is_supervisor: boolean;
        supervised_departments: string[];
    };
}

export default function LeaveCredit({ employees = [], monthlyLeaveStats = [], user_permissions }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    // Get available departments based on user permissions
    const availableDepartments = useMemo(() => {
        if (user_permissions?.is_super_admin) {
            // SuperAdmin can see all departments
            return departments;
        }
        if (user_permissions?.is_supervisor && user_permissions?.supervised_departments?.length > 0) {
            // Supervisor can only see their supervised departments
            return user_permissions.supervised_departments;
        }
        // Default: show all departments (fallback)
        return departments;
    }, [user_permissions]);

    // Reset selected department if it's not in available departments
    useEffect(() => {
        if (selectedDepartment !== 'All' && !availableDepartments.includes(selectedDepartment)) {
            setSelectedDepartment('All');
        }
    }, [availableDepartments, selectedDepartment]);

    // Filter employees based on permissions, search, and department
    const filteredEmployees = useMemo(() => {
        let filtered = employees;

        // Apply permission-based filtering (safety measure - backend already filters)
        if (user_permissions?.is_supervisor && !user_permissions?.is_super_admin) {
            if (user_permissions?.supervised_departments?.length > 0) {
                filtered = filtered.filter((employee) => user_permissions.supervised_departments.includes(employee.department));
            }
        }

        // Apply search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (employee) =>
                    employee.employee_name.toLowerCase().includes(search) ||
                    employee.employeeid.toLowerCase().includes(search) ||
                    employee.department.toLowerCase().includes(search) ||
                    employee.position.toLowerCase().includes(search),
            );
        }

        // Apply department filter
        if (selectedDepartment !== 'All') {
            filtered = filtered.filter((employee) => employee.department === selectedDepartment);
        }

        return filtered;
    }, [employees, searchTerm, selectedDepartment, user_permissions]);

    // Pagination logic
    const totalEmployees = filteredEmployees.length;
    const totalPages = Math.ceil(totalEmployees / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    // Statistics calculations
    const totalCredits = employees.reduce((sum, emp) => sum + (emp.total_credits || 0), 0);
    const totalUsedCredits = employees.reduce((sum, emp) => sum + (emp.used_credits || 0), 0);
    const totalRemainingCredits = employees.reduce((sum, emp) => sum + (emp.remaining_credits || 0), 0);

    // Handle page changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedDepartment('All');
        setCurrentPage(1);
    };

    // Check if any filters are active
    const hasActiveFilters = searchTerm.trim() || selectedDepartment !== 'All';

    return (
        <SidebarProvider>
            <Head title="Leave Credit Summary" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-6 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div>
                                <div className="ms-2 flex items-center">
                                    <Users className="size-11" />
                                    <div className="ms-2">
                                        <h2 className="flex text-2xl font-bold tracking-tight">Leave Credit Summary</h2>
                                        <p className="text-muted-foreground">Monitor employee leave credits and usage</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filter Section */}
                        <div className="mb-6 space-y-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
                                    {/* Search Input */}
                                    <div className="relative max-w-md">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search employees by name, ID, department, or position..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setCurrentPage(1); // Reset to first page when searching
                                            }}
                                            className="pl-10"
                                        />
                                    </div>

                                    {/* Department Filter */}
                                    <div className="w-full md:w-48">
                                        <Select
                                            value={selectedDepartment}
                                            onValueChange={(value) => {
                                                setSelectedDepartment(value);
                                                setCurrentPage(1); // Reset to first page when filtering
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Departments" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Departments</SelectItem>
                                                {availableDepartments.map((dept) => (
                                                    <SelectItem key={dept} value={dept}>
                                                        {dept}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Clear Filters Button */}
                                    {hasActiveFilters && (
                                        <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-2">
                                            <X className="h-4 w-4" />
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>

                                {/* Results Count */}
                                <div className="text-sm text-muted-foreground">
                                    Showing {startIndex + 1}-{Math.min(endIndex, totalEmployees)} of {totalEmployees} employees
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Active filters:</span>
                                    {searchTerm.trim() && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            Search: "{searchTerm}"
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-0 px-1 hover:bg-transparent"
                                                onClick={() => setSearchTerm('')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    )}
                                    {selectedDepartment !== 'All' && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            Department: {selectedDepartment}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-0 px-1 hover:bg-transparent"
                                                onClick={() => setSelectedDepartment('All')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Credit Summary Overview */}
                        {/* {employees.length > 0 && (
                            <div className="mb-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold">Employee Leave Credits Overview</CardTitle>
                                        <CardDescription>Summary of leave credits across all employees</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <CreditSummary employees={employees} creditType="leave" />
                                    </CardContent>
                                </Card>
                            </div>
                        )} */}

                        {/* Statistics Cards */}
                        {/* <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalEmployees}</div>
                                    <p className="text-xs text-muted-foreground">Active employees</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                                    <div className="h-4 w-4 rounded-full bg-blue-100" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalCredits}</div>
                                    <p className="text-xs text-muted-foreground">Available credits</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Used Credits</CardTitle>
                                    <div className="h-4 w-4 rounded-full bg-yellow-100" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalUsedCredits}</div>
                                    <p className="text-xs text-muted-foreground">Credits consumed</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Remaining Credits</CardTitle>
                                    <div className="h-4 w-4 rounded-full bg-green-100" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalRemainingCredits}</div>
                                    <p className="text-xs text-muted-foreground">Credits remaining</p>
                                </CardContent>
                            </Card>
                        </div> */}

                        {/* Employee Credits Section */}
                        {paginatedEmployees.length > 0 ? (
                            <div className="mb-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold">Employee Leave Credits</CardTitle>
                                        <CardDescription>
                                            Individual employee credit status and usage
                                            {hasActiveFilters && ` - Showing ${paginatedEmployees.length} of ${totalEmployees} employees`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {paginatedEmployees.map((employee) => (
                                                <CreditDisplay key={employee.id} employee={employee} creditType="leave" />
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-semibold">No employees found</h3>
                                        <p className="text-center text-muted-foreground">
                                            {hasActiveFilters
                                                ? `No employees match your current filters. Try adjusting your search terms or department selection.`
                                                : 'No employees available to display.'}
                                        </p>
                                        {hasActiveFilters && (
                                            <Button variant="outline" onClick={clearFilters} className="mt-4">
                                                Clear All Filters
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mb-6">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm text-muted-foreground">Rows per page</p>
                                                <Select value={`${pageSize}`} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                                                    <SelectTrigger className="h-8 w-[70px]">
                                                        <SelectValue placeholder={pageSize} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[8, 12, 16, 20, 24].map((size) => (
                                                            <SelectItem key={size} value={`${size}`}>
                                                                {size}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm text-muted-foreground">
                                                    Page {currentPage} of {totalPages}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handlePageChange(1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <span className="sr-only">Go to first page</span>
                                                        <ChevronsLeft className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <span className="sr-only">Go to previous page</span>
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        <span className="sr-only">Go to next page</span>
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handlePageChange(totalPages)}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        <span className="sr-only">Go to last page</span>
                                                        <ChevronsRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
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
