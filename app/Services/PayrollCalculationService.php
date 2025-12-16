<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Absence;
use App\Models\Payroll;
use App\Models\PayrollEarning;
use App\Models\PayrollDeduction;
use App\Models\PayrollDetail;
use App\Models\PayrollAttendanceDeduction;
use App\Models\PayrollSetting;
use Carbon\Carbon;

class PayrollCalculationService
{
    public function calculatePayroll(Employee $employee, Carbon $periodStart, Carbon $periodEnd, string $cutoffPeriod): Payroll
    {
        $salarySetting = $employee->currentSalarySetting();
        if (!$salarySetting) {
            throw new \Exception("No active salary setting found for employee {$employee->id}");
        }

        // Get attendance records for the period
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('attendance_date', [$periodStart, $periodEnd])
            ->where('attendance_status', 'Present')
            ->get();

        // Get absences for the period
        $absences = Absence::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where(function($query) use ($periodStart, $periodEnd) {
                $query->whereBetween('from_date', [$periodStart, $periodEnd])
                      ->orWhereBetween('to_date', [$periodStart, $periodEnd])
                      ->orWhere(function($q) use ($periodStart, $periodEnd) {
                          $q->where('from_date', '<=', $periodStart)
                            ->where('to_date', '>=', $periodEnd);
                      });
            })
            ->get();

        // Create or get payroll record
        $payroll = Payroll::firstOrCreate(
            [
                'employee_id' => $employee->id,
                'payroll_date' => $periodEnd,
                'cutoff_period' => $cutoffPeriod,
            ],
            [
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'status' => 'draft',
            ]
        );

        // Clear existing related records
        $payroll->earnings()->delete();
        $payroll->deductions()->delete();
        $payroll->details()->delete();
        $payroll->attendanceDeductions()->delete();

        // Calculate basic earnings
        $this->calculateBasicEarnings($payroll, $employee, $salarySetting, $attendances, $absences, $periodStart, $periodEnd);
        
        // Calculate overtime and premiums
        $this->calculateOvertimeAndPremiums($payroll, $employee, $salarySetting, $attendances, $periodStart, $periodEnd);
        
        // Calculate attendance deductions
        $this->calculateAttendanceDeductions($payroll, $employee, $salarySetting, $attendances, $absences, $periodStart, $periodEnd);
        
        // Reload relationships before calculating deductions
        $payroll->load('earnings');
        
        // Calculate government and other deductions
        $this->calculateDeductions($payroll, $employee, $salarySetting);
        
        // Reload all relationships before calculating totals
        $payroll->load(['earnings', 'deductions', 'attendanceDeductions']);
        
        // Calculate totals
        $this->calculateTotals($payroll);

        return $payroll->fresh(['earnings', 'deductions', 'details', 'attendanceDeductions']);
    }

    private function calculateBasicEarnings($payroll, $employee, $salarySetting, $attendances, $absences, $periodStart, $periodEnd)
    {
        $rate = $salarySetting->rate;
        $rateType = $salarySetting->rate_type;
        
        // Calculate days worked
        $presentDays = $attendances->count();
        $daysWorked = $presentDays;

        // Calculate basic pay based on rate type
        $basicPay = 0;
        if ($rateType === 'daily') {
            $basicPay = $daysWorked * $rate;
        } elseif ($rateType === 'monthly') {
            $daysPerCutoff = PayrollSetting::getSetting('days_per_cutoff', 15);
            $basicPay = ($rate / 2) * ($daysWorked / $daysPerCutoff); // Assuming semi-monthly
        } elseif ($rateType === 'hourly') {
            $totalHours = $this->calculateTotalHours($attendances);
            $basicPay = $totalHours * $rate;
        }

        // Store earnings
        PayrollEarning::create([
            'payroll_id' => $payroll->id,
            'type' => 'rate',
            'amount' => $rate,
            'quantity' => $daysWorked
        ]);

        PayrollEarning::create([
            'payroll_id' => $payroll->id,
            'type' => 'basic',
            'amount' => $basicPay
        ]);

        PayrollEarning::create([
            'payroll_id' => $payroll->id,
            'type' => 'cola',
            'amount' => $salarySetting->cola
        ]);

        PayrollEarning::create([
            'payroll_id' => $payroll->id,
            'type' => 'allowance',
            'amount' => $salarySetting->allowance
        ]);

        PayrollEarning::create([
            'payroll_id' => $payroll->id,
            'type' => 'hazard_pay',
            'amount' => $salarySetting->hazard_pay
        ]);
    }

