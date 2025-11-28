<?php

namespace App\Traits;

use App\Models\Employee;
use Illuminate\Support\Collection;

trait EmployeeFilterTrait
{
  /**
   * Get employees based on user role and permissions
   * - Super Admin: All employees
   * - HR Personnel: All employees (no filtering)
   * - Manager: All employees (no filtering)
   * - Admin: Only employees from assigned departments
   * - Supervisor: Only employees from assigned departments
   */
  protected function getFilteredEmployees($user, $baseQuery = null): Collection
  {
    // Default base query if not provided
    if (!$baseQuery) {
      $baseQuery = Employee::query();
    }

    // Super Admin can see all employees
    if ($user->isSuperAdmin()) {
      return $baseQuery->orderBy('employee_name')->get();
    }

    // HR Personnel can see all employees from all departments (no filtering by assignment)
    if ($user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists()) {
      return $baseQuery->orderBy('employee_name')->get();
    }

    // Manager can see all employees from all departments (no filtering by assignment)
    if ($user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists()) {
      return $baseQuery->orderBy('employee_name')->get();
    }

    // Get all evaluable departments for the user (from Supervisor or Admin assignments)
    $evaluableDepartments = $user->getEvaluableDepartments();

    if (empty($evaluableDepartments)) {
      return collect(); // No departments assigned
    }

    // Filter by assigned departments (for Supervisor and Admin)
    return $baseQuery->whereIn('department', $evaluableDepartments)
      ->orderBy('employee_name')
      ->get();
  }

  /**
   * Get evaluable departments for the user
   * Used for filtering in various queries
   */
  protected function getEvaluableDepartmentsForUser($user): array
  {
    // Super Admin can see all departments
    if ($user->isSuperAdmin()) {
      return Employee::distinct()->pluck('department')->toArray();
    }

    // HR Personnel can see all departments (no filtering by assignment)
    if ($user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists()) {
      return Employee::distinct()->pluck('department')->toArray();
    }

    // Manager can see all departments (no filtering by assignment)
    if ($user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists()) {
      return Employee::distinct()->pluck('department')->toArray();
    }

    // Get evaluable departments for Supervisor or Admin
    return $user->getEvaluableDepartments();
  }
}
