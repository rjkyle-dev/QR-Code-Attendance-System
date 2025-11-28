<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\SupervisorDepartment;
use App\Models\User;
use Illuminate\Console\Command;

class DebugSupervisorIssue extends Command
{
  protected $signature = 'debug:supervisor-issue';
  protected $description = 'Debug supervisor department assignment issue';

  public function handle()
  {
    $this->info('=== Debugging Supervisor Department Issue ===');

    // Check all departments
    $this->info('Available Departments:');
    $departments = Employee::distinct()->pluck('department');
    foreach ($departments as $dept) {
      $this->line("- $dept");
    }

    // Check supervisor assignments
    $this->info('\nSupervisor Assignments:');
    $assignments = SupervisorDepartment::with('user')->get();
    foreach ($assignments as $assignment) {
      $status = $assignment->can_evaluate ? 'CAN EVALUATE' : 'CANNOT EVALUATE';
      $this->line("- {$assignment->user->firstname} {$assignment->user->lastname} -> {$assignment->department} ($status)");
    }

    // Check employees by department
    $this->info('\nEmployees by Department:');
    $employees = Employee::select('department', 'employee_name')->orderBy('department')->get();
    $grouped = $employees->groupBy('department');
    foreach ($grouped as $dept => $emps) {
      $this->line("- $dept: " . $emps->count() . " employees");
      foreach ($emps as $emp) {
        $this->line("  * {$emp->employee_name}");
      }
    }

    // Check specific supervisor (assuming utility supervisor)
    $this->info('\nChecking Utility Supervisor:');
    $utilitySupervisor = User::whereHas('supervisedDepartments', function ($q) {
      $q->where('department', 'Utility');
    })->first();

    if ($utilitySupervisor) {
      $this->info("Found Utility Supervisor: {$utilitySupervisor->firstname} {$utilitySupervisor->lastname}");
      $evaluableDepts = $utilitySupervisor->getEvaluableDepartments();
      $this->info("Evaluable departments: " . implode(', ', $evaluableDepts));

      // Check if they can evaluate
      $canEvaluate = $utilitySupervisor->canEvaluate();
      $this->info("Can evaluate: " . ($canEvaluate ? 'YES' : 'NO'));

      // Check employees they should see
      $employees = Employee::whereIn('department', $evaluableDepts)->get();
      $this->info("Employees they should see: " . $employees->count());
      foreach ($employees as $emp) {
        $this->line("  * {$emp->employee_name} ({$emp->department})");
      }
    } else {
      $this->error("No supervisor assigned to Utility department!");
    }
  }
}
