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
use App\Http\Controllers\Api\DailyCheckingController;
use App\Http\Controllers\Api\QrCodeController;
use App\Http\Controllers\Api\QrAttendanceController;
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
Route::get('/departments/all', [\App\Http\Controllers\DepartmentController::class, 'getAll']);
Route::get('/positions/all', [\App\Http\Controllers\PositionController::class, 'getAll']);
Route::get('/positions/by-department', [\App\Http\Controllers\PositionController::class, 'getByDepartment']);
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

// QR Code API - Employee authentication required (via session)
Route::middleware(['web', 'employee.auth'])->group(function () {
    Route::get('/qr-code/generate', [QrCodeController::class, 'generate']);
});

// QR Code API - Admin can generate for any employee
Route::middleware(['web', 'auth'])->group(function () {
    Route::post('/qr-code/generate-for-employee', [QrCodeController::class, 'generateForEmployee']);
});

// QR Code Attendance API - Public (no auth required for scanning)
Route::post('/qr-attendance/scan', [QrAttendanceController::class, 'scan']);
Route::post('/qr-attendance/record-by-employeeid', [QrAttendanceController::class, 'recordByEmployeeId']);
Route::get('/qr-attendance/today', [QrAttendanceController::class, 'getTodayAttendance']);

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

