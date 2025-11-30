<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceSessionController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\ServiceTenureController;
use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthEmployeeController;
use App\Http\Controllers\AbsentController;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AdminManagementController;
use App\Http\Controllers\SupervisorDepartmentController;
use App\Http\Controllers\ResumeToWorkController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Public attendance page (no authentication required) - MUST BE BEFORE auth routes
// This is a public route - no authentication needed
Route::get('/attendance', function () {
    return Inertia::render('public-attendance');
})->name('public.attendance');

// Employee routes are handled in employee_auth.php

Route::middleware(['auth', 'verified'])->group(function () {


    Route::get('request-form/leave', [LeaveController::class, 'index'])->name('request-form.index');

    Route::middleware(['permission:View Report|View Report Attendance|View Report Leave|View Report Performance|View Report Analytics'])->group(function () {
        Route::get('report', function () {
            return Inertia::render('report/index');
        })->name('report');
        Route::get('report/daily-attendance', function () {
            return Inertia::render('report/daily-attendance');
        })->name('report.daily-attendance');
        Route::get('report/daily-attendance/edit', function () {
            return Inertia::render('report/daily-attendance-edit');
        })->name('report.daily-attendance.edit');
        Route::get('report/coop-area-dtr', function () {
            return Inertia::render('report/coop-area-dtr');
        })->name('report.coop-area-dtr');
        Route::get('report/coop-harvester-maintenance', function () {
            return Inertia::render('report/coop-harvester-maintenance');
        })->name('report.coop-harvester-maintenance');
        Route::get('report/pest-disease-dtr', function () {
            return Inertia::render('report/pest-disease');
        })->name('report.pest-disease-dtr');
        Route::get('report/gender-development', function () {
            return Inertia::render('report/gender-development');
        })->name('report.gender-development');
        Route::get('report/employee-leave-list', [\App\Http\Controllers\LeaveController::class, 'approvedLeaves'])->name('report.employee-leave-list');
        Route::get('report/employee-absenteeism-report', [\App\Http\Controllers\AbsenceController::class, 'approvedAbsences'])->name('report.employee-absenteeism-report');

        // Department Evaluation Reports
        Route::get('report/management-staff-performance-summary', function () {
            return app(\App\Http\Controllers\EvaluationController::class)->departmentEvaluationsReport(request(), 'Management & Staff(Admin)');
        })->name('report.management-staff-performance-summary');
        Route::get('report/admin-department-performance', function () {
            return app(\App\Http\Controllers\EvaluationController::class)->departmentEvaluationsReport(request(), 'Management & Staff(Admin)');
        })->name('report.admin-department-performance');
        Route::get('report/packing-plant-performance', function () {
            return app(\App\Http\Controllers\EvaluationController::class)->departmentEvaluationsReport(request(), 'Packing Plant');
        })->name('report.packing-plant-performance');
        Route::get('report/harvesting-area-performance', function () {
            return app(\App\Http\Controllers\EvaluationController::class)->departmentEvaluationsReport(request(), 'Harvesting');
        })->name('report.harvesting-area-performance');
        Route::get('report/coop-area-performance', function () {
            return app(\App\Http\Controllers\EvaluationController::class)->departmentEvaluationsReport(request(), 'Coop Area');
        })->name('report.coop-area-performance');
        Route::get('report/pest-disease-performance', function () {
            return app(\App\Http\Controllers\EvaluationController::class)->departmentEvaluationsReport(request(), 'Pest & Decease');
        })->name('report.pest-disease-performance');
        Route::get('report/coop-harvester-maintenance-performance', function () {
            return app(\App\Http\Controllers\EvaluationController::class)->departmentEvaluationsReport(request(), 'Coop Harvester Maintenance');
        })->name('report.coop-harvester-maintenance-performance');
        Route::get('report/security-forces-performance', function () {
            return app(\App\Http\Controllers\EvaluationController::class)->departmentEvaluationsReport(request(), 'Security Forces');
        })->name('report.security-forces-performance');
        Route::get('report/miscellaneous-performance', function () {
            return app(\App\Http\Controllers\EvaluationController::class)->departmentEvaluationsReport(request(), 'Miscellaneous');
        })->name('report.miscellaneous-performance');
    });

    // Explicit routes for all service-tenure subpages
    Route::middleware(['permission:View Service Tenure'])->group(function () {
        Route::get('service-tenure/employee', [ServiceTenureController::class, 'employee'])->name('service-tenure.employee.alias');
        Route::get('service-tenure', [ServiceTenureController::class, 'employee'])->name('service-tenure.employee');
        Route::get('service-tenure/index', [ServiceTenureController::class, 'index'])->name('service-tenure.index');
        Route::get('service-tenure/service-tenure', [ServiceTenureController::class, 'serviceTenure'])->name('service-tenure.service-tenure');
        Route::get('service-tenure/pay-advancement', [ServiceTenureController::class, 'payAdvancement'])->name('service-tenure.pay-advancement');
        Route::get('service-tenure/report', [ServiceTenureController::class, 'report'])->name('service-tenure.report');
        Route::post('service-tenure/recalculate', [ServiceTenureController::class, 'recalculate'])->name('service-tenure.recalculate');
        Route::post('service-tenure/pay-advancement/store', [ServiceTenureController::class, 'storePayAdvancement'])->name('service-tenure.pay-advancement.store');
    });

    // Supervisor management routes (only for super admin) - moved outside evaluation group
    Route::get('evaluation/supervisor-management', [SupervisorDepartmentController::class, 'index'])->name('evaluation.supervisor-management');
    Route::post('evaluation/supervisor-management', [SupervisorDepartmentController::class, 'store'])->name('evaluation.supervisor-management.store');
    Route::put('evaluation/supervisor-management/{assignment}', [SupervisorDepartmentController::class, 'update'])->name('evaluation.supervisor-management.update');
    Route::delete('evaluation/supervisor-management/{assignment}', [SupervisorDepartmentController::class, 'destroy'])->name('evaluation.supervisor-management.destroy');

    // HR Personnel management routes
    Route::post('evaluation/hr-management', [SupervisorDepartmentController::class, 'storeHRAssignment'])->name('evaluation.hr-management.store');
    Route::put('evaluation/hr-management/{assignment}', [SupervisorDepartmentController::class, 'updateHRAssignment'])->name('evaluation.hr-management.update');
    Route::delete('evaluation/hr-management/{assignment}', [SupervisorDepartmentController::class, 'destroyHRAssignment'])->name('evaluation.hr-management.destroy');

    // Manager management routes
    Route::post('evaluation/manager-management', [SupervisorDepartmentController::class, 'storeManagerAssignment'])->name('evaluation.manager-management.store');
    Route::put('evaluation/manager-management/{assignment}', [SupervisorDepartmentController::class, 'updateManagerAssignment'])->name('evaluation.manager-management.update');
    Route::delete('evaluation/manager-management/{assignment}', [SupervisorDepartmentController::class, 'destroyManagerAssignment'])->name('evaluation.manager-management.destroy');

    // Evaluation frequency update route (accessible from supervisor management)
    Route::put('evaluation/frequencies/{department}', [EvaluationController::class, 'updateFrequency'])->name('evaluation.frequencies.update');

    // Check existing evaluation route
    Route::get('evaluation/check-existing/{employeeId}/{department}', [EvaluationController::class, 'checkExistingEvaluation'])->name('evaluation.check-existing');

    // Temporary route for department evaluation (for testing - remove permission middleware)
    Route::get('evaluation/department-evaluation', [EvaluationController::class, 'departmentEvaluation'])->name('evaluation.department-evaluation');
    Route::post('evaluation/department-evaluation', [EvaluationController::class, 'storeDepartmentEvaluation'])->name('evaluation.department-evaluation.store');

    Route::middleware(['permission:View Evaluation'])->group(function () {
        Route::resource('evaluation', EvaluationController::class)->names('evaluation');
    });

    Route::middleware(['permission:View Dashboard'])->group(function () {
        Route::resource('dashboard', DashboardController::class)->names('dashboard');
    });

    Route::middleware(['permission:View Attendance'])->group(function () {
        Route::get('attendance/daily-checking', [AttendanceController::class, 'dailyChecking'])->name('attendance.daily-checking');
        Route::get('attendance/qr-scanner', function () {
            return Inertia::render('attendance/qr-scanner');
        })->name('attendance.qr-scanner');
        // Exclude 'index' from resource since public route uses /attendance
        Route::resource('attendance', AttendanceController::class)->names('attendance')->except(['index']);
        // Manually define index route with different path to avoid conflict
        Route::get('attendance/manage', [AttendanceController::class, 'index'])->name('attendance.index');
        Route::resource('attendance-session', AttendanceSessionController::class)->names('attendance-session');
    });

    Route::middleware(['permission:View Leave'])->group(function () {
        Route::get('leave/credit-summary', [LeaveController::class, 'creditSummary'])->name('leave.credit-summary');
        Route::resource('leave', LeaveController::class)->names('leave');
        Route::post('leave/{leave}/send-email', [LeaveController::class, 'sendEmail'])->name('leave.send-email');
    });

    // Absence routes
    Route::middleware(['permission:View Absence'])->group(function () {
        Route::get('absence', [AbsenceController::class, 'index'])->name('absence.index');
        Route::get('absence/absence-approve', [AbsenceController::class, 'request'])->name('absence.absence-approve');
        Route::get('absence/credit-summary', [AbsenceController::class, 'creditSummary'])->name('absence.credit-summary');
        Route::post('absence', [AbsenceController::class, 'store'])->name('absence.store');
        Route::get('absence/approve', [AbsenceController::class, 'approve'])->name('absence.approve');
        Route::patch('absence/{absence}/status', [AbsenceController::class, 'updateStatus'])->name('absence.updateStatus');
        Route::delete('absence/{absence}', [AbsenceController::class, 'destroy'])->name('absence.destroy');
    });

    // Resume to Work routes
    Route::middleware(['permission:View Resume to Work'])->group(function () {
        Route::get('resume-to-work', [ResumeToWorkController::class, 'index'])->name('resume-to-work.index');
        Route::post('resume-to-work', [ResumeToWorkController::class, 'store'])->name('resume-to-work.store');
        Route::put('resume-to-work/{resumeToWork}', [ResumeToWorkController::class, 'update'])->name('resume-to-work.update');
        Route::patch('resume-to-work/{resumeToWork}/process', [ResumeToWorkController::class, 'process'])->name('resume-to-work.process');
        Route::patch('resume-to-work/{resumeToWork}/notify-supervisor', [ResumeToWorkController::class, 'markSupervisorNotified'])->name('resume-to-work.notify-supervisor');
        Route::post('resume-to-work/{resumeToWork}/send-email', [ResumeToWorkController::class, 'sendEmail'])->name('resume-to-work.send-email');
    });
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware(['permission:View Employee'])->group(function () {
        Route::get('/employee', [EmployeeController::class, 'index'])->name('employee.index');
        Route::post('/employee', [EmployeeController::class, 'store'])->name('employee.store');
        Route::put('/employee/{id}', [EmployeeController::class, 'update'])->name('employee.update');
        Route::delete('/employee/{id}', [EmployeeController::class, 'destroy'])->name('employee.destroy');
    });
});


