<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use App\Traits\EmployeeFilterTrait;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class PayrollController extends Controller
{
  use EmployeeFilterTrait;

  /**
   * Display the payroll page.
   */
  public function index(): Response
  {
    $user = Auth::user();
    $isSupervisor = $user->isSupervisor();
    $isSuperAdmin = $user->isSuperAdmin();

    // Get evaluable departments based on user role
    $supervisedDepartments = $this->getEvaluableDepartmentsForUser($user);

    // Base query for employees
    $employeeQuery = Employee::query();

    // Filter employees based on user role
    $isHR = $user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists();
    $isManager = $user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists();

    if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
      $employeeQuery->whereIn('department', $supervisedDepartments);
    }

    $employees = $employeeQuery->orderBy('created_at', 'desc')->get();

    $transformedEmployees = $employees->map(function ($employee) {
      return [
        'id'            => $employee->id,
        'employee_name' => $employee->employee_name,
        'firstname'     => $employee->firstname,
        'middlename'    => $employee->middlename,
        'lastname'      => $employee->lastname,
        'employeeid'    => $employee->employeeid,
        'work_status'   => $employee->work_status,
        'service_tenure' => $employee->service_tenure,
        'department'    => $employee->department,
        'picture'       => $employee->picture,
        'date_of_birth' => $employee->date_of_birth,
        'gender'        => $employee->gender,
        'marital_status' => $employee->marital_status,
        'address'       => $employee->address,
        'city'          => $employee->city,
        'state'         => $employee->state,
        'country'       => $employee->country,
        'zip_code'      => $employee->zip_code,
        'phone'         => $employee->phone,
        'email'         => $employee->email,
        'position'      => $employee->position,
      ];
    });

    // Calculate totals based on filtered data
    $totalEmployee = $employees->count();
    $totalDepartment = $isSupervisor && !empty($supervisedDepartments)
      ? count($supervisedDepartments)
      : Employee::distinct('department')->count();

    // Calculate work status counts based on filtered data
    $workStatusCounts = [
      'Regular' => $employees->where('work_status', 'Regular')->count(),
      'Add Crew' => $employees->where('work_status', 'Add Crew')->count(),
      'Probationary' => $employees->where('work_status', 'Probationary')->count(),
    ];

    return Inertia::render('payroll/index', [
      'employee'        => $transformedEmployees,
      'totalEmployee'   => $totalEmployee,
      'totalDepartment' => $totalDepartment,
      'workStatusCounts' => $workStatusCounts,
      'user_permissions' => [
        'is_supervisor' => $isSupervisor,
        'is_super_admin' => $isSuperAdmin,
        'supervised_departments' => $supervisedDepartments,
      ],
      'departments'     => [
        'Administration',
        'Finance & Accounting',
        'Human Resources',
        'Quality Control',
        'Production',
        'Field Operations',
        'Logistics & Distribution',
        'Research & Development',
        'Sales & Marketing',
        'Maintenance',
        'Engineering',
      ],
      'positions'       => [
        'Admin Assistant',
        'Accountant',
        'HR Officer',
        'Quality Inspector',
        'Production Supervisor',
        'Field Worker',
        'Field Supervisor',
        'Logistics Coordinator',
        'R&D Specialist',
        'Sales Executive',
        'Maintenance Technician',
        'P&D',
      ],
    ]);
  }
}
