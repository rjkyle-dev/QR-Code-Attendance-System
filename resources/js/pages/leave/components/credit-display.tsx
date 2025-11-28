import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Calendar, CheckCircle, CreditCard } from 'lucide-react';

interface CreditDisplayProps {
    employee: {
        id: string;
        employeeid: string;
        employee_name: string;
        department?: string;
        position?: string;
        remaining_credits?: number;
        used_credits?: number;
        total_credits?: number;
    };
    showDetails?: boolean;
    creditType?: 'leave' | 'absence';
}

export function CreditDisplay({ employee, showDetails = true, creditType = 'leave' }: CreditDisplayProps) {
    const remaining = employee.remaining_credits || 0;
    const used = employee.used_credits || 0;
    const total = employee.total_credits || 12;
    const percentage = total > 0 ? Math.round((remaining / total) * 100) : 0;

    const getCreditStatus = () => {
        if (remaining === 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle };
        if (remaining <= 3) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle };
        if (remaining <= 6) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: Calendar };
        return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle };
    };

    const status = getCreditStatus();
    const IconComponent = status.icon;
    const creditTypeLabel = creditType === 'absence' ? 'Absence Credits' : 'Leave Credits';

    return (
        <Card className={`${status.bg} ${status.border} border-2 transition-all hover:shadow-md`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    {/* <div className="flex items-center gap-2">
                        <CreditCard className={`h-5 w-5 ${status.color}`} />
                        <CardTitle className={`text-lg ${status.color}`}>{creditTypeLabel}</CardTitle>
                    </div> */}
                    <span className="text-lg font-medium">{employee.employee_name}</span>
                    {/* <span className="text-sm text-muted-foreground">({employee.employeeid})</span> */}
                    {/* {employee.employee_name} ({employee.employeeid}) */}
                    <Badge variant="outline" className={status.color}>
                        {remaining}/{total}
                    </Badge>
                </div>
                <CardDescription className="text-sm">
                    {/* {employee.employee_name} ({employee.employeeid}) */}
                    <div className="flex items-center gap-2">
                        <CreditCard className={`h-5 w-5 ${status.color}`} />
                        <CardTitle className={`text-md ${status.color}`}>{creditTypeLabel}</CardTitle>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Credit Usage</span>
                        <span className="text-muted-foreground">{percentage}% remaining</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                </div>

                {showDetails && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Remaining</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">{remaining}</div>
                            <div className="text-xs text-muted-foreground">credits available</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">Used</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{used}</div>
                            <div className="text-xs text-muted-foreground">credits used</div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <IconComponent className="h-3 w-3" />
                    {remaining === 0 && 'No credits remaining'}
                    {remaining <= 3 && remaining > 0 && 'Low credits remaining'}
                    {remaining <= 6 && remaining > 3 && 'Moderate credits remaining'}
                    {remaining > 6 && 'Good credit balance'}
                </div>

                {employee.department && employee.position && (
                    <div className="text-xs text-muted-foreground">
                        {employee.department} • {employee.position}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface CreditSummaryProps {
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
    creditType?: 'leave' | 'absence';
}

export function CreditSummary({ employees, creditType = 'leave' }: CreditSummaryProps) {
    const totalEmployees = employees.length;
    const employeesWithCredits = employees.filter((emp) => emp.remaining_credits !== undefined);

    const lowCredits = employeesWithCredits.filter((emp) => (emp.remaining_credits || 0) <= 3).length;
    const noCredits = employeesWithCredits.filter((emp) => (emp.remaining_credits || 0) === 0).length;
    const goodCredits = employeesWithCredits.filter((emp) => (emp.remaining_credits || 0) > 6).length;

    const totalCredits = employeesWithCredits.reduce((sum, emp) => sum + (emp.remaining_credits || 0), 0);
    const usedCredits = employeesWithCredits.reduce((sum, emp) => sum + (emp.used_credits || 0), 0);

    const creditTypeLabel = creditType === 'absence' ? 'Absence Credits' : 'Leave Credits';

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{totalCredits}</div>
                            <div className="text-sm text-blue-600">Total {creditTypeLabel}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                            <div className="text-2xl font-bold text-green-600">{goodCredits}</div>
                            <div className="text-sm text-green-600">Good Balance</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">{lowCredits}</div>
                            <div className="text-sm text-yellow-600">Low Credits</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                            <div className="text-2xl font-bold text-red-600">{noCredits}</div>
                            <div className="text-sm text-red-600">No Credits</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
