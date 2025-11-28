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
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $isSupervisor = $user->isSupervisor();
        $isSuperAdmin = $user->isSuperAdmin();

        // Get evaluable departments based on user role
        // HR and Manager see all departments, Admin and Supervisor see only assigned
        $supervisedDepartments = $this->getEvaluableDepartmentsForUser($user);

        // Base query for employees based on user role
        $employeeQuery = Employee::query();
        $isHR = $user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists();
        $isManager = $user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists();

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }

        // Base query for leaves based on user role
        $leaveQuery = Leave::query();
        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $leaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }

        // Total unique employees
        $totalEmployee = $employeeQuery->distinct('employeeid')->count('employeeid');

        // Total unique departments
        if ($isSuperAdmin || $isHR || $isManager) {
            $totalDepartment = Employee::distinct('department')->count('department');
        } else {
            $totalDepartment = count($supervisedDepartments);
        }

        // Total leave requests
        $totalLeave = $leaveQuery->count();

        // Pending leave requests
        $pendingLeave = $leaveQuery->where('leave_status', 'Pending')->count();

        // Previous period (previous month)
        $prevMonthStart = now()->subMonth()->startOfMonth();
        $prevMonthEnd = now()->subMonth()->endOfMonth();

        // Employees created before this month (as a proxy for previous total)
        $prevEmployeeQuery = Employee::where('created_at', '<', now()->startOfMonth());
        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $prevEmployeeQuery->whereIn('department', $supervisedDepartments);
        }
        $prevTotalEmployee = $prevEmployeeQuery->distinct('employeeid')->count('employeeid');

        // Departments created before this month (as a proxy for previous total)
        if ($isSuperAdmin || $isHR || $isManager) {
            $prevTotalDepartment = Employee::where('created_at', '<', now()->startOfMonth())->distinct('department')->count('department');
        } else {
            $prevTotalDepartment = count($supervisedDepartments);
        }

        // Leaves created in previous month
        $prevLeaveQuery = Leave::whereBetween('created_at', [$prevMonthStart, $prevMonthEnd]);
        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $prevLeaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }
        $prevTotalLeave = $prevLeaveQuery->count();

        // Pending leaves in previous month
        $prevPendingLeaveQuery = Leave::where('leave_status', 'Pending')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd]);
        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $prevPendingLeaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }
        $prevPendingLeave = $prevPendingLeaveQuery->count();

        // --- New code for chart ---
        // Get leave counts per month (all years, all types), but only for the last N months
        $monthsToShow = (int) request('months', 6); // Get from query, default to 6
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
        // --- End new code for chart ---

        // --- New code for 6-month period chart ---
        // Get leave counts for Jan-Jun and Jul-Dec
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
        // --- End new code for 6-month period chart ---

        // Fetch user-specific notifications (latest 10)
        $notifications = collect();
        $unreadCount = 0;

        if ($isSuperAdmin) {
            // Super admin sees all notifications
            $notifications = Notification::orderBy('created_at', 'desc')->take(10)->get();
            $unreadCount = Notification::whereNull('read_at')->count();
        } else {
            // Supervisors and other users see only their own notifications
            $notifications = Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();
            $unreadCount = Notification::where('user_id', $user->id)
                ->whereNull('read_at')
                ->count();
        }

        // Get user role information
        $userRole = $user->roles->first()?->name ?? 'User';
        // Use supervisedDepartments for Admin and Supervisor (HR/Manager see all, so empty means all)
        $userDepartments = (!$isSuperAdmin && !$isHR && !$isManager) ? $supervisedDepartments : [];

        // Get employees eligible for monthly recognition (good attendance, no absences, no leaves)
        $monthlyRecognitionEmployees = $this->getMonthlyRecognitionEmployees($supervisedDepartments, $isSupervisor || $user->adminAssignments()->exists());

        // Get employees for supervisor/admin dashboard
        $supervisorEmployees = collect();
        if ((!$isSuperAdmin && !$isHR && !$isManager) && !empty($supervisedDepartments)) {
            $supervisorEmployees = Employee::whereIn('department', $supervisedDepartments)
                ->select('id', 'employee_name', 'department', 'position', 'picture', 'employeeid')
                ->orderBy('employee_name')
                ->take(5) // Show top 5 employees
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

        // Get monthly absence statistics for the chart
        $monthlyAbsenceStats = $this->getMonthlyAbsenceStats($userDepartments);

        // Get monthly leave statistics for the chart
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
            'leavesPerMonth' => $chartData, // For monthly chart data
            'leavesPerPeriod' => $leavesPerPeriod, // For 6-month period chart data
            'months' => $monthsToShow, // Pass selected months to frontend
            'monthlyAbsenceStats' => $monthlyAbsenceStats, // Add absence statistics
            'monthlyLeaveStats' => $monthlyLeaveStats, // Add leave statistics
            // Add notifications for admin bell
            'notifications' => $notifications,
            'unreadNotificationCount' => $unreadCount,
            // Add user role information
            'userRole' => $userRole,
            'isSupervisor' => $isSupervisor,
            'isSuperAdmin' => $isSuperAdmin,
            'supervisedDepartments' => $userDepartments,
            // Add supervisor employees data
            'supervisorEmployees' => $supervisorEmployees,
            // Add monthly recognition employees data
            'monthlyRecognitionEmployees' => $monthlyRecognitionEmployees,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Get monthly absence statistics for chart display.
     */
    private function getMonthlyAbsenceStats($supervisedDepartments = [])
    {
        // Base query for absences
        $absenceQuery = \App\Models\Absence::query();

        // Filter by supervised departments if supervisor
        if (!empty($supervisedDepartments)) {
            $absenceQuery->whereIn('department', $supervisedDepartments);
        }

        // Get absences from the last 12 months
        $startDate = now()->subMonths(11)->startOfMonth();
        $endDate = now()->endOfMonth();

        $absences = $absenceQuery
            ->whereBetween('from_date', [$startDate, $endDate])
            ->where('status', 'approved')
            ->get();

        // Get total employee count for percentage calculations
        $employeeQuery = Employee::query();
        if (!empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }
        $totalEmployees = $employeeQuery->count();

        // Group absences by month
        $monthlyData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthName = $date->format('F');
            $year = $date->year;

            // Count absences for this month
            $monthAbsences = $absences->filter(function ($absence) use ($date) {
                return $absence->from_date->format('Y-m') === $date->format('Y-m');
            })->count();

            // Calculate percentage
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

    /**
     * Get monthly leave statistics for chart display.
     */
    private function getMonthlyLeaveStats($supervisedDepartments = [])
    {
        // Base query for leaves
        $leaveQuery = Leave::query();

        // Filter by supervised departments if supervisor
        if (!empty($supervisedDepartments)) {
            $leaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }

        // Get leaves from the last 12 months
        $startDate = now()->subMonths(11)->startOfMonth();
        $endDate = now()->endOfMonth();

        $leaves = $leaveQuery
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('leave_status', 'Approved')
            ->get();

        // Get total employee count for percentage calculations
        $employeeQuery = Employee::query();
        if (!empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }
        $totalEmployees = $employeeQuery->count();

        // Group leaves by month
        $monthlyData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthName = $date->format('F');
            $year = $date->year;

            // Count leaves for this month
            $monthLeaves = $leaves->filter(function ($leave) use ($date) {
                return $leave->created_at->format('Y-m') === $date->format('Y-m');
            })->count();

            // Calculate percentage
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

    /**
     * Get initials from employee name
     */
    private function getInitials(string $name): string
    {
        $words = explode(' ', trim($name));
        $initials = '';

        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper(substr($word, 0, 1));
            }
        }

        return substr($initials, 0, 2); // Return max 2 initials
    }

    /**
     * Get employees eligible for monthly recognition based on evaluation ratings
     */
    private function getMonthlyRecognitionEmployees($supervisedDepartments = [], $isSupervisor = false)
    {
        $currentYear = now()->year;
        $currentPeriod = Evaluation::calculatePeriod(now());

        // Base query for employees
        $employeeQuery = Employee::query();

        // Filter by supervised departments if supervisor
        if ($isSupervisor && !empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }

        $employees = $employeeQuery->get();

        $recognitionEmployees = [];

        foreach ($employees as $employee) {
            // Get the latest evaluation for this employee
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

            if ($latestEvaluation) {
                $totalRating = (float) ($latestEvaluation->total_rating ?? 0);

                // Employee is eligible for recognition if they have a high evaluation rating (8.0 or above)
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

        // Sort by recognition score (highest first) and take top 5
        usort($recognitionEmployees, function ($a, $b) {
            return $b['recognition_score'] - $a['recognition_score'];
        });

        return array_slice($recognitionEmployees, 0, 5);
    }

    /**
     * Calculate recognition score for ranking employees based on evaluation rating
     */
    private function calculateRecognitionScore($evaluationRating)
    {
        // Ensure evaluation rating is a float
        $rating = (float) ($evaluationRating ?? 0);

        // Base score is the evaluation rating (1-10 scale)
        $score = $rating;

        // Bonus for excellent performance (9.0+)
        if ($rating >= 9.0) {
            $score += 2;
        }

        // Bonus for very good performance (8.5+)
        elseif ($rating >= 8.5) {
            $score += 1;
        }

        return (float) $score;
    }

    /**
     * Get total work days in a month (excluding weekends)
     */
    private function getTotalWorkDays($date)
    {
        $start = $date->copy()->startOfMonth();
        $end = $date->copy()->endOfMonth();

        $workDays = 0;
        $current = $start->copy();

        while ($current <= $end) {
            // Skip weekends (Saturday = 6, Sunday = 0)
            if ($current->dayOfWeek !== 0 && $current->dayOfWeek !== 6) {
                $workDays++;
            }
            $current->addDay();
        }

        return $workDays;
    }
}
