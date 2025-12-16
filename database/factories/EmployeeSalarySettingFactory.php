<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\EmployeeSalarySetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmployeeSalarySetting>
 */
class EmployeeSalarySettingFactory extends Factory
{
    protected $model = EmployeeSalarySetting::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $rateType = $this->faker->randomElement(['daily', 'monthly', 'hourly']);
        
        // Set appropriate rate based on rate type
        $rate = match($rateType) {
            'daily' => $this->faker->randomFloat(2, 300, 1000), // PHP 300-1000 per day
            'monthly' => $this->faker->randomFloat(2, 10000, 50000), // PHP 10k-50k per month
            'hourly' => $this->faker->randomFloat(2, 50, 200), // PHP 50-200 per hour
            default => $this->faker->randomFloat(2, 300, 1000),
        };

        return [
            'employee_id' => Employee::factory(),
            'rate_type' => $rateType,
            'rate' => $rate,
            'cola' => $this->faker->randomFloat(2, 0, 500), // Cost of Living Allowance
            'allowance' => $this->faker->randomFloat(2, 0, 1000),
            'hazard_pay' => $this->faker->randomFloat(2, 0, 500),
            'overtime_rate_multiplier' => $this->faker->randomFloat(2, 1.25, 2.0), // 125% to 200%
            'night_premium_rate' => $this->faker->randomFloat(2, 0.10, 0.25), // 10% to 25%
            'is_active' => true,
            'effective_date' => $this->faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
        ];
    }

    /**
     * Create salary setting for daily rate
     */
    public function dailyRate(float $rate = null): static
    {
        return $this->state(function (array $attributes) use ($rate) {
            return [
                'rate_type' => 'daily',
                'rate' => $rate ?? $this->faker->randomFloat(2, 300, 1000),
            ];
        });
    }

    /**
     * Create salary setting for monthly rate
     */
    public function monthlyRate(float $rate = null): static
    {
        return $this->state(function (array $attributes) use ($rate) {
            return [
                'rate_type' => 'monthly',
                'rate' => $rate ?? $this->faker->randomFloat(2, 10000, 50000),
            ];
        });
    }

    /**
     * Create salary setting for hourly rate
     */
    public function hourlyRate(float $rate = null): static
    {
        return $this->state(function (array $attributes) use ($rate) {
            return [
                'rate_type' => 'hourly',
                'rate' => $rate ?? $this->faker->randomFloat(2, 50, 200),
            ];
        });
    }

    /**
     * Create inactive salary setting
     */
    public function inactive(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }

    /**
     * Create salary setting for specific employee
     */
    public function forEmployee(int $employeeId): static
    {
        return $this->state(function (array $attributes) use ($employeeId) {
            return [
                'employee_id' => $employeeId,
            ];
        });
    }
}
