<?php

namespace Database\Seeders;

use App\Models\Evaluation;
use App\Models\EvaluationConfiguration;
use App\Models\Employee;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EvaluationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure evaluation configurations exist first
        $this->call(EvaluationConfigurationSeeder::class);

        $created = 0;
        $attempts = 0;
        // Create exactly 15 evaluations across random employees/departments
        while ($created < 15 && $attempts < 1000) {
            $attempts++;

            $employee = Employee::inRandomOrder()->whereNotNull('department')->first();
            if (!$employee || empty($employee->department)) {
                continue;
            }

            $department = (string) $employee->department;
            $frequency = EvaluationConfiguration::getFrequencyForDepartment($department);

            $year = (int) collect([now()->year, now()->year - 1])->random();
            $period = $frequency === 'annual' ? 1 : (rand(0, 1) ? 1 : 2);

            // Ensure uniqueness per employee/year/(period if semi-annual)
            $query = Evaluation::where('employee_id', $employee->id)
                ->where('evaluation_year', $year);
            if ($frequency !== 'annual') {
                $query->where('evaluation_period', $period);
            }

            if ($query->exists()) {
                continue;
            }

            Evaluation::factory()->create([
                'employee_id' => $employee->id,
                'department' => $department,
                'evaluation_frequency' => $frequency,
                'evaluation_year' => $year,
                'evaluation_period' => $period,
            ]);

            $created++;
        }
    }
}
