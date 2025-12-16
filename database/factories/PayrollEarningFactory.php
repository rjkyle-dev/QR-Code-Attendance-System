<?php

namespace Database\Factories;

use App\Models\Payroll;
use App\Models\PayrollEarning;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PayrollEarning>
 */
class PayrollEarningFactory extends Factory
{
    protected $model = PayrollEarning::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['rate', 'basic', 'cola', 'adjustments', 'overtime', 'night_premium', 'honorarium', 'allowance', 'hazard_pay', 'sh_prem', 'lh_prem', 'drd_prem', '13th_month'];
        $type = $this->faker->randomElement($types);

        return [
            'payroll_id' => Payroll::factory(),
            'type' => $type,
            'amount' => $this->faker->randomFloat(2, 0, 10000),
            'quantity' => $this->faker->optional()->randomFloat(2, 1, 30), // For days, hours, etc.
            'description' => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Create rate earning
     */
    public function rate(float $amount = null, float $quantity = null): static
    {
        return $this->state(function (array $attributes) use ($amount, $quantity) {
            return [
                'type' => 'rate',
                'amount' => $amount ?? $this->faker->randomFloat(2, 300, 1000),
                'quantity' => $quantity ?? $this->faker->randomFloat(2, 1, 30),
            ];
        });
    }

    /**
     * Create basic earning
     */
    public function basic(float $amount = null): static
    {
        return $this->state(function (array $attributes) use ($amount) {
            return [
                'type' => 'basic',
                'amount' => $amount ?? $this->faker->randomFloat(2, 5000, 30000),
            ];
        });
    }

    /**
     * Create overtime earning
     */
    public function overtime(float $amount = null): static
    {
        return $this->state(function (array $attributes) use ($amount) {
            return [
                'type' => 'overtime',
                'amount' => $amount ?? $this->faker->randomFloat(2, 0, 5000),
            ];
        });
    }

    /**
     * Create earning for specific payroll
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
