<?php

namespace Database\Factories;

use App\Models\Payroll;
use App\Models\PayrollAttendanceDeduction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PayrollAttendanceDeduction>
 */
class PayrollAttendanceDeductionFactory extends Factory
{
    protected $model = PayrollAttendanceDeduction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $absentDays = $this->faker->randomFloat(2, 0, 3);
        $lateHours = $this->faker->randomFloat(2, 0, 5);
        $undertimeHours = $this->faker->randomFloat(2, 0, 3);

        // Calculate deductions (simplified - in real scenario, these would be based on rates)
        $hourlyRate = 100; // Example hourly rate
        $dailyRate = 500; // Example daily rate

        return [
            'payroll_id' => Payroll::factory(),
            'absent_days' => $absentDays,
            'late_hours' => $lateHours,
            'undertime_hours' => $undertimeHours,
            'absent_deduction' => $absentDays * $dailyRate,
            'late_deduction' => $lateHours * $hourlyRate,
            'undertime_deduction' => $undertimeHours * $hourlyRate,
        ];
    }

    /**
     * Create attendance deduction with no absences/late/undertime
     */
    public function perfect(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'absent_days' => 0,
                'late_hours' => 0,
                'undertime_hours' => 0,
                'absent_deduction' => 0,
                'late_deduction' => 0,
                'undertime_deduction' => 0,
            ];
        });
    }

    /**
     * Create attendance deduction with absences
     */
    public function withAbsences(float $days = null): static
    {
        return $this->state(function (array $attributes) use ($days) {
            $days = $days ?? $this->faker->randomFloat(2, 0.5, 3);
            $dailyRate = 500; // Example rate
            return [
                'absent_days' => $days,
                'absent_deduction' => $days * $dailyRate,
            ];
        });
    }

    /**
     * Create attendance deduction for specific payroll
     */
    public function forPayroll(int $payrollId): static
    {
        return $this->state(function (array $attributes) use ($payrollId) {
            return [
                'payroll_id' => $payrollId,
            ];
        });
    }
}
