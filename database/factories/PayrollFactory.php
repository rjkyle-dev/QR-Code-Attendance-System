<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Payroll;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payroll>
 */
class PayrollFactory extends Factory
{
    protected $model = Payroll::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cutoff = $this->faker->randomElement(['1st', '2nd', '3rd']);
        $month = Carbon::now()->subMonths($this->faker->numberBetween(0, 6));
        $year = $month->year;
        $monthNum = $month->month;

        // Determine period dates based on cutoff
        [$periodStart, $periodEnd] = $this->getPeriodDates($year, $monthNum, $cutoff);

        $grossPay = $this->faker->randomFloat(2, 5000, 50000);
        $totalDeductions = $this->faker->randomFloat(2, 500, 5000);
        $netPay = $grossPay - $totalDeductions;

        return [
            'employee_id' => Employee::factory(),
            'payroll_date' => $periodEnd,
            'cutoff_period' => $cutoff,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'gross_pay' => $grossPay,
            'total_deductions' => $totalDeductions,
            'net_pay' => $netPay,
            'status' => $this->faker->randomElement(['draft', 'pending', 'approved', 'paid']),
            'approved_by' => null,
            'approved_at' => null,
            'remarks' => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Get period dates based on cutoff
     */
    private function getPeriodDates(int $year, int $month, string $cutoff): array
    {
        switch ($cutoff) {
            case '1st':
                return [
                    Carbon::create($year, $month, 1),
                    Carbon::create($year, $month, 15),
                ];
            case '2nd':
                return [
                    Carbon::create($year, $month, 16),
                    Carbon::create($year, $month, 25),
                ];
            case '3rd':
                return [
                    Carbon::create($year, $month, 26),
                    Carbon::create($year, $month)->endOfMonth(),
                ];
            default:
                return [
                    Carbon::create($year, $month, 1),
                    Carbon::create($year, $month, 15),
                ];
        }
    }

    /**
     * Create payroll for specific employee
     */
    public function forEmployee(int $employeeId): static
    {
        return $this->state(function (array $attributes) use ($employeeId) {
            return [
                'employee_id' => $employeeId,
            ];
        });
    }

    /**
     * Create payroll for specific period
     */
    public function forPeriod(Carbon $periodStart, Carbon $periodEnd, string $cutoff): static
    {
        return $this->state(function (array $attributes) use ($periodStart, $periodEnd, $cutoff) {
            return [
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'payroll_date' => $periodEnd,
                'cutoff_period' => $cutoff,
            ];
        });
    }

    /**
     * Create draft payroll
     */
    public function draft(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'draft',
            ];
        });
    }

    /**
     * Create approved payroll
     */
    public function approved(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'approved',
                'approved_at' => Carbon::now(),
            ];
        });
    }
}