    private function calculateOvertimeAndPremiums($payroll, $employee, $salarySetting, $attendances, $periodStart, $periodEnd)
    {
        $rate = $salarySetting->rate;
        $rateType = $salarySetting->rate_type;
        $otMultiplier = $salarySetting->overtime_rate_multiplier;
        $nightPremiumRate = $salarySetting->night_premium_rate;

        $totalOvertime = 0;
        $totalNightPremium = 0;

        foreach ($attendances as $attendance) {
            $timeIn = Carbon::parse($attendance->time_in);
            $timeOut = $attendance->time_out ? Carbon::parse($attendance->time_out) : null;
            
            if (!$timeOut) continue;

            $hoursWorked = $timeIn->diffInHours($timeOut);
            $isNightShift = $this->isNightShift($timeIn, $timeOut);
            $isHoliday = $this->isHoliday($attendance->attendance_date);
            $isRestDay = $this->isRestDay($attendance->attendance_date);
            
            // Calculate regular hours
            $standardWorkHours = PayrollSetting::getSetting('standard_work_hours', 8);
            $regularHours = min($hoursWorked, $standardWorkHours);
            $overtimeHours = max(0, $hoursWorked - $standardWorkHours);

            // Regular overtime
            if ($overtimeHours > 0) {
                $otRate = $this->getHourlyRate($rate, $rateType) * $otMultiplier;
                $otAmount = $overtimeHours * $otRate;
                
                PayrollDetail::create([
                    'payroll_id' => $payroll->id,
                    'type' => 'ot_reg',
                    'hours' => $overtimeHours,
                    'rate' => $otRate,
                    'amount' => $otAmount,
                ]);

                $totalOvertime += $otAmount;
            }

            // Night premium
            if ($isNightShift) {
                $nightHours = $hoursWorked;
                $nightRate = $this->getHourlyRate($rate, $rateType) * $nightPremiumRate;
                $nightAmount = $nightHours * $nightRate;
                
                PayrollDetail::create([
                    'payroll_id' => $payroll->id,
                    'type' => 'night_prem',
                    'hours' => $nightHours,
                    'rate' => $nightRate,
                    'amount' => $nightAmount,
                ]);

                $totalNightPremium += $nightAmount;
            }
        }

        if ($totalOvertime > 0) {
            PayrollEarning::create([
                'payroll_id' => $payroll->id,
                'type' => 'overtime',
                'amount' => $totalOvertime
            ]);
        }

        if ($totalNightPremium > 0) {
            PayrollEarning::create([
                'payroll_id' => $payroll->id,
                'type' => 'night_premium',
                'amount' => $totalNightPremium
            ]);
        }
    }

    private function calculateAttendanceDeductions($payroll, $employee, $salarySetting, $attendances, $absences, $periodStart, $periodEnd)
    {
        $rate = $salarySetting->rate;
        $rateType = $salarySetting->rate_type;
        $hourlyRate = $this->getHourlyRate($rate, $rateType);

        // Calculate absent days
        $absentDays = $this->calculateAbsentDays($absences, $periodStart, $periodEnd);
        $workDaysPerMonth = PayrollSetting::getSetting('work_days_per_month', 22);
        $absentDeduction = $absentDays * ($rateType === 'daily' ? $rate : ($rate / $workDaysPerMonth));

        // Calculate late hours
        $lateHours = $this->calculateLateHours($attendances);
        $lateDeduction = $lateHours * $hourlyRate;

        // Calculate undertime hours
        $undertimeHours = $this->calculateUndertimeHours($attendances);
        $undertimeDeduction = $undertimeHours * $hourlyRate;

        PayrollAttendanceDeduction::create([
            'payroll_id' => $payroll->id,
            'absent_days' => $absentDays,
            'late_hours' => $lateHours,
            'undertime_hours' => $undertimeHours,
            'absent_deduction' => $absentDeduction,
            'late_deduction' => $lateDeduction,
            'undertime_deduction' => $undertimeDeduction,
        ]);
    }

