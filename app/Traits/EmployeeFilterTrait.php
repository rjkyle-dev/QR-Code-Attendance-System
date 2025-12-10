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

    // HR Personnel can see all employees from all departments
    if ($user->isHR() && $user->hrAssignments()->exists()) {
      return $baseQuery->orderBy('employee_name')->get();
    }

    // Manager can see all employees from all departments
    if ($user->isManager() && $user->managerAssignments()->exists()) {
      return $baseQuery->orderBy('employee_name')->get();
    }

    // Get departments from supervisor assignments
    $supervisorDepartments = $user->supervisedDepartments()
      ->pluck('department')
      ->toArray();

    // Get departments from admin assignments
    $adminDepartments = $user->adminAssignments()
      ->pluck('department')
      ->toArray();

    // Get departments from HR assignments (for non-HR users)
    if (!$user->isHR()) {
      $hrDepartments = $user->hrAssignments()
        ->pluck('department')
        ->toArray();
      $supervisorDepartments = array_merge($supervisorDepartments, $hrDepartments);
    }

    // Get departments from Manager assignments (for non-Manager users)
    if (!$user->isManager()) {
      $managerDepartments = $user->managerAssignments()
        ->pluck('department')
        ->toArray();
      $supervisorDepartments = array_merge($supervisorDepartments, $managerDepartments);
    }

    $allDepartments = array_unique(array_merge($supervisorDepartments, $adminDepartments));

    if (empty($allDepartments)) {
      return collect(); // No departments assigned
    }

    // Filter by assigned departments (for Supervisor and Admin)
    return $baseQuery->whereIn('department', $allDepartments)
      ->orderBy('employee_name')
      ->get();
  }

  /**
   * Get departments for the user based on their assignments
   * Used for filtering in various queries
   */
  protected function getEvaluableDepartmentsForUser($user): array
  {
    // Super Admin can see all departments
    if ($user->isSuperAdmin()) {
      return Employee::distinct()->pluck('department')->toArray();
    }

    // HR Personnel can see all departments
    if ($user->isHR() && $user->hrAssignments()->exists()) {
      return Employee::distinct()->pluck('department')->toArray();
    }

    // Manager can see all departments
    if ($user->isManager() && $user->managerAssignments()->exists()) {
      return Employee::distinct()->pluck('department')->toArray();
    }

    // Get departments from supervisor assignments
    $supervisorDepartments = $user->supervisedDepartments()
      ->pluck('department')
      ->toArray();

    // Get departments from admin assignments
    $adminDepartments = $user->adminAssignments()
      ->pluck('department')
      ->toArray();

    // Get departments from HR assignments (for non-HR users)
    if (!$user->isHR()) {
      $hrDepartments = $user->hrAssignments()
        ->pluck('department')
        ->toArray();
      $supervisorDepartments = array_merge($supervisorDepartments, $hrDepartments);
    }

    // Get departments from Manager assignments (for non-Manager users)
    if (!$user->isManager()) {
      $managerDepartments = $user->managerAssignments()
        ->pluck('department')
        ->toArray();
      $supervisorDepartments = array_merge($supervisorDepartments, $managerDepartments);
    }

    $allDepartments = array_unique(array_merge($supervisorDepartments, $adminDepartments));

    return $allDepartments;
  }
}
