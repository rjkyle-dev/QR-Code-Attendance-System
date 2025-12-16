<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee;
use App\Models\EmployeeSalarySetting;
use App\Models\Attendance;
use App\Models\Absence;
use App\Models\Payroll;
use App\Models\PayrollEarning;
use App\Models\PayrollDeduction;
use App\Models\PayrollDetail;
use App\Models\PayrollAttendanceDeduction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PayrollSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting Payroll Seeder...');

        // Get or create employees
        $employees = $this->getOrCreateEmployees();
        $this->command->info("Working with {$employees->count()} employees");

        // Create salary settings for each employee
        $this->createSalarySettings($employees);
        $this->command->info('Created salary settings');

        // Create attendance records for the current month
        $this->createAttendanceRecords($employees);
        $this->command->info('Created attendance records');

        // Create some absences
        $this->createAbsences($employees);
        $this->command->info('Created absence records');

        // Create payroll records for different cutoffs
        $this->createPayrolls($employees);
        $this->command->info('Created payroll records');

        $this->command->info('Payroll Seeder completed!');
    }

    /**
     * Get existing employees or create new ones
     */
    private function getOrCreateEmployees()
    {
        $existingEmployees = Employee::take(10)->get();

        if ($existingEmployees->count() < 5) {
            $this->command->info('Creating additional employees...');
            $newEmployees = Employee::factory()->count(5)->create();
            return $existingEmployees->merge($newEmployees);
        }

        return $existingEmployees;
    }

    /**
     * Create salary settings for employees
     */
    private function createSalarySettings($employees)
    {
        foreach ($employees as $employee) {
            // Check if employee already has an active salary setting
            $existingSetting = EmployeeSalarySetting::where('employee_id', $employee->id)
                ->where('is_active', true)
                ->first();

            if (!$existingSetting) {
                // Create salary setting based on work status
                $rateType = match($employee->work_status) {
                    'Regular' => 'monthly',
                    'Add Crew' => 'daily',
                    'Probationary' => 'daily',
                    default => 'daily',
                };

                $rate = match($rateType) {
                    'daily' => rand(300, 800),
                    'monthly' => rand(15000, 35000),
                    'hourly' => rand(60, 150),
                    default => 500,
                };

                EmployeeSalarySetting::factory()
                    ->forEmployee($employee->id)
                    ->state([
                        'rate_type' => $rateType,
                        'rate' => $rate,
                        'cola' => rand(0, 300),
                        'allowance' => rand(0, 500),
                        'hazard_pay' => rand(0, 200),
                        'overtime_rate_multiplier' => 1.25,
                        'night_premium_rate' => 0.10,
                        'effective_date' => Carbon::now()->subMonths(3),
                    ])
                    ->create();
            }
        }
    }

    /**
     * Create attendance records for current month
     */
    private function createAttendanceRecords($employees)
    {
        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();

        foreach ($employees as $employee) {
            // Check if attendance already exists for this period
            $existingAttendance = Attendance::where('employee_id', $employee->id)
                ->whereBetween('attendance_date', [$startDate, $endDate])
                ->exists();

            if (!$existingAttendance) {
                $currentDate = $startDate->copy();
                
                while ($currentDate <= $endDate) {
                    // Skip weekends (Saturday = 6, Sunday = 0)
                    if ($currentDate->dayOfWeek !== 0 && $currentDate->dayOfWeek !== 6) {
                        // 80% chance of being present
                        if (rand(1, 100) <= 80) {
                            $session = ['morning', 'afternoon', 'night'][rand(0, 2)];
                            
                            // Generate time in based on session
                            $timeIn = match($session) {
                                'morning' => Carbon::createFromTime(rand(6, 8), rand(0, 59), 0),
                                'afternoon' => Carbon::createFromTime(rand(12, 14), rand(0, 59), 0),
                                'night' => Carbon::createFromTime(rand(18, 20), rand(0, 59), 0),
                                default => Carbon::createFromTime(8, 0, 0),
                            };

                            // Generate time out (8 hours later, with some variation)
                            $timeOut = $timeIn->copy()->addHours(8)->addMinutes(rand(-30, 30));

                            Attendance::create([
                                'employee_id' => $employee->id,
                                'time_in' => $timeIn->format('H:i:s'),
                                'time_out' => $timeOut->format('H:i:s'),
                                'break_time' => $timeIn->copy()->addHours(4)->format('H:i:s'),
                                'attendance_status' => 'Present',
                                'attendance_date' => $currentDate->format('Y-m-d'),
                                'session' => $session,
                            ]);
                        }
                    }

                    $currentDate->addDay();
                }
            }
        }
    }

    /**
     * Create some absence records
     */
    private function createAbsences($employees)
    {
        // Create absences for 20% of employees
        $employeesWithAbsences = $employees->random((int)($employees->count() * 0.2));

        foreach ($employeesWithAbsences as $employee) {
            $absenceDate = Carbon::now()->subDays(rand(1, 15));
            
            // Check if absence already exists
            $existingAbsence = Absence::where('employee_id', $employee->id)
                ->where('from_date', $absenceDate->format('Y-m-d'))
                ->exists();

            if (!$existingAbsence) {
                Absence::create([
                    'employee_id' => $employee->id,
                    'full_name' => $employee->employee_name,
                    'employee_id_number' => $employee->employeeid,
                    'department' => $employee->department,
                    'position' => $employee->position,
                    'absence_type' => ['Sick Leave', 'Personal Leave', 'Emergency Leave'][rand(0, 2)],
                    'from_date' => $absenceDate->format('Y-m-d'),
                    'to_date' => $absenceDate->format('Y-m-d'),
                    'is_partial_day' => rand(0, 1) === 1,
                    'reason' => 'Test absence for payroll calculation',
                    'status' => 'approved',
                    'submitted_at' => $absenceDate->subDays(1),
                    'approved_at' => $absenceDate,
                ]);
            }
        }
    }

    /**
     * Create payroll records for different cutoffs
     */
    private function createPayrolls($employees)
    {
        $currentMonth = Carbon::now();
        $cutoffs = ['1st', '2nd', '3rd'];

        foreach ($cutoffs as $cutoff) {
            [$periodStart, $periodEnd] = $this->getPeriodDates($currentMonth, $cutoff);

            foreach ($employees as $employee) {
                // Check if payroll already exists
                $existingPayroll = Payroll::where('employee_id', $employee->id)
                    ->where('payroll_date', $periodEnd->format('Y-m-d'))
                    ->where('cutoff_period', $cutoff)
                    ->first();

                if (!$existingPayroll) {
                    // Create payroll with related data
                    $payroll = Payroll::factory()
                        ->forEmployee($employee->id)
                        ->forPeriod($periodStart, $periodEnd, $cutoff)
                        ->draft()
                        ->create();

                    // Create earnings
                    $this->createPayrollEarnings($payroll, $employee);
                    
                    // Create deductions
                    $this->createPayrollDeductions($payroll);
                    
                    // Create details (overtime, premiums)
                    $this->createPayrollDetails($payroll);
                    
                    // Create attendance deductions
                    $this->createAttendanceDeductions($payroll, $employee, $periodStart, $periodEnd);
                    
                    // Reload relationships and recalculate totals
                    $payroll->load(['earnings', 'deductions', 'attendanceDeductions']);
                    $this->recalculatePayrollTotals($payroll);
                }
            }
        }
    }

    /**
     * Get period dates based on cutoff
     */
    private function getPeriodDates(Carbon $month, string $cutoff): array
    {
        $year = $month->year;
        $monthNum = $month->month;

        switch ($cutoff) {
            case '1st':
                return [
                    Carbon::create($year, $monthNum, 1),
                    Carbon::create($year, $monthNum, 15),
                ];
            case '2nd':
                return [
                    Carbon::create($year, $monthNum, 16),
                    Carbon::create($year, $monthNum, 25),
                ];
            case '3rd':
                return [
                    Carbon::create($year, $monthNum, 26),
                    Carbon::create($year, $monthNum)->endOfMonth(),
                ];
            default:
                return [
                    Carbon::create($year, $monthNum, 1),
                    Carbon::create($year, $monthNum, 15),
                ];
        }
    }

    /**
     * Create payroll earnings
     */
    private function createPayrollEarnings($payroll, $employee)
    {
        $salarySetting = $employee->currentSalarySetting();
        if (!$salarySetting) {
            return;
        }

        // Rate
        PayrollEarning::factory()
            ->forPayroll($payroll->id)
            ->rate($salarySetting->rate, 15)
            ->create();

        // Basic
        $basicAmount = match($salarySetting->rate_type) {
            'daily' => $salarySetting->rate * 15,
            'monthly' => $salarySetting->rate / 2,
            'hourly' => $salarySetting->rate * 8 * 15,
            default => $salarySetting->rate * 15,
        };

        PayrollEarning::factory()
            ->forPayroll($payroll->id)
            ->basic($basicAmount)
            ->create();

        // COLA
        if ($salarySetting->cola > 0) {
            PayrollEarning::factory()
                ->forPayroll($payroll->id)
                ->state(['type' => 'cola', 'amount' => $salarySetting->cola])
                ->create();
        }

        // Allowance
        if ($salarySetting->allowance > 0) {
            PayrollEarning::factory()
                ->forPayroll($payroll->id)
                ->state(['type' => 'allowance', 'amount' => $salarySetting->allowance])
                ->create();
        }

        // Hazard Pay
        if ($salarySetting->hazard_pay > 0) {
            PayrollEarning::factory()
                ->forPayroll($payroll->id)
                ->state(['type' => 'hazard_pay', 'amount' => $salarySetting->hazard_pay])
                ->create();
        }

        // Overtime (random)
        if (rand(0, 1)) {
            PayrollEarning::factory()
                ->forPayroll($payroll->id)
                ->overtime(rand(500, 2000))
                ->create();
        }
    }

    /**
     * Create payroll deductions
     */
    private function createPayrollDeductions($payroll)
    {
        $grossPay = $payroll->earnings()->sum('amount');

        // SSS
        PayrollDeduction::factory()
            ->forPayroll($payroll->id)
            ->sss(min($grossPay * 0.11, 2475))
            ->create();

        // Pag-IBIG
        PayrollDeduction::factory()
            ->forPayroll($payroll->id)
            ->pagIbig($grossPay * 0.02)
            ->create();

        // Philhealth
        PayrollDeduction::factory()
            ->forPayroll($payroll->id)
            ->philhealth(min($grossPay * 0.03, 2100))
            ->create();

        // Withholding Tax (simplified)
        if ($grossPay > 20000) {
            PayrollDeduction::factory()
                ->forPayroll($payroll->id)
                ->withholdingTax($grossPay * 0.05)
                ->create();
        }
    }

    /**
     * Create payroll details (overtime, premiums)
     */
    private function createPayrollDetails($payroll)
    {
        // Regular Overtime
        if (rand(0, 1)) {
            PayrollDetail::factory()
                ->forPayroll($payroll->id)
                ->regularOvertime(rand(1, 4), rand(100, 300))
                ->create();
        }

        // Night Premium
        if (rand(0, 1)) {
            PayrollDetail::factory()
                ->forPayroll($payroll->id)
                ->nightPremium(rand(1, 8), rand(20, 50))
                ->create();
        }
    }

    /**
     * Create attendance deductions
     */
    private function createAttendanceDeductions($payroll, $employee, $periodStart, $periodEnd)
    {
        // Get absences for the period
        $absences = Absence::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereBetween('from_date', [$periodStart, $periodEnd])
            ->get();

        $absentDays = $absences->sum(function ($absence) {
            return $absence->is_partial_day ? 0.5 : 1;
        });

        // Random late and undertime hours
        $lateHours = rand(0, 3) > 0 ? rand(1, 5) / 10 : 0;
        $undertimeHours = rand(0, 3) > 0 ? rand(1, 3) / 10 : 0;

        $salarySetting = $employee->currentSalarySetting();
        if (!$salarySetting) {
            return;
        }

        $hourlyRate = match($salarySetting->rate_type) {
            'hourly' => $salarySetting->rate,
            'daily' => $salarySetting->rate / 8,
            'monthly' => ($salarySetting->rate / 22) / 8,
            default => 100,
        };

        $dailyRate = match($salarySetting->rate_type) {
            'daily' => $salarySetting->rate,
            'monthly' => $salarySetting->rate / 22,
            'hourly' => $salarySetting->rate * 8,
            default => 500,
        };

        PayrollAttendanceDeduction::factory()
            ->forPayroll($payroll->id)
            ->state([
                'absent_days' => $absentDays,
                'late_hours' => $lateHours,
                'undertime_hours' => $undertimeHours,
                'absent_deduction' => $absentDays * $dailyRate,
                'late_deduction' => $lateHours * $hourlyRate,
                'undertime_deduction' => $undertimeHours * $hourlyRate,
            ])
            ->create();
    }

    /**
     * Recalculate payroll totals
     */
    private function recalculatePayrollTotals($payroll)
    {
        $grossPay = $payroll->earnings()->sum('amount');
        $attendanceDeductions = $payroll->attendanceDeductions;
        $attendanceDeductionTotal = $attendanceDeductions 
            ? ($attendanceDeductions->absent_deduction + $attendanceDeductions->late_deduction + $attendanceDeductions->undertime_deduction)
            : 0;
        
        $totalDeductions = $payroll->deductions()->sum('amount');
        $netPay = $grossPay - $attendanceDeductionTotal - $totalDeductions;

        $payroll->update([
            'gross_pay' => $grossPay,
            'total_deductions' => $totalDeductions,
            'net_pay' => $netPay,
        ]);
    }
}