    private function calculateDeductions($payroll, $employee, $salarySetting)
    {
        $grossPay = $payroll->earnings()->sum('amount');
        
        // Government deductions (simplified - you'll need to implement actual calculation)
        $sssPrem = $this->calculateSSS($grossPay);
        $pagIbigPrem = $this->calculatePagIbig($grossPay);
        $philhealth = $this->calculatePhilhealth($grossPay);
        $wTax = $this->calculateWithholdingTax($grossPay, $employee);

        if ($sssPrem > 0) {
            PayrollDeduction::create([
                'payroll_id' => $payroll->id,
                'type' => 'sss_prem',
                'amount' => $sssPrem
            ]);
        }

        if ($pagIbigPrem > 0) {
            PayrollDeduction::create([
                'payroll_id' => $payroll->id,
                'type' => 'pag_ibig_prem',
                'amount' => $pagIbigPrem
            ]);
        }

        if ($philhealth > 0) {
            PayrollDeduction::create([
                'payroll_id' => $payroll->id,
                'type' => 'philhealth',
                'amount' => $philhealth
            ]);
        }

        if ($wTax > 0) {
            PayrollDeduction::create([
                'payroll_id' => $payroll->id,
                'type' => 'w_tax',
                'amount' => $wTax
            ]);
        }
    }

    private function calculateTotals($payroll)
    {
        $grossPay = $payroll->earnings()->sum('amount');
        $attendanceDeductions = $payroll->attendanceDeductions;
        $attendanceDeductionTotal = $attendanceDeductions 
            ? ($attendanceDeductions->absent_deduction + $attendanceDeductions->late_deduction + $attendanceDeductions->undertime_deduction)
            : 0;
        
        $netBasic = $grossPay - $attendanceDeductionTotal;
        $totalDeductions = $payroll->deductions()->sum('amount');
        $netPay = $netBasic - $totalDeductions;

        $payroll->update([
            'gross_pay' => $grossPay,
            'total_deductions' => $totalDeductions,
            'net_pay' => $netPay,
        ]);
    }

    // Helper methods
    private function getHourlyRate($rate, $rateType): float
    {
        $standardWorkHours = PayrollSetting::getSetting('standard_work_hours', 8);
        $workDaysPerMonth = PayrollSetting::getSetting('work_days_per_month', 22);
        
        if ($rateType === 'hourly') return $rate;
        if ($rateType === 'daily') return $rate / $standardWorkHours;
        if ($rateType === 'monthly') return ($rate / $workDaysPerMonth) / $standardWorkHours;
        return 0;
    }

    private function calculateAbsentDays($absences, $periodStart, $periodEnd): float
    {
        $totalDays = 0;
        foreach ($absences as $absence) {
            $from = Carbon::parse($absence->from_date);
            $to = Carbon::parse($absence->to_date);
            
            $start = $from->lt($periodStart) ? $periodStart : $from;
            $end = $to->gt($periodEnd) ? $periodEnd : $to;
            
            $days = $start->diffInDays($end) + 1;
            $totalDays += $absence->is_partial_day ? 0.5 : $days;
        }
        return $totalDays;
    }

    private function calculateTotalHours($attendances): float
    {
        $totalHours = 0;
        foreach ($attendances as $attendance) {
            if ($attendance->time_out) {
                $timeIn = Carbon::parse($attendance->time_in);
                $timeOut = Carbon::parse($attendance->time_out);
                $totalHours += $timeIn->diffInHours($timeOut);
            }
        }
        return $totalHours;
    }

