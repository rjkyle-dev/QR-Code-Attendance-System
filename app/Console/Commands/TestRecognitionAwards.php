<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\Evaluation;
use Illuminate\Console\Command;

class TestRecognitionAwards extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'recognition:test';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Test the recognition awards system based on evaluation ratings';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $this->info('Testing Recognition Awards System...');
    $this->newLine();

    // Get current year and period
    $currentYear = now()->year;
    $currentPeriod = now()->month <= 6 ? 1 : 2;
    $periodLabel = $currentPeriod === 1 ? 'Jan-Jun' : 'Jul-Dec';

    $this->info("Current Period: {$periodLabel} {$currentYear}");
    $this->newLine();

    // Get all employees with their latest evaluations
    $employees = Employee::all();
    $this->info("Total Employees: {$employees->count()}");
    $this->newLine();

    $recognitionCandidates = [];
    $noEvaluation = [];
    $lowRating = [];

    foreach ($employees as $employee) {
      // Get the latest evaluation for current period
      $latestEvaluation = Evaluation::where('employee_id', $employee->id)
        ->where('evaluation_year', $currentYear)
        ->where('evaluation_period', $currentPeriod)
        ->first();

      // If no evaluation for current period, check the most recent evaluation
      if (!$latestEvaluation) {
        $latestEvaluation = Evaluation::where('employee_id', $employee->id)
          ->orderBy('evaluation_year', 'desc')
          ->orderBy('evaluation_period', 'desc')
          ->first();
      }

      if (!$latestEvaluation) {
        $noEvaluation[] = $employee;
        continue;
      }

      $totalRating = $latestEvaluation->total_rating ?? 0;

      if ($totalRating >= 8.0) {
        $recognitionCandidates[] = [
          'employee' => $employee,
          'evaluation' => $latestEvaluation,
          'rating' => $totalRating
        ];
      } else {
        $lowRating[] = [
          'employee' => $employee,
          'evaluation' => $latestEvaluation,
          'rating' => $totalRating
        ];
      }
    }

    // Display results
    $this->info("=== RECOGNITION AWARD CANDIDATES (Rating >= 8.0) ===");
    $this->info("Total Candidates: " . count($recognitionCandidates));
    $this->newLine();

    if (count($recognitionCandidates) > 0) {
      $this->table(
        ['Name', 'Department', 'Rating', 'Period', 'Year', 'Date'],
        collect($recognitionCandidates)->map(function ($candidate) {
          return [
            $candidate['employee']->employee_name,
            $candidate['employee']->department,
            $candidate['rating'] . '/10',
            $candidate['evaluation']->period_label,
            $candidate['evaluation']->evaluation_year,
            $candidate['evaluation']->rating_date,
          ];
        })->toArray()
      );
    } else {
      $this->warn('No employees qualify for recognition awards (rating >= 8.0)');
    }

    $this->newLine();
    $this->info("=== EMPLOYEES WITH LOW RATINGS (< 8.0) ===");
    $this->info("Total: " . count($lowRating));

    if (count($lowRating) > 0) {
      $this->table(
        ['Name', 'Department', 'Rating', 'Period', 'Year'],
        collect($lowRating)->take(10)->map(function ($candidate) {
          return [
            $candidate['employee']->employee_name,
            $candidate['employee']->department,
            $candidate['rating'] . '/10',
            $candidate['evaluation']->period_label,
            $candidate['evaluation']->evaluation_year,
          ];
        })->toArray()
      );
    }

    $this->newLine();
    $this->info("=== EMPLOYEES WITHOUT EVALUATIONS ===");
    $this->info("Total: " . count($noEvaluation));

    if (count($noEvaluation) > 0) {
      $this->table(
        ['Name', 'Department'],
        collect($noEvaluation)->take(10)->map(function ($employee) {
          return [
            $employee->employee_name,
            $employee->department,
          ];
        })->toArray()
      );
    }

    $this->newLine();
    $this->info("=== SUMMARY ===");
    $this->info("Total Employees: " . $employees->count());
    $this->info("Recognition Candidates: " . count($recognitionCandidates));
    $this->info("Low Ratings: " . count($lowRating));
    $this->info("No Evaluations: " . count($noEvaluation));

    if (count($recognitionCandidates) > 0) {
      $this->newLine();
      $this->info("✅ Recognition awards system is working! Found " . count($recognitionCandidates) . " eligible employees.");
    } else {
      $this->newLine();
      $this->warn("⚠️  No employees qualify for recognition. Consider running RecognitionAwardSeeder to create test data.");
    }

    return 0;
  }
}
