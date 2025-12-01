import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Calculator,
    Calendar,
    CheckCircle2,
    Clock,
    Database,
    DollarSign,
    Download,
    FileCheck,
    FileText,
    Mail,
    MessageSquare,
    Minus,
    ShieldCheck,
    Zap,
} from 'lucide-react';

interface FlowStep {
    step: number;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    details: string[];
    color: string;
    bgColor: string;
    borderColor: string;
}

const payrollSteps: FlowStep[] = [
    {
        step: 1,
        title: 'Employee Master Data Setup',
        description: 'Employee registration and data storage',
        icon: Database,
        details: [
            'Employee ID (unique identifier)',
            'Department & Position',
            'Salary rate (daily/monthly/hourly)',
            'Employment status (regular/contractual)',
            'Deductions & Allowances configuration',
        ],
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    {
        step: 2,
        title: 'Attendance Collection',
        description: 'Time tracking and validation',
        icon: Clock,
        details: [
            'Employee logs TIME-IN / TIME-OUT',
            'Fingerprint or QR code validation',
            'Duplicate time-in prevention',
            'Attendance stored in database',
        ],
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
    },
    {
        step: 3,
        title: 'Attendance Processing',
        description: 'Calculate work hours and attendance metrics',
        icon: Calculator,
        details: ['Total days worked', 'Total hours worked', 'Overtime hours calculation', 'Late minutes tracking', 'Undertime calculation'],
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
    },
    {
        step: 4,
        title: 'Leave & Holiday Adjustments',
        description: 'Process leave requests and holidays',
        icon: Calendar,
        details: ['Approved paid leaves', 'Holiday pay calculation', 'Absences tracking', 'Sick leave processing', 'Vacation leave management'],
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
    },
    {
        step: 5,
        title: 'Earnings Computation',
        description: 'Calculate employee earnings',
        icon: DollarSign,
        details: [
            'Daily rated: days_worked × daily_rate',
            'Monthly: monthly_rate / pay_periods',
            'Hourly: hours_worked × hourly_rate',
            'Overtime: overtime_hours × overtime_rate',
            'Night differential (if applicable)',
            'Bonuses & incentives',
        ],
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
    },
    {
        step: 6,
        title: 'Deductions Processing',
        description: 'Apply all applicable deductions',
        icon: Minus,
        details: [
            'Government deductions (SSS, Philhealth, Pag-ibig)',
            'Company deductions (cash advances, loans)',
            'Late & undertime penalties',
            'Tax deductions',
        ],
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
    },
    {
        step: 7,
        title: 'Net Pay Calculation',
        description: 'Final pay computation',
        icon: Calculator,
        details: ['Net Pay = Total Earnings – Total Deductions'],
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
    },
    {
        step: 8,
        title: 'Payroll Approval',
        description: 'Review and approve payroll',
        icon: ShieldCheck,
        details: ['Admin/Payroll Officer review', 'Manual adjustments with remarks', 'Override capabilities', 'Audit log recording'],
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
    },
    {
        step: 9,
        title: 'Payslip Generation',
        description: 'Generate employee payslips',
        icon: FileText,
        details: [
            'Printable PDF payslip',
            'Web-based payslip view',
            'Employee details',
            'Earnings breakdown',
            'Deductions summary',
            'Net pay display',
            'Pay period dates',
        ],
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200',
    },
    {
        step: 10,
        title: 'Payroll Completion',
        description: 'Lock payroll period',
        icon: CheckCircle2,
        details: ['Payroll period locked', 'Data cannot be changed', 'Ready for accounting records', 'Archive completed payroll'],
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
    },
];

const optionalFeatures = [
    { icon: Download, label: 'Export to Excel', color: 'text-green-600' },
    { icon: Download, label: 'Export to CSV', color: 'text-blue-600' },
    { icon: FileText, label: 'Government formats', color: 'text-purple-600' },
    { icon: Mail, label: 'Email payslip', color: 'text-orange-600' },
    { icon: FileCheck, label: 'Bank payroll file', color: 'text-indigo-600' },
    { icon: MessageSquare, label: 'SMS notifications', color: 'text-pink-600' },
];

export function PayrollFlow() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Payroll Processing Flow</h2>
                <p className="text-muted-foreground">Complete step-by-step guide to payroll processing</p>
            </div>

            {/* Flow Steps */}
            <div className="space-y-4">
                {payrollSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isLast = index === payrollSteps.length - 1;

                    return (
                        <div key={step.step} className="relative">
                            {/* Connector Line */}
                            {!isLast && <div className="absolute top-20 left-6 h-full w-0.5 bg-gradient-to-b from-gray-300 to-gray-200" />}

                            {/* Step Card */}
                            <Card
                                className={`relative overflow-hidden border-l-4 ${step.borderColor} ${step.bgColor} transition-all duration-300 hover:shadow-lg`}
                            >
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        {/* Step Number Badge */}
                                        <div
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${step.bgColor} border-2 ${step.borderColor}`}
                                        >
                                            <span className={`text-lg font-bold ${step.color}`}>{step.step}</span>
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Icon className={`h-5 w-5 ${step.color}`} />
                                                <CardTitle className="text-xl">{step.title}</CardTitle>
                                            </div>
                                            <CardDescription className="text-base">{step.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="ml-16 space-y-2">
                                        <ul className="space-y-1.5">
                                            {step.details.map((detail, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                                                    <span>{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>

            {/* Optional Add-Ons Section */}
            <Separator className="my-8" />
            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Zap className="h-6 w-6 text-amber-500" />
                        Optional Add-Ons
                    </h3>
                    <p className="text-muted-foreground">Additional features to enhance your payroll system</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {optionalFeatures.map((feature, index) => {
                        const FeatureIcon = feature.icon;
                        return (
                            <Card key={index} className="border-l-4 border-amber-200 bg-amber-50/50 transition-all duration-300 hover:shadow-md">
                                <CardContent className="flex items-center gap-3 p-4">
                                    <FeatureIcon className={`h-5 w-5 ${feature.color}`} />
                                    <span className="font-medium">{feature.label}</span>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
