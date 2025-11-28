<?php

use App\Models\Notification;
use App\Models\Employee;
use App\Models\Absence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FingerprintController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\Api\EmployeeController as ApiEmployeeController;
use App\Http\Controllers\Api\AttendanceController as ApiAttendanceController;
use App\Http\Controllers\Api\AttendanceSessionController;
use App\Http\Controllers\Api\EvaluationController as ApiEvaluationController;
use App\Http\Controllers\Api\DailyCheckingController;
use App\Http\Controllers\GenderDevelopmentReportController;
use Carbon\Carbon;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Mark notification as read (admin only)
Route::post('/notifications/{id}/read', function ($id) {
    $notification = Notification::findOrFail($id);
    $notification->read_at = now();
    $notification->save();
    return response()->json(['success' => true]);
});


Route::post('/fingerprint/store', [FingerprintController::class, 'store']);
Route::post('/fingerprint/verify', [FingerprintController::class, 'verify']);
// Remove or comment out the identification route
// Route::post('/fingerprint/identify', [FingerprintController::class, 'identify']);
Route::post('/employee/store', [EmployeeController::class, 'store']);
Route::get('/fingerprint/all', [FingerprintController::class, 'all']);
Route::get('/employee/all', [ApiEmployeeController::class, 'index']);
Route::get('/employees', [ApiEmployeeController::class, 'index']); // Alias for /employee/all
Route::get('/employees/packing-plant', function (Request $request) {
    $startDate = $request->query('start_date');
    $endDate = $request->query('end_date');

    // If date range is provided, return only employees with attendance in that range
    if ($startDate && $endDate) {
        $employeeIds = \App\Models\Attendance::whereBetween('attendance_date', [$startDate, $endDate])
            ->distinct()
            ->pluck('employee_id');

        // Include Packing Plant and Coop Area department employees AND Add Crew employees
        $employees = Employee::where(function ($query) {
            $query->where('department', 'Packing Plant')
                ->orWhere('department', 'Coop Area')
                ->orWhere('work_status', 'Add Crew');
        })
            ->whereIn('id', $employeeIds)
            ->select('id', 'employeeid', 'employee_name', 'firstname', 'middlename', 'lastname', 'department', 'position', 'work_status')
            ->orderBy('employee_name', 'asc')
            ->get();

        // Get attendance data for each employee
        $employeesWithAttendance = $employees->map(function ($employee) use ($startDate, $endDate) {
            $attendances = \App\Models\Attendance::where('employee_id', $employee->id)
                ->whereBetween('attendance_date', [$startDate, $endDate])
                ->get()
                ->mapWithKeys(function ($attendance) {
                    return [
                        $attendance->attendance_date->format('Y-m-d') => [
                            'time_in' => $attendance->time_in,
                            'time_out' => $attendance->time_out,
                        ]
                    ];
                });

            return [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'middlename' => $employee->middlename,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'work_status' => $employee->work_status,
                'attendances' => $attendances,
            ];
        });

        return response()->json($employeesWithAttendance);
    }

    // If no date range, return all Packing Plant and Coop Area employees AND Add Crew employees
    $employees = Employee::where(function ($query) {
        $query->where('department', 'Packing Plant')
            ->orWhere('department', 'Coop Area')
            ->orWhere('work_status', 'Add Crew');
    })
        ->select('id', 'employeeid', 'employee_name', 'firstname', 'middlename', 'lastname', 'department', 'position', 'work_status')
        ->orderBy('employee_name', 'asc')
        ->get();
    return response()->json($employees);
});
Route::get('/attendance/all', [ApiAttendanceController::class, 'index']);
Route::get('/evaluation/all', [ApiEvaluationController::class, 'index'])->middleware(['web', 'auth']);

// Attendance session time settings API
Route::get('/attendance-sessions', [AttendanceSessionController::class, 'index'])->name('attendance-sessions.index');
Route::post('/attendance-sessions', [AttendanceSessionController::class, 'store']);
Route::put('/attendance-sessions/{attendanceSession}', [AttendanceSessionController::class, 'update']);

// Daily Checking API
Route::post('/daily-checking/store', [DailyCheckingController::class, 'store']);
Route::get('/daily-checking/for-date', [DailyCheckingController::class, 'getForDate']);
Route::get('/daily-checking/by-microteam', [DailyCheckingController::class, 'getByMicroteam']);
Route::get('/daily-checking/locked-employees', [DailyCheckingController::class, 'getLockedEmployees']);
Route::get('/daily-checking/settings', [DailyCheckingController::class, 'getSettings']);
Route::post('/daily-checking/settings', [DailyCheckingController::class, 'saveSettings']);
Route::get('/daily-checking/hr', [DailyCheckingController::class, 'getHR']);
Route::get('/daily-checking/manager', [DailyCheckingController::class, 'getManager']);

