<?php

namespace App\Console\Commands;

use App\Models\Evaluation;
use App\Models\EvaluationConfiguration;
use App\Models\Employee;
use Illuminate\Console\Command;

class TestEvaluationSystem extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'evaluation:test';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Test the new evaluation system with periods and frequencies';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $this->info('Testing Evaluation System...');
    $this->newLine();

    // Test 1: Check evaluation configurations
    $this->info('1. Evaluation Configurations:');
    $configs = EvaluationConfiguration::all();
    foreach ($configs as $config) {
      $this->line("   - {$config->department}: {$config->evaluation_frequency}");
    }
    $this->newLine();

    // Test 2: Check current period calculation
    $this->info('2. Current Period Calculation:');
    $now = now();
    $currentPeriod = Evaluation::calculatePeriod($now);
    $periodLabel = $currentPeriod === 1 ? 'Jan-Jun' : 'Jul-Dec';
    $this->line("   - Current Month: {$now->format('F')}");
    $this->line("   - Current Period: {$currentPeriod} ({$periodLabel})");
    $this->line("   - Current Year: {$now->year}");
    $this->newLine();

    // Test 3: Check evaluations by period
    $this->info('3. Evaluations by Period:');
    $evaluations = Evaluation::with('employee')->get();
    $period1Count = $evaluations->where('period', 1)->count();
    $period2Count = $evaluations->where('period', 2)->count();
    $this->line("   - Period 1 (Jan-Jun): {$period1Count} evaluations");
    $this->line("   - Period 2 (Jul-Dec): {$period2Count} evaluations");
    $this->newLine();

    // Test 4: Test evaluation eligibility
    $this->info('4. Employee Evaluation Eligibility:');
    $employees = Employee::take(3)->get();
    foreach ($employees as $employee) {
      $canEvaluate = Evaluation::canEvaluateEmployee($employee->id, $employee->department);
      $frequency = $employee->department 
        ? EvaluationConfiguration::getFrequencyForDepartment($employee->department)
        : 'annual';
      $this->line("   - {$employee->employee_name} ({$employee->department}): " .
        ($canEvaluate ? 'CAN evaluate' : 'CANNOT evaluate') .
        " (Frequency: {$frequency})");
    }
    $this->newLine();

    $this->info('Evaluation system test completed!');

    return Command::SUCCESS;
  }
}
