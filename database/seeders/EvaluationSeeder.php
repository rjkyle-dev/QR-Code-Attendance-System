<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee;
use App\Models\Evaluation;
use App\Models\EvaluationConfiguration;
use Carbon\Carbon;

class EvaluationSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Departments that have evaluations
    $departments = [
      'Management & Staff(Admin)',
      'Packing Plant',
      'Harvesting',
      'Pest & Decease',
      'Coop Area',
      'Engineering',
      'Utility',
      'Security Forces',
      'Miscellaneous',
    ];

    $currentYear = now()->year;
    $currentPeriod = Evaluation::calculatePeriod(now());

    foreach ($departments as $department) {
      // Get employees from this department
      $employees = Employee::where('department', $department)->get();

      if ($employees->count() === 0) {
        $this->command->warn("No employees found for department: {$department}. Skipping...");
        continue;
      }

      // Get evaluation frequency for this department
      $frequency = EvaluationConfiguration::getFrequencyForDepartment($department);

      // Determine how many evaluations to create (30 per department)
      $targetCount = 30;
      $createdCount = 0;

      // Shuffle employees to get random selection
      $shuffledEmployees = $employees->shuffle();

      foreach ($shuffledEmployees as $employee) {
        if ($createdCount >= $targetCount) {
          break;
        }

        // For annual departments, create evaluation for current year
        // For semi-annual, create for current period
        $evaluationYear = $currentYear;
        $evaluationPeriod = $frequency === 'annual' ? 1 : $currentPeriod;

        // Check if evaluation already exists for this employee, period, and year
        $existingEvaluation = Evaluation::where('employee_id', $employee->id)
          ->where('evaluation_year', $evaluationYear)
          ->where('evaluation_period', $evaluationPeriod)
          ->first();

        if ($existingEvaluation) {
          continue; // Skip if already exists
        }

        // Generate rating date within the period
        if ($evaluationPeriod === 1) {
          $startDate = Carbon::create($evaluationYear, 1, 1);
          $endDate = Carbon::create($evaluationYear, 6, 30);
        } else {
          $startDate = Carbon::create($evaluationYear, 7, 1);
          $endDate = Carbon::create($evaluationYear, 12, 31);
        }

        // Create evaluation using factory
        $evaluation = Evaluation::factory()->create([
          'employee_id' => $employee->id,
          'department' => $department,
          'evaluation_frequency' => $frequency,
          'evaluation_year' => $evaluationYear,
          'evaluation_period' => $evaluationPeriod,
          'rating_date' => Carbon::createFromTimestamp(
            rand($startDate->timestamp, min($endDate->timestamp, now()->timestamp))
          )->format('Y-m-d'),
        ]);

        $createdCount++;
      }

      // If we still need more evaluations, create some for previous periods/years
      if ($createdCount < $targetCount) {
        $remaining = $targetCount - $createdCount;

        foreach ($shuffledEmployees as $employee) {
          if ($remaining <= 0) {
            break;
          }

          // Create evaluation for previous period/year
          $prevYear = $currentYear - 1;
          $prevPeriod = $currentPeriod === 1 ? 2 : 1;

          // Check if evaluation already exists
          $existingEvaluation = Evaluation::where('employee_id', $employee->id)
            ->where('evaluation_year', $prevYear)
            ->where('evaluation_period', $prevPeriod)
            ->first();

          if ($existingEvaluation) {
            continue;
          }

          // Generate rating date within the previous period
          if ($prevPeriod === 1) {
            $startDate = Carbon::create($prevYear, 1, 1);
            $endDate = Carbon::create($prevYear, 6, 30);
          } else {
            $startDate = Carbon::create($prevYear, 7, 1);
            $endDate = Carbon::create($prevYear, 12, 31);
          }

          Evaluation::factory()->create([
            'employee_id' => $employee->id,
            'department' => $department,
            'evaluation_frequency' => $frequency,
            'evaluation_year' => $prevYear,
            'evaluation_period' => $prevPeriod,
            'rating_date' => Carbon::createFromTimestamp(
              rand($startDate->timestamp, $endDate->timestamp)
            )->format('Y-m-d'),
          ]);

          $remaining--;
        }
      }

      $this->command->info("Created {$createdCount} evaluations for department: {$department}");
    }

    $this->command->info('Evaluation seeding completed!');
  }
}