    private function calculateLateHours($attendances): float
    {
        $standardTimeInStr = PayrollSetting::getSetting('standard_time_in', '08:00');
        $standardTimeIn = Carbon::parse($standardTimeInStr);
        
        $lateHours = 0;
        foreach ($attendances as $attendance) {
            $timeIn = Carbon::parse($attendance->time_in);
            
            if ($timeIn->gt($standardTimeIn)) {
                $lateHours += $timeIn->diffInHours($standardTimeIn);
            }
        }
        return $lateHours;
    }

    private function calculateUndertimeHours($attendances): float
    {
        $standardWorkHours = PayrollSetting::getSetting('standard_work_hours', 8);
        
        $undertimeHours = 0;
        foreach ($attendances as $attendance) {
            if ($attendance->time_out) {
                $timeIn = Carbon::parse($attendance->time_in);
                $timeOut = Carbon::parse($attendance->time_out);
                $hoursWorked = $timeIn->diffInHours($timeOut);
                
                if ($hoursWorked < $standardWorkHours) {
                    $undertimeHours += ($standardWorkHours - $hoursWorked);
                }
            }
        }
        return $undertimeHours;
    }

    private function isNightShift($timeIn, $timeOut): bool
    {
        $nightShiftStart = (int) PayrollSetting::getSetting('night_shift_start_hour', 22);
        $nightShiftEnd = (int) PayrollSetting::getSetting('night_shift_end_hour', 6);
        
        $hour = $timeIn->hour;
        return $hour >= $nightShiftStart || $hour < $nightShiftEnd;
    }

    private function isHoliday($date): bool
    {
        // Implement holiday check logic - you can add a holidays table later
        return false;
    }

    private function isRestDay($date): bool
    {
        // Implement rest day check logic (typically weekends)
        return in_array($date->dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY]);
    }

    private function calculateSSS($grossPay): float
    {
        $sssRate = PayrollSetting::getSetting('sss_rate', 0.11);
        $sssMax = PayrollSetting::getSetting('sss_max_contribution', 2475);
        $sssLowThreshold = PayrollSetting::getSetting('sss_low_threshold', 1000);
        $sssHighThreshold = PayrollSetting::getSetting('sss_high_threshold', 30000);
        
        if ($grossPay <= $sssLowThreshold) {
            return $grossPay * $sssRate;
        } elseif ($grossPay <= $sssHighThreshold) {
            return min($grossPay * $sssRate, $sssMax);
        } else {
            return $sssMax;
        }
    }

    private function calculatePagIbig($grossPay): float
    {
        $pagIbigLowRate = PayrollSetting::getSetting('pag_ibig_low_rate', 0.01);
        $pagIbigHighRate = PayrollSetting::getSetting('pag_ibig_high_rate', 0.02);
        $pagIbigThreshold = PayrollSetting::getSetting('pag_ibig_threshold', 1500);
        
        if ($grossPay <= $pagIbigThreshold) {
            return $grossPay * $pagIbigLowRate;
        } else {
            return $grossPay * $pagIbigHighRate;
        }
    }

    private function calculatePhilhealth($grossPay): float
    {
        $philhealthLowAmount = PayrollSetting::getSetting('philhealth_low_amount', 150);
        $philhealthRate = PayrollSetting::getSetting('philhealth_rate', 0.03);
        $philhealthLowThreshold = PayrollSetting::getSetting('philhealth_low_threshold', 10000);
        $philhealthHighThreshold = PayrollSetting::getSetting('philhealth_high_threshold', 70000);
        $philhealthMax = PayrollSetting::getSetting('philhealth_max_contribution', 2100);
        
        if ($grossPay <= $philhealthLowThreshold) {
            return $philhealthLowAmount;
        } elseif ($grossPay <= $philhealthHighThreshold) {
            return min($grossPay * $philhealthRate, $philhealthMax);
        } else {
            return $philhealthMax;
        }
    }

    private function calculateWithholdingTax($grossPay, $employee): float
    {
        // Implement BIR withholding tax calculation
        // This is a simplified version - you'll need to implement the actual tax table
        return 0; // Simplified - implement actual tax calculation
    }
}