// Gender Development Report API
Route::get('/gender-development/hr', [GenderDevelopmentReportController::class, 'getHR'])->middleware('web');
Route::get('/gender-development/manager', [GenderDevelopmentReportController::class, 'getManager'])->middleware('web');
Route::post('/gender-development/store', [GenderDevelopmentReportController::class, 'store'])->middleware('web');

Route::get('/employee/by-employeeid', function (Request $request) {
    $employeeid = $request->query('employeeid');
    $employee = Employee::where('employeeid', $employeeid)->first();
    if ($employee) {
        return response()->json($employee);
    }
    return response()->json(null, 404);
});

Route::get('/attendance/test', function () {
    $data = \App\Models\Attendance::select('attendance_date', 'attendance_status')
        ->limit(10)
        ->get()
        ->map(function ($item) {
            return [
                'attendanceDate' => $item->attendance_date,
                'attendanceStatus' => $item->attendance_status,
            ];
        });

    return response()->json([
        'count' => \App\Models\Attendance::count(),
        'sample_data' => $data
    ]);
});

// Employee attendance API for evaluation system
Route::get('/employee-attendance/{employeeId}', function ($employeeId, Request $request) {
    $startDate = $request->query('start_date');
    $endDate = $request->query('end_date');

    if (!$startDate || !$endDate) {
        return response()->json([
            'success' => false,
            'message' => 'Start date and end date are required'
        ], 400);
    }

    try {
        // 1. Calculate Days Late from attendance table
        $attendanceRecords = \App\Models\Attendance::where('employee_id', $employeeId)
            ->whereBetween('attendance_date', [$startDate, $endDate])
            ->get();

        $daysLate = 0;
        foreach ($attendanceRecords as $record) {
            $status = strtolower($record->attendance_status);
            if ($status === 'late' || $status === 'l') {
                $daysLate++;
            }
        }

        // 2. Calculate Days Absent from absences table
        // Only count absences where both supervisor and HR have approved
        $approvedAbsences = Absence::where('employee_id', $employeeId)
            ->where('supervisor_status', 'approved')
            ->where('hr_status', 'approved')
            ->where(function ($query) use ($startDate, $endDate) {
                // Absence overlaps with the evaluation period
                // Absence starts before or during the period AND ends after or during the period
                $query->where(function ($q) use ($startDate, $endDate) {
                    // Case 1: Absence starts before period, ends during or after period
                    $q->where('from_date', '<=', $endDate)
                        ->where('to_date', '>=', $startDate);
                });
            })
            ->get();

        $daysAbsent = 0;
        $periodStart = Carbon::parse($startDate);
        $periodEnd = Carbon::parse($endDate);

        foreach ($approvedAbsences as $absence) {
            // from_date and to_date are already Carbon instances due to model casting
            // Ensure they are Carbon instances for proper comparison
            $absenceStart = Carbon::parse($absence->from_date);
            $absenceEnd = Carbon::parse($absence->to_date);

            // Calculate the overlapping days between absence period and evaluation period
            $overlapStart = $absenceStart->gt($periodStart) ? $absenceStart : $periodStart;
            $overlapEnd = $absenceEnd->lt($periodEnd) ? $absenceEnd : $periodEnd;

            if ($overlapStart->lte($overlapEnd)) {
                // Calculate days in the overlap period
                $overlapDays = $overlapStart->diffInDays($overlapEnd) + 1;

                // If it's a partial day, count as 0.5 days, otherwise full day
                if ($absence->is_partial_day) {
                    $daysAbsent += 0.5;
                } else {
                    $daysAbsent += $overlapDays;
                }
            }
        }

        // Round to nearest integer for days absent (or keep as decimal if needed)
        $daysAbsent = (int) round($daysAbsent);

        // For debugging, also return the raw data
        $debugInfo = [
            'attendance_records' => $attendanceRecords->count(),
            'approved_absences' => $approvedAbsences->count(),
            'date_range' => [$startDate, $endDate],
            'sample_attendance' => $attendanceRecords->whereIn('attendance_status', ['Late', 'late', 'L'])->take(5)->map(function ($record) {
                return [
                    'date' => $record->attendance_date,
                    'status' => $record->attendance_status,
                ];
            }),
            'sample_absences' => $approvedAbsences->take(5)->map(function ($absence) {
                return [
                    'from_date' => $absence->from_date,
                    'to_date' => $absence->to_date,
                    'days' => $absence->days,
                    'is_partial_day' => $absence->is_partial_day,
                    'absence_type' => $absence->absence_type,
                ];
            })
        ];

        return response()->json([
            'success' => true,
            'attendance' => [
                'days_late' => $daysLate,
                'days_absent' => $daysAbsent,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ],
            'debug' => $debugInfo
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching attendance data: ' . $e->getMessage()
        ], 500);
    }
});
