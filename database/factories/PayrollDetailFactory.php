<?php

namespace Database\Factories;

use App\Models\Payroll;
use App\Models\PayrollDetail;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PayrollDetail>
 */
class PayrollDetailFactory extends Factory
{
    protected $model = PayrollDetail::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = [
            'ot_reg', 'ot_excess', 'ot_sh', 'ot_lh', 'legal_holiday',
            'special_holiday', 'duty_sh', 'duty_lh', 'duty_rest_day',
            'night_prem', 'ot_restday_sh', 'ot_restday_lh', 'ot_restday',
            'ot_lh_excess', 'ot_sh_excess', 'ot_restday_excess'
        ];
        $type = $this->faker->randomElement($types);
        $hours = $this->faker->randomFloat(2, 1, 8);
        $rate = $this->faker->randomFloat(2, 50, 500);
        $amount = $hours * $rate;

        return [
            'payroll_id' => Payroll::factory(),
            'type' => $type,
            'hours' => $hours,
            'rate' => $rate,
            'amount' => $amount,
            'description' => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Create regular overtime detail
     */
    public function regularOvertime(float $hours = null, float $rate = null): static
    {
        return $this->state(function (array $attributes) use ($hours, $rate) {
            $hours = $hours ?? $this->faker->randomFloat(2, 1, 4);
            $rate = $rate ?? $this->faker->randomFloat(2, 100, 300);
            return [
                'type' => 'ot_reg',
                'hours' => $hours,
                'rate' => $rate,
                'amount' => $hours * $rate,
            ];
        });
    }

    /**
     * Create night premium detail
     */
    public function nightPremium(float $hours = null, float $rate = null): static
    {
        return $this->state(function (array $attributes) use ($hours, $rate) {
            $hours = $hours ?? $this->faker->randomFloat(2, 1, 8);
            $rate = $rate ?? $this->faker->randomFloat(2, 20, 50);
            return [
                'type' => 'night_prem',
                'hours' => $hours,
                'rate' => $rate,
                'amount' => $hours * $rate,
            ];
        });
    }

    /**
     * Create detail for specific payroll
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
