import { format } from 'date-fns';

interface PayslipViewProps {
    payroll: {
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

const EARNINGS_LABELS: Record<string, string> = {
    rate: 'Rate',
    basic: 'Basic',
    cola: 'Cola',
    adjustments: 'Adjustments',
    overtime: 'Overtime',
    night_premium: 'Night Premium',
    honorarium: 'Honorarium',
    allowance: 'Allowance',
    hazard_pay: 'Hazard Pay',
    sh_prem: 'SH Prem',
    lh_prem: 'LH Prem',
    drd_prem: 'DRD Prem',
    '13th_month': '13th Month',
};

const DEDUCTIONS_LABELS: Record<string, string> = {
    sss_prem: 'SSS PREM',
    pag_ibig_prem: 'Pag-ibig PREM',
    philhealth: 'Philhealth',
    w_tax: 'W/Tax',
    hospital_account: 'Hospital Account',
    union_dues: 'Union Dues',
    coop: 'COOP',
    mortuary: 'Mortuary',
    dental: 'Dental',
    eent: 'EENT',
    opd_med: 'OPD Med',
    union_loan: 'Union Loan',
    pag_ibig_loan: 'Pag-ibig Loan',
    sss_loan: 'SSS Loan',
    retirement_loan: 'Retirement Loan',
    coop_loan: 'COOP Loan',
    cash_advance: 'Cash Advance',
    other: 'Other Deductions',
};

const DETAILS_LABELS: Record<string, string> = {
    ot_reg: 'OT Reg',
    ot_excess: 'OT Excess',
    ot_sh: 'OT SH',
    ot_lh: 'OT LH',
    legal_holiday: 'Legal Holiday',
    special_holiday: 'Special Holiday',
    duty_sh: 'Duty SH',
    duty_lh: 'Duty LH',
    duty_rest_day: 'Duty Rest Day',
    night_prem: 'Night Prem',
    ot_restday_sh: 'OT Restday SH',
    ot_restday_lh: 'OT Restday LH',
    ot_restday: 'OT Restday',
    ot_lh_excess: 'OT LH Excess',
    ot_sh_excess: 'OT SH Excess',
    ot_restday_excess: 'OT Restday Excess',
};

export default function PayslipView({ payroll }: PayslipViewProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getEarningLabel = (type: string) => EARNINGS_LABELS[type] || type;
    const getDeductionLabel = (type: string) => DEDUCTIONS_LABELS[type] || type;
    const getDetailLabel = (type: string) => DETAILS_LABELS[type] || type;

    const basicEarning = payroll.earnings.find((e) => e.type === 'basic');
    const attendanceDeductions = payroll.attendance_deductions;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
                <h1 className="text-2xl font-bold">PAYSLIP</h1>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold">{payroll.employee.employee_name}</p>
                        <p className="text-muted-foreground">ID: {payroll.employee.employeeid}</p>
                        <p className="text-muted-foreground">{payroll.employee.department}</p>
                        <p className="text-muted-foreground">{payroll.employee.position}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground">
                            Period: {format(new Date(payroll.period_start), 'MMM dd')} -{' '}
                            {format(new Date(payroll.period_end), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-muted-foreground">Cut-off: {payroll.cutoff_period}</p>
                        <p className="text-muted-foreground">
                            Date: {format(new Date(payroll.payroll_date), 'MMM dd, yyyy')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-3 gap-4">
                {/* EARNINGS Column */}
                <div className="space-y-1">
                    <h3 className="font-bold uppercase">EARNINGS</h3>
                    {payroll.earnings.map((earning) => (
                        <div key={earning.type} className="flex justify-between text-sm">
                            <span>{getEarningLabel(earning.type)}</span>
                            <span>{formatCurrency(earning.amount)}</span>
                        </div>
                    ))}

                    {attendanceDeductions && (
                        <>
                            <div className="mt-2 border-t pt-2">
                                <p className="text-xs font-semibold">Less:</p>
                                <div className="flex justify-between text-sm">
                                    <span>
                                        Absent/s: {attendanceDeductions.absent_days.toFixed(2)} =
                                    </span>
                                    <span>{formatCurrency(attendanceDeductions.absent_deduction)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>
                                        Late: {attendanceDeductions.late_hours.toFixed(2)} =
                                    </span>
                                    <span>{formatCurrency(attendanceDeductions.late_deduction)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>
                                        Undertime: {attendanceDeductions.undertime_hours.toFixed(2)} =
                                    </span>
                                    <span>{formatCurrency(attendanceDeductions.undertime_deduction)}</span>
                                </div>
                            </div>
                            <div className="border-t pt-2">
                                <div className="flex justify-between font-semibold">
                                    <span>Net Basic =</span>
                                    <span>
                                        {formatCurrency(
                                            (basicEarning?.amount || 0) -
                                                attendanceDeductions.absent_deduction -
                                                attendanceDeductions.late_deduction -
                                                attendanceDeductions.undertime_deduction
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span>Gross Pay =</span>
                                    <span>{formatCurrency(payroll.gross_pay)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* DEDUCTIONS Column */}
                <div className="space-y-1">
                    <h3 className="font-bold uppercase">DEDUCTIONS</h3>
                    {payroll.deductions.map((deduction) => (
                        <div key={deduction.type} className="flex justify-between text-sm">
                            <span>{getDeductionLabel(deduction.type)}</span>
                            <span>{formatCurrency(deduction.amount)}</span>
                        </div>
                    ))}
                    <div className="mt-4 border-t pt-2">
                        <div className="flex justify-between font-bold">
                            <span>Total Ded =</span>
                            <span>{formatCurrency(payroll.total_deductions)}</span>
                        </div>
                    </div>
                </div>

                {/* DETAILS Column */}
                <div className="space-y-1">
                    <h3 className="font-bold uppercase">DETAILS</h3>
                    {payroll.details.map((detail) => (
                        <div key={detail.type} className="flex justify-between text-sm">
                            <span>
                                {getDetailLabel(detail.type)} ({detail.hours.toFixed(2)}h)
                            </span>
                            <span>{formatCurrency(detail.amount)}</span>
                        </div>
                    ))}
                    <div className="mt-4 border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Netpay =</span>
                            <span>{formatCurrency(payroll.net_pay)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

