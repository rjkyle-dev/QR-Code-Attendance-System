import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CreditCard } from 'lucide-react';

interface CreditOverviewProps {
    employees: Array<{
        id: string;
        employeeid: string;
        employee_name: string;
        department?: string;
        position?: string;
        remaining_credits?: number;
        used_credits?: number;
        total_credits?: number;
    }>;
}

export function CreditOverview({ employees }: CreditOverviewProps) {
    const employeesWithCredits = employees.filter((emp) => emp.remaining_credits !== undefined);

    const lowCredits = employeesWithCredits.filter((emp) => (emp.remaining_credits || 0) <= 3).length;
    const noCredits = employeesWithCredits.filter((emp) => (emp.remaining_credits || 0) === 0).length;
    const goodCredits = employeesWithCredits.filter((emp) => (emp.remaining_credits || 0) > 6).length;

    const totalCredits = employeesWithCredits.reduce((sum, emp) => sum + (emp.remaining_credits || 0), 0);
    const usedCredits = employeesWithCredits.reduce((sum, emp) => sum + (emp.used_credits || 0), 0);

    return (
        <Card className="border-main">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CreditCard className="text-main h-5 w-5" />
                    <CardTitle>Leave Credits Overview</CardTitle>
                </div>
                <CardDescription>Current leave credit status across all employees</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{totalCredits}</div>
                        <div className="text-sm text-muted-foreground">Total Credits</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{goodCredits}</div>
                        <div className="text-sm text-muted-foreground">Good Balance</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{lowCredits}</div>
                        <div className="text-sm text-muted-foreground">Low Credits</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{noCredits}</div>
                        <div className="text-sm text-muted-foreground">No Credits</div>
                    </div>
                </div>

                {noCredits > 0 && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">
                                {noCredits} employee{noCredits > 1 ? 's' : ''} have no leave credits remaining
                            </span>
                        </div>
                    </div>
                )}

                {lowCredits > 0 && (
                    <div className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">
                                {lowCredits} employee{lowCredits > 1 ? 's' : ''} have low leave credits (≤3)
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
