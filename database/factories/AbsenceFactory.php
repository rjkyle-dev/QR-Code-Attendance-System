<?php

namespace Database\Factories;

use App\Models\Absence;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Absence>
 */
class AbsenceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fromDate = $this->faker->dateTimeBetween('-3 months', '+1 month');
        $isPartialDay = $this->faker->boolean(20); // 20% chance of partial day

        // If partial day, make from_date and to_date the same
        if ($isPartialDay) {
            $toDate = clone $fromDate;
        } else {
            // Ensure toDate is always after fromDate by adding days to fromDate
            $maxDays = 7;
            $daysToAdd = $this->faker->numberBetween(0, $maxDays);
            $toDate = clone $fromDate;
            $toDate->modify("+{$daysToAdd} days");
        }

        return [
            'employee_id' => Employee::factory(),
            'full_name' => $this->faker->name(),
            'employee_id_number' => $this->faker->numerify('00###'),
            'department' => $this->faker->randomElement([
                'Management & Staff(Admin)',
                'Packing Plant',
                'Harvesting',
                'Pest & Decease',
                'Miscellaneous',
                'Coop Area',
                'Security Forces',
                'Engineering',
                'Utility'
            ]),
            'position' => $this->faker->randomElement([
                'Manager',
                'Farm Superintendent',
                'HR',
                'Packing Plant Supervisor',
                'Harvesting Supervisor',
                'Regular Hired Workers',
                'Probitionary',
                'Seasonal'
            ]),
            'absence_type' => $this->faker->randomElement([
                'Annual Leave',
                'Personal Leave',
                'Maternity/Paternity',
                'Sick Leave',
                'Emergency Leave',
                'Other'
            ]),
            'from_date' => $fromDate,
            'to_date' => $toDate,
            'is_partial_day' => $isPartialDay,
            'reason' => $this->faker->sentence(10),
            'status' => 'pending',
            'submitted_at' => $this->faker->dateTimeBetween('-2 months', 'now'),
            'approved_at' => null,
            'approved_by' => null,
            'approval_comments' => null,
            'supervisor_status' => 'pending',
            'supervisor_approved_by' => null,
            'supervisor_approved_at' => null,
            'supervisor_comments' => null,
            'hr_status' => null,
            'hr_approved_by' => null,
            'hr_approved_at' => null,
            'hr_comments' => null,
        ];
    }

    /**
     * Indicate that the absence is approved.
     */
    public function approved(): static
    {
        return $this->state(function (array $attributes) {
            $user = User::inRandomOrder()->first() ?? User::factory()->create();
            $supervisorApprovedAt = $this->faker->dateTimeBetween($attributes['submitted_at'], 'now');
            $hrApprovedAt = $this->faker->dateTimeBetween($supervisorApprovedAt, 'now');

            return [
                'status' => 'approved',
                'supervisor_status' => 'approved',
                'hr_status' => 'approved',
                'supervisor_approved_by' => $user->id,
                'supervisor_approved_at' => $supervisorApprovedAt,
                'supervisor_comments' => $this->faker->optional(0.7)->sentence(),
                'hr_approved_by' => $user->id,
                'hr_approved_at' => $hrApprovedAt,
                'hr_comments' => $this->faker->optional(0.7)->sentence(),
                'approved_at' => $hrApprovedAt,
                'approved_by' => $user->id,
                'approval_comments' => $this->faker->optional(0.7)->sentence(),
            ];
        });
    }

    /**
     * Indicate that the absence is rejected.
     */
    public function rejected(): static
    {
        return $this->state(function (array $attributes) {
            $user = User::inRandomOrder()->first() ?? User::factory()->create();
            $rejectedAt = $this->faker->dateTimeBetween($attributes['submitted_at'], 'now');

            // Rejection can happen at supervisor or HR level
            $rejectedAtSupervisor = $this->faker->boolean(60) ? $rejectedAt : null;
            $rejectedAtHR = $rejectedAtSupervisor ? null : $rejectedAt;

            return [
                'status' => 'rejected',
                'supervisor_status' => $rejectedAtSupervisor ? 'rejected' : 'approved',
                'hr_status' => $rejectedAtHR ? 'rejected' : ($rejectedAtSupervisor ? null : 'approved'),
                'supervisor_approved_by' => $rejectedAtSupervisor ? $user->id : ($this->faker->boolean(70) ? $user->id : null),
                'supervisor_approved_at' => $rejectedAtSupervisor ? $rejectedAt : ($this->faker->boolean(70) ? $this->faker->dateTimeBetween($attributes['submitted_at'], 'now') : null),
                'supervisor_comments' => $rejectedAtSupervisor ? $this->faker->sentence() : ($this->faker->optional(0.5)->sentence()),
                'hr_approved_by' => $rejectedAtHR ? $user->id : null,
                'hr_approved_at' => $rejectedAtHR ? $rejectedAt : null,
                'hr_comments' => $rejectedAtHR ? $this->faker->sentence() : null,
                'approved_at' => null,
                'approved_by' => null,
                'approval_comments' => $this->faker->sentence(),
            ];
        });
    }

    /**
     * Indicate that the absence is pending.
     */
    public function pending(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'supervisor_status' => 'pending',
                'hr_status' => null,
                'supervisor_approved_by' => null,
                'supervisor_approved_at' => null,
                'supervisor_comments' => null,
                'hr_approved_by' => null,
                'hr_approved_at' => null,
                'hr_comments' => null,
                'approved_at' => null,
                'approved_by' => null,
                'approval_comments' => null,
            ];
        });
    }
}
