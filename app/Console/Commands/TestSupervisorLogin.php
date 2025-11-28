<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Auth;

class TestSupervisorLogin extends Command
{
  protected $signature = 'test:supervisor-login {email}';
  protected $description = 'Test supervisor login and evaluation access';

  public function handle()
  {
    $email = $this->argument('email');

    $this->info("Testing supervisor login for: $email");

    // Find the user
    $user = User::where('email', $email)->first();

    if (!$user) {
      $this->error("User not found with email: $email");
      return;
    }

    $this->info("Found user: {$user->firstname} {$user->lastname}");
    $this->info("Roles: " . $user->roles->pluck('name')->implode(', '));

    // Check supervisor status
    $isSupervisor = $user->isSupervisor();
    $isSuperAdmin = $user->isSuperAdmin();
    $canEvaluate = $user->canEvaluate();
    $evaluableDepartments = $user->getEvaluableDepartments();

    $this->info("Is Supervisor: " . ($isSupervisor ? 'YES' : 'NO'));
    $this->info("Is Super Admin: " . ($isSuperAdmin ? 'YES' : 'NO'));
    $this->info("Can Evaluate: " . ($canEvaluate ? 'YES' : 'NO'));
    $this->info("Evaluable Departments: " . implode(', ', $evaluableDepartments));

    // Check supervised departments
    $supervisedDepts = $user->supervisedDepartments;
    $this->info("Supervised Departments:");
    foreach ($supervisedDepts as $dept) {
      $status = $dept->can_evaluate ? 'CAN EVALUATE' : 'CANNOT EVALUATE';
      $this->line("  - {$dept->department} ($status)");
    }

    // Check employees they should see
    if (!empty($evaluableDepartments)) {
      $employees = Employee::whereIn('department', $evaluableDepartments)->get();
      $this->info("Employees they should see: " . $employees->count());
      foreach ($employees as $emp) {
        $this->line("  - {$emp->employee_name} ({$emp->department})");
      }
    } else {
      $this->warn("No evaluable departments assigned!");
    }
  }
}
