<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthEmployeeController;
use Inertia\Inertia;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\AbsenceController;

Route::middleware('guest')->group(function () {
    Route::get('employeelogin', [AuthEmployeeController::class, 'create'])->name('employeelogin');
    Route::post('employeelogin', [AuthEmployeeController::class, 'store'])->name('employeelogin.store');
});

Route::middleware(['web', 'employee.auth'])->group(function () {
    Route::get('employee-view', [AuthEmployeeController::class, 'index'])->name('employee-view');
    Route::get('employee-view/profile', [AuthEmployeeController::class, 'profile'])->name('employee-view.profile');
    Route::get('employee-view/attendance', [AuthEmployeeController::class, 'attendance'])->name('employee-view.attendance');
    Route::get('employee-view/qr-code', [AuthEmployeeController::class, 'qrCode'])->name('employee-view.qr-code');
    Route::get('employee-view/evaluations', [AuthEmployeeController::class, 'evaluations'])->name('employee-view.evaluations');
    // Updated to render the new request-form Leave page component
    Route::get('employee-view/leave', [LeaveController::class, 'employeeIndex'])
        ->name('employee-view.leave');
    Route::get('employee-view/l');
    // Updated to render the new request-form Absence page component
    Route::get('employee-view/absence', [AbsenceController::class, 'employeeIndex'])
        ->name('employee-view.absence');
    // Updated to render the new request-form Return to Work page component
    Route::get('employee-view/return-work', [AuthEmployeeController::class, 'returnWork'])
        ->name('employee-view.return-work');
    Route::get('employee-view/records', [AuthEmployeeController::class, 'records'])->name('employee-view.records');
    Route::get('employee-view/reports', [AuthEmployeeController::class, 'reports'])->name('employee-view.reports');


    // Employee profile settings page (to edit name, photo, password)
    Route::get('employee-view/profile-settings', [AuthEmployeeController::class, 'profileSettings'])->name('employee-view.profile-settings');
    Route::post('employee-view/profile-settings/update-profile', [AuthEmployeeController::class, 'updateProfile'])->name('employee-view.profile.update');
    Route::post('employee-view/profile-settings/update-password', [AuthEmployeeController::class, 'updatePassword'])->name('employee-view.password.update');

    // Employee notification routes
    Route::post('employee/notifications/mark-read', [AuthEmployeeController::class, 'markNotificationAsRead'])->name('employee.notifications.mark-read');
    Route::post('employee/notifications/mark-all-read', [AuthEmployeeController::class, 'markAllNotificationsAsRead'])->name('employee.notifications.mark-all-read');

    // Employee dashboard refresh route
    Route::get('employee/dashboard/refresh', [AuthEmployeeController::class, 'refreshDashboard'])->name('employee.dashboard.refresh');

    Route::post('employee/logout', [AuthEmployeeController::class, 'logout'])->name('employee.logout');
    Route::post('employee/reset-pin', [AuthEmployeeController::class, 'resetPin'])->name('employee.reset-pin');

    // New: Employee Leave Request Form route
    Route::get('employee-view/leave/request', fn() => Inertia::render('employee-view/request-form/leave/leave-request-form'))
        ->name('employee-view.leave-request-form');
    // New: Employee Leave submit route
    Route::post('employee-view/leave', [LeaveController::class, 'store'])->name('employee-view.leave.store');

    // New: Employee Absence Request Form route
    Route::get('employee-view/absence/request', fn() => Inertia::render('employee-view/request-form/absence/absence-request-form'))
        ->name('employee-view.absence-request-form');
    // New: Employee Absence submit route
    Route::post('employee-view/absence', [AbsenceController::class, 'store'])->name('employee-view.absence.store');

    // New: Employee Return to Work Request Form route
    Route::get('employee-view/return-work/request', fn() => Inertia::render('employee-view/request-form/return-work/return-work-request-form'))
        ->name('employee-view.return-work-request-form');
    // New: Employee Return to Work submit route
    Route::post('employee-view/return-work', [AuthEmployeeController::class, 'storeReturnWork'])->name('employee-view.return-work.store');
});
