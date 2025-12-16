<?php

namespace Database\Factories;

use App\Models\Payroll;
use App\Models\PayrollDeduction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PayrollDeduction>
 */
class PayrollDeductionFactory extends Factory
{
    protected $model = PayrollDeduction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = [
            'sss_prem', 'pag_ibig_prem', 'philhealth', 'w_tax',
            'hospital_account', 'union_dues', 'coop', 'mortuary',
            'dental', 'eent', 'opd_med', 'union_loan', 'pag_ibig_loan',
            'sss_loan', 'retirement_loan', 'coop_loan', 'cash_advance', 'other'
        ];
        $type = $this->faker->randomElement($types);

        return [
            'payroll_id' => Payroll::factory(),
            'type' => $type,
            'amount' => $this->faker->randomFloat(2, 0, 5000),
            'description' => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Create SSS premium deduction
     */
    public function sss(float $amount = null): static
    {
        return $this->state(function (array $attributes) use ($amount) {
            return [
                'type' => 'sss_prem',
                'amount' => $amount ?? $this->faker->randomFloat(2, 500, 2500),
            ];
        });
    }

    /**
     * Create Pag-IBIG premium deduction
     */
    public function pagIbig(float $amount = null): static
    {
        return $this->state(function (array $attributes) use ($amount) {
            return [
                'type' => 'pag_ibig_prem',
                'amount' => $amount ?? $this->faker->randomFloat(2, 100, 500),
            ];
        });
    }

    /**
     * Create Philhealth deduction
     */
    public function philhealth(float $amount = null): static
    {
        return $this->state(function (array $attributes) use ($amount) {
            return [
                'type' => 'philhealth',
                'amount' => $amount ?? $this->faker->randomFloat(2, 150, 500),
            ];
        });
    }

    /**
     * Create withholding tax deduction
     */
    public function withholdingTax(float $amount = null): static
    {
        return $this->state(function (array $attributes) use ($amount) {
            return [
                'type' => 'w_tax',
                'amount' => $amount ?? $this->faker->randomFloat(2, 0, 3000),
            ];
        });
    }

    /**
     * Create deduction for specific payroll
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
