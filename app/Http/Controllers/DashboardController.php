<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use App\Models\Evaluation;
use App\Traits\EmployeeFilterTrait;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use App\Models\Leave;
use Illuminate\Support\Facades\DB;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    use EmployeeFilterTrait;
    public function index()
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

        $leaveQuery = Leave::query();
        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $leaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }

        $totalEmployee = $employeeQuery->distinct('employeeid')->count('employeeid');

        if ($isSuperAdmin || $isHR || $isManager) {
            $totalDepartment = Employee::distinct('department')->count('department');
        } else {
            $totalDepartment = count($supervisedDepartments);
        }

        $totalLeave = $leaveQuery->count();

        $pendingLeave = $leaveQuery->where('leave_status', 'Pending')->count();

        $prevMonthStart = now()->subMonth()->startOfMonth();
        $prevMonthEnd = now()->subMonth()->endOfMonth();

        $prevEmployeeQuery = Employee::where('created_at', '<', now()->startOfMonth());
        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $prevEmployeeQuery->whereIn('department', $supervisedDepartments);
        }
        $prevTotalEmployee = $prevEmployeeQuery->distinct('employeeid')->count('employeeid');

        if ($isSuperAdmin || $isHR || $isManager) {
            $prevTotalDepartment = Employee::where('created_at', '<', now()->startOfMonth())->distinct('department')->count('department');
        } else {
            $prevTotalDepartment = count($supervisedDepartments);
        }

        $prevLeaveQuery = Leave::whereBetween('created_at', [$prevMonthStart, $prevMonthEnd]);
        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $prevLeaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }
        $prevTotalLeave = $prevLeaveQuery->count();

        $prevPendingLeaveQuery = Leave::where('leave_status', 'Pending')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd]);
        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $prevPendingLeaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }
        $prevPendingLeave = $prevPendingLeaveQuery->count();

        $monthsToShow = (int) request('months', 6);
        $now = now();
        $startDate = $now->copy()->subMonths($monthsToShow - 1)->startOfMonth();
        $endDate = $now->copy()->endOfMonth();

        $leavesPerMonthQuery = Leave::select(
            DB::raw('YEAR(leave_start_date) as year'),
            DB::raw('MONTH(leave_start_date) as month'),
            DB::raw('COUNT(*) as count')
        )
            ->whereBetween('leave_start_date', [$startDate, $endDate]);

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $leavesPerMonthQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }

        $leavesPerMonth = $leavesPerMonthQuery
            ->groupBy(DB::raw('YEAR(leave_start_date)'), DB::raw('MONTH(leave_start_date)'))
            ->orderBy(DB::raw('YEAR(leave_start_date)'))
            ->orderBy(DB::raw('MONTH(leave_start_date)'))
            ->get();

        $chartData = [];
        for ($i = 0; $i < $monthsToShow; $i++) {
            $date = $startDate->copy()->addMonths($i);
            $year = $date->year;
            $monthNum = $date->month;
            $monthName = $date->format('F');
            $count = 0;
            foreach ($leavesPerMonth as $leave) {
                if ($leave->year == $year && $leave->month == $monthNum) {
                    $count = $leave->count;
                    break;
                }
            }
            $chartData[] = ['month' => $monthName, 'count' => $count];
        }

        $leavesPerPeriodQuery1 = Leave::whereRaw('MONTH(leave_start_date) BETWEEN 1 AND 6');
        $leavesPerPeriodQuery2 = Leave::whereRaw('MONTH(leave_start_date) BETWEEN 7 AND 12');

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $leavesPerPeriodQuery1->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
            $leavesPerPeriodQuery2->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }

        $leavesPerPeriod = [
            [
                'period' => 'January to June',
                'count' => $leavesPerPeriodQuery1->count(),
            ],
            [
                'period' => 'July to December',
                'count' => $leavesPerPeriodQuery2->count(),
            ],
        ];

        $notifications = collect();
        $unreadCount = 0;

        if ($isSuperAdmin) {
            $notifications = Notification::orderBy('created_at', 'desc')->take(10)->get();
            $unreadCount = Notification::whereNull('read_at')->count();
        } else {
            $notifications = Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();
            $unreadCount = Notification::where('user_id', $user->id)
                ->whereNull('read_at')
                ->count();
        }

        $userRole = $user->roles->first()?->name ?? 'User';
        $userDepartments = (!$isSuperAdmin && !$isHR && !$isManager) ? $supervisedDepartments : [];

        $monthlyRecognitionEmployees = $this->getMonthlyRecognitionEmployees($supervisedDepartments, $isSupervisor || $user->adminAssignments()->exists());

        $supervisorEmployees = collect();
        if ((!$isSuperAdmin && !$isHR && !$isManager) && !empty($supervisedDepartments)) {
            $supervisorEmployees = Employee::whereIn('department', $supervisedDepartments)
                ->select('id', 'employee_name', 'department', 'position', 'picture', 'employeeid')
                ->orderBy('employee_name')
                ->take(5)
                ->get()
                ->map(function ($employee) {
                    return [
                        'id' => $employee->id,
                        'name' => $employee->employee_name,
                        'department' => $employee->department,
                        'position' => $employee->position,
                        'picture' => $employee->picture,
                        'employeeid' => $employee->employeeid,
                        'initials' => $this->getInitials($employee->employee_name),
                    ];
                });
        }

        $monthlyAbsenceStats = $this->getMonthlyAbsenceStats($userDepartments);

        $monthlyLeaveStats = $this->getMonthlyLeaveStats($userDepartments);

        return Inertia::render('dashboard/index', [
            'totalEmployee' => $totalEmployee,
            'prevTotalEmployee' => $prevTotalEmployee,
            'totalDepartment' => $totalDepartment,
            'prevTotalDepartment' => $prevTotalDepartment,
            'totalLeave' => $totalLeave,
            'prevTotalLeave' => $prevTotalLeave,
            'pendingLeave' => $pendingLeave,
            'prevPendingLeave' => $prevPendingLeave,
            'leavesPerMonth' => $chartData,
            'leavesPerPeriod' => $leavesPerPeriod,
            'months' => $monthsToShow,
            'monthlyAbsenceStats' => $monthlyAbsenceStats,
            'monthlyLeaveStats' => $monthlyLeaveStats,
            'notifications' => $notifications,
            'unreadNotificationCount' => $unreadCount,
            'userRole' => $userRole,
            'isSupervisor' => $isSupervisor,
            'isSuperAdmin' => $isSuperAdmin,
            'supervisedDepartments' => $userDepartments,
            'supervisorEmployees' => $supervisorEmployees,
            'monthlyRecognitionEmployees' => $monthlyRecognitionEmployees,
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        //
    }

    private function getMonthlyAbsenceStats($supervisedDepartments = [])
    {
        $absenceQuery = \App\Models\Absence::query();

        if (!empty($supervisedDepartments)) {
            $absenceQuery->whereIn('department', $supervisedDepartments);
        }

        $startDate = now()->subMonths(11)->startOfMonth();
        $endDate = now()->endOfMonth();

        $absences = $absenceQuery
            ->whereBetween('from_date', [$startDate, $endDate])
            ->where('status', 'approved')
            ->get();

        $employeeQuery = Employee::query();
        if (!empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }
        $totalEmployees = $employeeQuery->count();

        $monthlyData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthName = $date->format('F');
            $year = $date->year;

            $monthAbsences = $absences->filter(function ($absence) use ($date) {
                return $absence->from_date->format('Y-m') === $date->format('Y-m');
            })->count();

            $percentage = $totalEmployees > 0 ? round(($monthAbsences / $totalEmployees) * 100, 1) : 0;

            $monthlyData[] = [
                'month' => $monthName,
                'year' => $year,
                'absences' => $monthAbsences,
                'percentage' => $percentage,
                'date' => $date->toDateString(),
            ];
        }

        return $monthlyData;
    }

    private function getMonthlyLeaveStats($supervisedDepartments = [])
    {
        $leaveQuery = Leave::query();

        if (!empty($supervisedDepartments)) {
            $leaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }

        $startDate = now()->subMonths(11)->startOfMonth();
        $endDate = now()->endOfMonth();

        $leaves = $leaveQuery
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('leave_status', 'Approved')
            ->get();

        $employeeQuery = Employee::query();
        if (!empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }
        $totalEmployees = $employeeQuery->count();

        $monthlyData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthName = $date->format('F');
            $year = $date->year;

            $monthLeaves = $leaves->filter(function ($leave) use ($date) {
                return $leave->created_at->format('Y-m') === $date->format('Y-m');
            })->count();

            $percentage = $totalEmployees > 0 ? round(($monthLeaves / $totalEmployees) * 100, 1) : 0;

            $monthlyData[] = [
                'month' => $monthName,
                'year' => $year,
                'leaves' => $monthLeaves,
                'percentage' => $percentage,
                'date' => $date->toDateString(),
            ];
        }

        return $monthlyData;
    }

    private function getInitials(string $name): string
    {
        $words = explode(' ', trim($name));
        $initials = '';

        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper(substr($word, 0, 1));
            }
        }

        return substr($initials, 0, 2);
    }

    private function getMonthlyRecognitionEmployees($supervisedDepartments = [], $isSupervisor = false)
    {
        $currentYear = now()->year;
        $currentPeriod = Evaluation::calculatePeriod(now());

        $employeeQuery = Employee::query();

        if ($isSupervisor && !empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }

        $employees = $employeeQuery->get();

        $recognitionEmployees = [];

        foreach ($employees as $employee) {
            $latestEvaluation = Evaluation::where('employee_id', $employee->id)
                ->where('evaluation_year', $currentYear)
                ->where('evaluation_period', $currentPeriod)
                ->first();

            if (!$latestEvaluation) {
                $latestEvaluation = Evaluation::where('employee_id', $employee->id)
                    ->orderBy('evaluation_year', 'desc')
                    ->orderBy('evaluation_period', 'desc')
                    ->first();
            }

            if ($latestEvaluation) {
                $totalRating = (float) ($latestEvaluation->total_rating ?? 0);

                if ($totalRating >= 8.0) {
                    $recognitionScore = (float) $this->calculateRecognitionScore($totalRating);
                    $recognitionEmployees[] = [
                        'id' => $employee->id,
                        'name' => $employee->employee_name,
                        'department' => $employee->department,
                        'position' => $employee->position,
                        'picture' => $employee->picture,
                        'employeeid' => $employee->employeeid,
                        'initials' => $this->getInitials($employee->employee_name),
                        'evaluation_rating' => $totalRating,
                        'evaluation_date' => $latestEvaluation->rating_date,
                        'evaluation_period' => $latestEvaluation->period_label,
                        'evaluation_year' => $latestEvaluation->evaluation_year,
                        'recognition_score' => $recognitionScore,
                    ];
                }
            }
        }

        usort($recognitionEmployees, function ($a, $b) {
            return $b['recognition_score'] - $a['recognition_score'];
        });

        return array_slice($recognitionEmployees, 0, 5);
    }

    private function calculateRecognitionScore($evaluationRating)
    {
        $rating = (float) ($evaluationRating ?? 0);

        $score = $rating;

        if ($rating >= 9.0) {
            $score += 2;
        }

        elseif ($rating >= 8.5) {
            $score += 1;
        }

        return (float) $score;
    }

    private function getTotalWorkDays($date)
    {
        $start = $date->copy()->startOfMonth();
        $end = $date->copy()->endOfMonth();

        $workDays = 0;
        $current = $start->copy();

        while ($current <= $end) {
            if ($current->dayOfWeek !== 0 && $current->dayOfWeek !== 6) {
                $workDays++;
            }
            $current->addDay();
        }

        return $workDays;
    }
}