Route::middleware(['auth', 'verified'])->group(function () {
    // Permission Management Routes
    Route::middleware(['permission:View Permission'])->group(function () {
        Route::get('permission/access/index', [PermissionController::class, 'index'])->name('permission.index');
        Route::post('permission/access/store', [PermissionController::class, 'store'])->name('permission.store');
        Route::delete('permission/access/{permission}', [PermissionController::class, 'destroy'])->name('permission.destroy');
    });

    // User Management Routes
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('permission/user/index', [UserController::class, 'index'])->name('user.index');
        Route::get('permission/user/{user}', [UserController::class, 'show'])->name('user.show');
        Route::post('permission/user/store', [UserController::class, 'store'])->name('user.store');
        Route::put('permission/user/{user}', [UserController::class, 'update'])->name('user.update');
        Route::delete('permission/user/{user}', [UserController::class, 'destroy'])->name('user.destroy');
    });

    // Role Management Routes
    Route::middleware(['permission:View Role'])->group(function () {
        Route::get('permission/role/index', [RoleController::class, 'index'])->name('role.index');
        Route::get('permission/role/create', [RoleController::class, 'create'])->name('role.create');
        Route::post('permission/role/store', [RoleController::class, 'store'])->name('role.store');
        Route::get('permission/role/{role}', [RoleController::class, 'show'])->name('role.show');
        Route::get('permission/role/{role}/edit', [RoleController::class, 'edit'])->name('role.edit');
        Route::put('permission/role/{role}', [RoleController::class, 'update'])->name('role.update');
        Route::delete('permission/role/{role}', [RoleController::class, 'destroy'])->name('role.destroy');
    });

    // Admin Management
    Route::middleware(['permission:View Admin Management'])->group(function () {
        Route::get('admin-management', [AdminManagementController::class, 'index'])->name('admin-management.index');
        Route::post('evaluation/admin-management', [AdminManagementController::class, 'storeAdminAssignment'])->name('evaluation.admin-management.store');
        Route::put('evaluation/admin-management/{assignment}', [AdminManagementController::class, 'updateAdminAssignment'])->name('evaluation.admin-management.update');
        Route::delete('evaluation/admin-management/{assignment}', [AdminManagementController::class, 'destroyAdminAssignment'])->name('evaluation.admin-management.destroy');
    });
});






