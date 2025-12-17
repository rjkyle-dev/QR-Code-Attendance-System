<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceSessionController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DashboardController;
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
use App\Http\Controllers\PayrollController;
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


    Route::middleware(['permission:View Dashboard'])->group(function () {
        Route::resource('dashboard', DashboardController::class)->names('dashboard');
    });

    Route::middleware(['permission:View Attendance'])->group(function () {
        // IMPORTANT: Define specific routes BEFORE resource routes to avoid route conflicts
        // The resource route creates 'attendance/{attendance}' which would match 'attendance/manage' if defined first
        Route::get('attendance/manage', [AttendanceController::class, 'index'])->name('attendance.index');
        Route::get('attendance/qr-scanner', function () {
            return Inertia::render('attendance/qr-scanner');
        })->name('attendance.qr-scanner');
        // Exclude 'index' from resource since public route uses /attendance
        // Define resource AFTER specific routes to avoid conflicts
        Route::resource('attendance', AttendanceController::class)->names('attendance')->except(['index']);
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
    });

    // Payroll
    Route::middleware(['permission:View Payroll'])->group(function () {
        Route::get('payroll', [PayrollController::class, 'index'])->name('payroll.index');
        Route::post('payroll/generate', [PayrollController::class, 'generate'])->name('payroll.generate');
        Route::get('payroll/{id}', [PayrollController::class, 'show'])->name('payroll.show');
    });

    // System Settings
    Route::middleware(['permission:View Settings'])->group(function () {
        Route::get('system-settings', function () {
            return Inertia::render('system-settings/index');
        })->name('system-settings.index');
        Route::get('system-settings/payroll', [\App\Http\Controllers\PayrollSettingsController::class, 'index'])->name('system-settings.payroll');
        Route::post('system-settings/payroll/update', [\App\Http\Controllers\PayrollSettingsController::class, 'update'])->name('system-settings.payroll.update');
        Route::post('system-settings/payroll/reset-all', [\App\Http\Controllers\PayrollSettingsController::class, 'resetAll'])->name('system-settings.payroll.reset-all');
        Route::get('system-settings/department', [\App\Http\Controllers\DepartmentController::class, 'index'])->name('system-settings.department');
        Route::post('system-settings/department', [\App\Http\Controllers\DepartmentController::class, 'store'])->name('system-settings.department.store');
        Route::put('system-settings/department/{id}', [\App\Http\Controllers\DepartmentController::class, 'update'])->name('system-settings.department.update');
        Route::delete('system-settings/department/{id}', [\App\Http\Controllers\DepartmentController::class, 'destroy'])->name('system-settings.department.destroy');
        Route::get('system-settings/position', [\App\Http\Controllers\PositionController::class, 'index'])->name('system-settings.position');
        Route::post('system-settings/position', [\App\Http\Controllers\PositionController::class, 'store'])->name('system-settings.position.store');
        Route::put('system-settings/position/{id}', [\App\Http\Controllers\PositionController::class, 'update'])->name('system-settings.position.update');
        Route::delete('system-settings/position/{id}', [\App\Http\Controllers\PositionController::class, 'destroy'])->name('system-settings.position.destroy');
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
