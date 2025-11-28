<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Evaluation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Evaluation>
 */
class EvaluationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Choose an employee
        $employee = Employee::inRandomOrder()->first();

        // Department and frequency come from either provided attributes or derived
        $department = $this->faker->randomElement([
            'Management & Staff(Admin)',
            'Packing Plant',
            'Harvesting',
            'Pest & Decease',
            'Coop Area',
            'Engineering',
            'Utility',
            'Security Forces',
            'Miscellaneous',
        ]);
        $frequency = $this->faker->randomElement(['semi_annual', 'annual']);

        // Period and year
        $period = $frequency === 'annual' ? 1 : $this->faker->randomElement([1, 2]);
        $year = (int) $this->faker->randomElement([now()->year - 1, now()->year]);

        // Generate component scores
        $attendanceRating = $this->faker->randomFloat(1, 6, 10);
        $attitudeSupervisor = $this->faker->randomFloat(1, 6, 10);
        $attitudeCoworker = $this->faker->randomFloat(1, 6, 10);

        $workAttitude = [
            'responsible' => $this->faker->randomFloat(1, 6, 10),
            'job_knowledge' => $this->faker->randomFloat(1, 6, 10),
            'cooperation' => $this->faker->randomFloat(1, 6, 10),
            'initiative' => $this->faker->randomFloat(1, 6, 10),
            'dependability' => $this->faker->randomFloat(1, 6, 10),
        ];
        $workAttitudeAvg = array_sum($workAttitude) / count($workAttitude);

        // Work function averages will be computed post-create based on created rows.
        // For main record, we will temporarily compute an estimated average; will be overwritten in afterCreating
        $estimatedWorkFunctionAvg = $this->faker->randomFloat(1, 6, 10);

        $total = ($attendanceRating + $attitudeSupervisor + $attitudeCoworker + $workAttitudeAvg + $estimatedWorkFunctionAvg) / 5;
        $total = (float) number_format($total, 1);

        return [
            'employee_id' => $employee?->id ?? 1,
            'department' => $department,
            'evaluation_frequency' => $frequency,
            'evaluator' => $this->faker->name(),
            'observations' => $this->faker->sentence(),
            'total_rating' => $total,
            'evaluation_year' => $year,
            'evaluation_period' => $period,
            'rating_date' => $this->faker->dateTimeBetween("{$year}-01-01", "{$year}-12-31")->format('Y-m-d'),
        ];
    }

    /**
     * Configure the factory.
     */
    public function configure()
    {
        return $this->afterCreating(function (Evaluation $evaluation) {
            // Generate attendance using a plausible late/absent breakdown to produce rating
            $daysLate = $this->faker->numberBetween(0, 6);
            $daysAbsent = $this->faker->numberBetween(0, 4);
            $attendanceRating = max(0, 10 - (($daysLate + $daysAbsent) / 24) * 10);
            $attendanceRating = (float) number_format($attendanceRating, 1);

            $evaluation->attendance()->create([
                'days_late' => $daysLate,
                'days_absent' => $daysAbsent,
                'rating' => $attendanceRating,
                'remarks' => $this->faker->boolean(30) ? $this->faker->sentence() : '',
            ]);

            // Attitudes
            $supervisorRating = (float) number_format($this->faker->randomFloat(1, 6, 10), 1);
            $coworkerRating = (float) number_format($this->faker->randomFloat(1, 6, 10), 1);
            $evaluation->attitudes()->create([
                'supervisor_rating' => $supervisorRating,
                'supervisor_remarks' => $this->faker->boolean(30) ? $this->faker->sentence() : '',
                'coworker_rating' => $coworkerRating,
                'coworker_remarks' => $this->faker->boolean(30) ? $this->faker->sentence() : '',
            ]);

            // Work attitude
            $workAttitude = [
                'responsible' => (float) number_format($this->faker->randomFloat(1, 6, 10), 1),
                'job_knowledge' => (float) number_format($this->faker->randomFloat(1, 6, 10), 1),
                'cooperation' => (float) number_format($this->faker->randomFloat(1, 6, 10), 1),
                'initiative' => (float) number_format($this->faker->randomFloat(1, 6, 10), 1),
                'dependability' => (float) number_format($this->faker->randomFloat(1, 6, 10), 1),
            ];
            $evaluation->workAttitude()->create($workAttitude + [
                'remarks' => $this->faker->boolean(30) ? $this->faker->sentence() : '',
            ]);
            $workAttitudeAvg = array_sum($workAttitude) / count($workAttitude);

            // Department-specific function names (subset)
            $deptFunctions = [
                'Management & Staff(Admin)' => [
                    'Encode workers daily time & accomplishment report (WDTAR)',
                    'Prepare the payroll of periodic paid employees, COOP leave, honorarium and hired workers',
                    'Maintain files of timesheets and other source documents',
                    'Update generation of documents in order to catch up with the remittance/payments schedules',
                    'Prepare and furnish the bookeeper summary of beneficiary\'s deduction',
                ],
                'Packing Plant' => [
                    'Package products according to quality standards',
                    'Ensure proper labeling and documentation',
                    'Meet daily packaging targets and deadlines',
                    'Quality control and inspection',
                    'Maintain packaging equipment',
                ],
                'Harvesting' => [
                    'Harvest crops at optimal maturity',
                    'Sort and grade harvested produce',
                    'Maintain harvest equipment and tools',
                    'Field preparation and maintenance',
                    'Crop handling and transportation',
                ],
                'Pest & Decease' => [
                    'Pest and disease monitoring',
                    'Application of pesticides and treatments',
                    'Field inspection and reporting',
                    'Equipment maintenance',
                    'Safety compliance',
                ],
                'Coop Area' => [
                    'Manage cooperative area operations',
                    'Coordinate with member farmers',
                    'Organize cooperative meetings and events',
                    'Field maintenance',
                    'Crop management',
                ],
                'Engineering' => [
                    'Repair & Maintenance of Vehicles/Equipment',
                    'Machine Operation and Troubleshooting',
                    'Equipment Safety Inspections',
                    'Preventive maintenance',
                    'Technical support',
                ],
                'Utility' => [
                    'Facility maintenance',
                    'Utility system operations',
                    'Equipment repairs',
                    'General maintenance tasks',
                ],
                'Security Forces' => [
                    'Security patrol and monitoring',
                    'Access control',
                    'Incident reporting',
                    'Safety inspections',
                ],
                'Miscellaneous' => [
                    'General field operations',
                    'Support tasks',
                    'Equipment handling',
                    'Facility upkeep',
                ],
            ];

            $functionNames = $deptFunctions[$evaluation->department] ?? ['General Task A', 'General Task B', 'General Task C'];
            // Create 3 to 5 work functions
            $count = $this->faker->numberBetween(3, min(5, count($functionNames)));
            $selected = collect($functionNames)->shuffle()->take($count);

            $workFunctionAverages = [];
            foreach ($selected as $name) {
                $quality = (float) number_format($this->faker->randomFloat(1, 6, 10), 1);
                $efficiency = (float) number_format($this->faker->randomFloat(1, 6, 10), 1);
                $evaluation->workFunctions()->create([
                    'function_name' => $name,
                    'work_quality' => $quality,
                    'work_efficiency' => $efficiency,
                ]);
                $workFunctionAverages[] = ($quality + $efficiency) / 2;
            }
            $workFunctionAvg = count($workFunctionAverages) ? array_sum($workFunctionAverages) / count($workFunctionAverages) : 0;

            // Recompute and persist the total rating based on actual parts
            $total = ($attendanceRating + $supervisorRating + $coworkerRating + $workAttitudeAvg + $workFunctionAvg) / 5;
            $evaluation->total_rating = (float) round($total, 1);
            $evaluation->save();
        });
    }
}
