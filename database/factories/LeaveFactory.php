<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Employee;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Leave>
 */
class LeaveFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-1 year', 'now');
        $end = (clone $start)->modify('+' . rand(1, 10) . ' days');
        $days = $end->diff($start)->days;

        return [
            'employee_id'         => Employee::factory(), // or use an existing employee id
            'leave_type'          => $this->faker->randomElement(['Vacation', 'Sick', 'Maternity', 'Paternity']),
            'leave_start_date'    => $start->format('Y-m-d'),
            'leave_end_date'      => $end->format('Y-m-d'),
            'leave_days'          => $days,
            'leave_status'        => $this->faker->randomElement(['Pending', 'Approved', 'Rejected']),
            'leave_reason'        => $this->faker->sentence(8, true), // English sentence, ~8 words
            'leave_date_reported' => $start->format('Y-m-d'),
            'leave_date_approved' => $this->faker->optional()->date('Y-m-d'),
            'leave_comments'      => $this->faker->optional()->sentence(10, true), // English sentence, ~10 words
        ];
    }
}
