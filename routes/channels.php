<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

// Public notifications channel - accessible to all authenticated users (both regular users and employees)
Broadcast::channel('notifications', function ($user) {
    // Allow if regular user is authenticated
    if (Auth::check()) {
        return true;
    }

    // Allow if employee is authenticated via session
    if (Session::has('employee_id')) {
        return true;
    }

    return false;
});

Broadcast::channel('employee.{employeeId}', function ($user, $employeeId) {
    return Auth::check();
});

Broadcast::channel('supervisor.{supervisorId}', function ($user, $supervisorId) {
    Log::info('🔐 CHANNEL AUTH CALLBACK TRIGGERED', [
        'channel' => 'supervisor.' . $supervisorId,
        'supervisorId_param' => $supervisorId,
        'user_param' => $user ? [
            'id' => $user->id ?? 'no id',
            'class' => get_class($user),
        ] : 'null',
    ]);

    $isAuthenticated = Auth::check();
    $currentUser = Auth::user();

    Log::info('🔐 Channel auth - Auth state', [
        'Auth::check()' => $isAuthenticated,
        'Auth::user()' => $currentUser ? [
            'id' => $currentUser->id,
            'email' => $currentUser->email ?? null,
        ] : null,
        'user_param' => $user ? [
            'id' => $user->id ?? null,
            'email' => $user->email ?? null,
        ] : null,
    ]);

    // Must be authenticated
    if (!$isAuthenticated || !$currentUser) {
        Log::error('❌ Channel auth FAILED: User not authenticated');
        return false;
    }

    Log::info('🔐 Checking authorization logic', [
        'currentUser_id' => $currentUser->id,
        'supervisorId_param' => $supervisorId,
        'ids_match' => $currentUser->id == $supervisorId,
        'trying_isSupervisor_method' => 'yes',
    ]);

    // Allow if user ID matches (supervisor accessing their own channel)
    if ($currentUser->id == $supervisorId) {
        Log::info('✅ Channel auth SUCCESS: User ID matches', [
            'user_id' => $currentUser->id,
            'supervisor_id' => $supervisorId,
        ]);
        return ['id' => $currentUser->id, 'name' => $currentUser->fullname];
    }

    // Check if user is a supervisor
    try {
        $isSupervisorResult = $currentUser->isSupervisor();
        Log::info('🔐 isSupervisor() result', [
            'result' => $isSupervisorResult,
            'type' => gettype($isSupervisorResult),
        ]);

        if ($isSupervisorResult) {
            Log::info('✅ Channel auth SUCCESS: User is supervisor');
            return ['id' => $currentUser->id, 'name' => $currentUser->fullname];
        }
    } catch (\Exception $e) {
        Log::error('❌ Error calling isSupervisor()', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
    }

    // Check if user is super admin
    try {
        $isSuperAdminResult = $currentUser->isSuperAdmin();
        Log::info('🔐 isSuperAdmin() result', [
            'result' => $isSuperAdminResult,
            'type' => gettype($isSuperAdminResult),
        ]);

        if ($isSuperAdminResult) {
            Log::info('✅ Channel auth SUCCESS: User is super admin');
            return ['id' => $currentUser->id, 'name' => $currentUser->fullname];
        }
    } catch (\Exception $e) {
        Log::error('❌ Error calling isSuperAdmin()', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
    }

    Log::error('❌ Channel auth FAILED: All checks failed', [
        'user_id' => $currentUser->id,
        'requested_supervisor_id' => $supervisorId,
    ]);

    return false;
});

Broadcast::channel('hr.{hrId}', function ($user, $hrId) {
    $isAuthenticated = Auth::check();
    $currentUser = Auth::user();

    if (!$isAuthenticated || !$currentUser) {
        return false;
    }

    // Allow if user ID matches (HR accessing their own channel)
    if ($currentUser->id == $hrId) {
        return ['id' => $currentUser->id, 'name' => $currentUser->fullname];
    }

    // Check if user is HR
    try {
        if ($currentUser->isHR()) {
            return ['id' => $currentUser->id, 'name' => $currentUser->fullname];
        }
    } catch (\Exception $e) {
        Log::error('Error calling isHR()', ['error' => $e->getMessage()]);
    }

    // Check if user is super admin
    try {
        if ($currentUser->isSuperAdmin()) {
            return ['id' => $currentUser->id, 'name' => $currentUser->fullname];
        }
    } catch (\Exception $e) {
        Log::error('Error calling isSuperAdmin()', ['error' => $e->getMessage()]);
    }

    return false;
});
