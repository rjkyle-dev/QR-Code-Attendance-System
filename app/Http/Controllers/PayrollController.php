<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use App\Models\Payroll;
use App\Traits\EmployeeFilterTrait;
use App\Services\PayrollCalculationService;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PayrollController extends Controller
{
  use EmployeeFilterTrait;

  public function index(): Response
  {
    $user = Auth::user();
    $isSupervisor = $user->isSupervisor();
    $isSuperAdmin = $user->isSuperAdmin();

    $supervisedDepartments = $this->getEvaluableDepartmentsForUser($user);

    $employeeQuery = Employee::query();

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

    $totalEmployee = $employees->count();
    $totalDepartment = $isSupervisor && !empty($supervisedDepartments)
      ? count($supervisedDepartments)
      : Employee::distinct('department')->count();

    $workStatusCounts = [
      'Regular' => $employees->where('work_status', 'Regular')->count(),
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

  public function generate(Request $request)
  {
    $request->validate([
      'month' => 'required|date',
      'cutoff' => 'required|in:1st,2nd,3rd',
      'employee_id' => 'nullable|exists:employees,id',
    ]);

    $month = Carbon::parse($request->month);
    $cutoff = $request->cutoff;
    $employeeId = $request->employee_id;

    // Determine period dates based on cutoff
    [$periodStart, $periodEnd] = $this->getPeriodDates($month, $cutoff);

    $service = new PayrollCalculationService();
    $employees = $employeeId 
      ? [Employee::findOrFail($employeeId)]
      : Employee::all();

    $payrolls = [];
    foreach ($employees as $employee) {
      try {
        $payroll = $service->calculatePayroll($employee, $periodStart, $periodEnd, $cutoff);
        $payrolls[] = $this->transformPayroll($payroll);
      } catch (\Exception $e) {
        Log::error("Payroll calculation failed for employee {$employee->id}: " . $e->getMessage());
      }
    }

    return Inertia::render('payroll/payslip-list', [
      'payrolls' => $payrolls,
      'period_start' => $periodStart->format('Y-m-d'),
      'period_end' => $periodEnd->format('Y-m-d'),
      'cutoff' => $cutoff,
    ]);
  }

  public function show($id)
  {
    $payroll = Payroll::with(['employee', 'earnings', 'deductions', 'details', 'attendanceDeductions'])
      ->findOrFail($id);

    return Inertia::render('payroll/payslip', [
      'payroll' => $this->transformPayroll($payroll),
    ]);
  }

  private function getPeriodDates(Carbon $month, string $cutoff): array
  {
    $year = $month->year;
    $monthNum = $month->month;

    switch ($cutoff) {
      case '1st':
        return [
          Carbon::create($year, $monthNum, 1),
          Carbon::create($year, $monthNum, 15),
        ];
      case '2nd':
        return [
          Carbon::create($year, $monthNum, 16),
          Carbon::create($year, $monthNum, 25),
        ];
      case '3rd':
        return [
          Carbon::create($year, $monthNum, 26),
          Carbon::create($year, $monthNum)->endOfMonth(),
        ];
      default:
        throw new \InvalidArgumentException("Invalid cutoff: {$cutoff}");
    }
  }

  private function transformPayroll($payroll)
  {
    return [
      'id' => $payroll->id,
      'employee' => [
        'employee_name' => $payroll->employee->employee_name,
        'employeeid' => $payroll->employee->employeeid,
        'department' => $payroll->employee->department,
        'position' => $payroll->employee->position,
      ],
      'payroll_date' => $payroll->payroll_date->format('Y-m-d'),
      'cutoff_period' => $payroll->cutoff_period,
      'period_start' => $payroll->period_start->format('Y-m-d'),
      'period_end' => $payroll->period_end->format('Y-m-d'),
      'gross_pay' => (float) $payroll->gross_pay,
      'total_deductions' => (float) $payroll->total_deductions,
      'net_pay' => (float) $payroll->net_pay,
      'status' => $payroll->status,
      'earnings' => $payroll->earnings->map(function ($earning) {
        return [
          'type' => $earning->type,
          'amount' => (float) $earning->amount,
          'quantity' => $earning->quantity ? (float) $earning->quantity : null,
        ];
      })->toArray(),
      'deductions' => $payroll->deductions->map(function ($deduction) {
        return [
          'type' => $deduction->type,
          'amount' => (float) $deduction->amount,
        ];
      })->toArray(),
      'details' => $payroll->details->map(function ($detail) {
        return [
          'type' => $detail->type,
          'hours' => (float) $detail->hours,
          'rate' => (float) $detail->rate,
          'amount' => (float) $detail->amount,
        ];
      })->toArray(),
      'attendance_deductions' => $payroll->attendanceDeductions ? [
        'absent_days' => (float) $payroll->attendanceDeductions->absent_days,
        'late_hours' => (float) $payroll->attendanceDeductions->late_hours,
        'undertime_hours' => (float) $payroll->attendanceDeductions->undertime_hours,
        'absent_deduction' => (float) $payroll->attendanceDeductions->absent_deduction,
        'late_deduction' => (float) $payroll->attendanceDeductions->late_deduction,
        'undertime_deduction' => (float) $payroll->attendanceDeductions->undertime_deduction,
      ] : null,
    ];
  }
}