// Broadcasting routes - Manual route with full debugging
Route::match(['get', 'post'], '/broadcasting/auth', function (\Illuminate\Http\Request $request) {
    Log::info('🎯 BROADCASTING AUTH ROUTE HIT!', [
        'url' => $request->fullUrl(),
        'method' => $request->method(),
        'channel_name' => $request->input('channel_name'),
        'socket_id' => $request->input('socket_id'),
        'headers' => [
            'x-csrf-token' => $request->header('X-CSRF-TOKEN') ? 'present' : 'missing',
            'x-requested-with' => $request->header('X-Requested-With'),
            'cookie' => $request->header('Cookie') ? 'present' : 'missing',
        ],
        'auth_check' => Auth::check(),
        'auth_id' => Auth::id(),
        'auth_user' => Auth::user() ? [
            'id' => Auth::user()->id,
            'email' => Auth::user()->email ?? null,
        ] : null,
    ]);

    try {
        Log::info('📡 Calling BroadcastManager::auth()...');

        // Call the broadcasting authenticator
        $response = app(\Illuminate\Broadcasting\BroadcastManager::class)->auth($request);

        Log::info('📡 BroadcastManager::auth() response', [
            'status' => $response->getStatusCode(),
            'content' => $response->getContent(),
        ]);

        return $response;
    } catch (\Exception $e) {
        Log::error('❌ BroadcastManager::auth() EXCEPTION', [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'error' => $e->getMessage(),
            'message' => 'Broadcasting authorization failed'
        ], 403);
    }
})->middleware('web');



require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/employee_auth.php';
