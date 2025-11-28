<?php

namespace App\Http\Controllers;

use App\Models\ResumeToWork;
use App\Models\ReturnWork;
use App\Models\Employee;
use App\Models\Notification;
use App\Models\Leave;
use App\Models\Absence;
use App\Models\User;
use App\Traits\EmployeeFilterTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Exception;

class ResumeToWorkController extends Controller
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

    // Base query for resume to work requests (admin created)
    $resumeQuery = ResumeToWork::with('employee', 'processedBy');

    // Filter based on user role
    // HR and Manager already get all requests, so only filter for Admin and Supervisor
    $isHR = $user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists();
    $isManager = $user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists();

    if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
      $resumeQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
        $query->whereIn('department', $supervisedDepartments);
      });
    }

    $resumeRequests = $resumeQuery->orderBy('created_at', 'desc')->get();

    // Also get return work requests (employee submitted)
    $returnWorkQuery = ReturnWork::with('employee');

    // Filter based on user role
    if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
      $returnWorkQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
        $query->whereIn('department', $supervisedDepartments);
      });
    }

    $returnWorkRequests = $returnWorkQuery->orderBy('created_at', 'desc')->get();

    // Transform resume requests (admin created)
    $resumeList = $resumeRequests->transform(fn($resume) => [
      'id' => 'resume_' . $resume->id,
      'employee_name' => $resume->employee ? $resume->employee->employee_name : null,
      'employee_id' => (string) $resume->employee_id, // Database ID for form
      'employee_id_number' => $resume->employee ? $resume->employee->employeeid : null, // Employee ID number for display
      'department' => $resume->employee ? $resume->employee->department : null,
      'position' => $resume->employee ? $resume->employee->position : null,
      'return_date' => $resume->return_date ? \Illuminate\Support\Carbon::parse($resume->return_date)->format('Y-m-d') : null,
      'previous_absence_reference' => $resume->previous_absence_reference,
      'comments' => $resume->comments,
      'status' => $resume->status,
      'processed_by' => $resume->processedBy ? $resume->processedBy->name : null,
      'processed_at' => $resume->processed_at ? $resume->processed_at->format('Y-m-d H:i') : null,
      'supervisor_notified' => $resume->supervisor_notified,
      'supervisor_notified_at' => $resume->supervisor_notified_at ? $resume->supervisor_notified_at->format('Y-m-d H:i') : null,
      'created_at' => $resume->created_at->format('Y-m-d H:i'),
      'source' => 'admin',
    ]);

    // Transform return work requests (employee submitted)
    $returnWorkList = $returnWorkRequests->transform(fn($returnWork) => [
      'id' => 'return_' . $returnWork->id,
      'employee_name' => $returnWork->employee ? $returnWork->employee->employee_name : null,
      'employee_id' => (string) $returnWork->employee_id, // Database ID for form
      'employee_id_number' => $returnWork->employee ? $returnWork->employee->employeeid : $returnWork->employee_id_number, // Employee ID number for display
      'department' => $returnWork->employee ? $returnWork->employee->department : null,
      'position' => $returnWork->employee ? $returnWork->employee->position : null,
      'return_date' => $returnWork->return_date ? \Illuminate\Support\Carbon::parse($returnWork->return_date)->format('Y-m-d') : null,
      'previous_absence_reference' => $returnWork->absence_type, // Map absence_type to previous_absence_reference
      'comments' => $returnWork->reason, // Map reason to comments
      'status' => in_array($returnWork->status, ['approved', 'processed']) ? 'processed' : 'pending',
      'processed_by' => $returnWork->approver ? $returnWork->approver->name : null,
      'processed_at' => $returnWork->approved_at ? $returnWork->approved_at->format('Y-m-d H:i') : null,
      'supervisor_notified' => false, // Default for return work requests
      'supervisor_notified_at' => null,
      'created_at' => $returnWork->created_at->format('Y-m-d H:i'),
      'source' => 'employee',
    ]);

    // Merge both lists and sort by created_at
    $allRequests = $resumeList->concat($returnWorkList)->sortByDesc('created_at')->values();

    // Get employees for the form
    $employeeQuery = Employee::orderBy('employee_name');

    // Filter employees based on user role
    // HR and Manager already get all employees, so only filter for Admin and Supervisor
    if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
      $employeeQuery->whereIn('department', $supervisedDepartments);
    }

    $employees = $employeeQuery->get()->map(fn($employee) => [
      'id' => $employee->id,
      'employee_name' => $employee->employee_name,
      'employeeid' => $employee->employeeid,
      'department' => $employee->department,
      'position' => $employee->position,
    ]);

    // Get approved leaves (both supervisor and HR approved)
    $approvedLeavesQuery = Leave::with(['employee', 'supervisorApprover', 'hrApprover'])
      ->where('supervisor_status', 'approved')
      ->where('hr_status', 'approved')
      ->where('leave_status', 'Approved');

    // Filter based on user role
    // HR and Manager already get all leaves, so only filter for Admin and Supervisor
    if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
      $approvedLeavesQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
        $query->whereIn('department', $supervisedDepartments);
      });
    }

    $approvedLeaves = $approvedLeavesQuery->orderBy('hr_approved_at', 'desc')
      ->orderBy('leave_end_date', 'desc')
      ->get()
      ->map(function ($leave) {
        // Check if there's a ResumeToWork record for this leave
        // Try multiple reference formats
        $resumeToWork = ResumeToWork::where(function ($query) use ($leave) {
          $query->where('previous_absence_reference', "Leave #{$leave->id}")
            ->orWhere('previous_absence_reference', "Leave Request #{$leave->id}")
            ->orWhere('previous_absence_reference', "leave_{$leave->id}")
            ->orWhere('previous_absence_reference', "LEAVE-{$leave->id}");
        })
          ->where('employee_id', $leave->employee_id)
          ->first();

        // Get HR Officer for the employee's department
        $hrOfficer = null;
        if ($leave->employee && $leave->employee->department) {
          $hrUser = User::getHRForDepartment($leave->employee->department);
          if ($hrUser) {
            $hrOfficer = $hrUser->fullname ?? ($hrUser->firstname . ' ' . $hrUser->lastname);
          }
        }

        // Get Supervisor for the employee's department
        $supervisor = null;
        if ($leave->employee && $leave->employee->department) {
          $supervisorUser = User::getSupervisorForDepartment($leave->employee->department);
          if ($supervisorUser) {
            $supervisor = $supervisorUser->fullname ?? ($supervisorUser->firstname . ' ' . $supervisorUser->lastname);
          }
        }

        return [
          'id' => (string) $leave->id,
          'employee_name' => $leave->employee ? $leave->employee->employee_name : null,
          'employee_id' => $leave->employee ? $leave->employee->employeeid : null,
          'employee_id_db' => (string) $leave->employee_id,
          'department' => $leave->employee ? $leave->employee->department : null,
          'position' => $leave->employee ? $leave->employee->position : null,
          'leave_type' => $leave->leave_type,
          'leave_start_date' => $leave->leave_start_date->format('Y-m-d'),
          'leave_end_date' => $leave->leave_end_date->format('Y-m-d'),
          'leave_days' => $leave->leave_days,
          'leave_reason' => $leave->leave_reason,
          'status' => $leave->leave_status,
          'picture' => $leave->employee ? $leave->employee->picture : null,
          'supervisor_status' => $leave->supervisor_status,
          'hr_status' => $leave->hr_status,
          'supervisor_approved_at' => $leave->supervisor_approved_at ? $leave->supervisor_approved_at->format('Y-m-d H:i:s') : null,
          'hr_approved_at' => $leave->hr_approved_at ? $leave->hr_approved_at->format('Y-m-d H:i:s') : null,
          'hr_return_date' => $resumeToWork ? $resumeToWork->return_date->format('Y-m-d') : null,
          'hr_return_date_formatted' => $resumeToWork ? $resumeToWork->return_date->format('M d, Y') : null,
          'hr_officer_name' => $hrOfficer,
          'supervisor_name' => $supervisor,
        ];
      })->values();

    // Get approved absences (both supervisor and HR approved)
    $approvedAbsencesQuery = Absence::with(['employee', 'supervisorApprover', 'hrApprover'])
      ->where('supervisor_status', 'approved')
      ->where('hr_status', 'approved')
      ->where('status', 'approved');

    // Filter based on user role
    // HR and Manager already get all absences, so only filter for Admin and Supervisor
    if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
      $approvedAbsencesQuery->whereIn('department', $supervisedDepartments);
    }

    $approvedAbsences = $approvedAbsencesQuery->orderBy('hr_approved_at', 'desc')
      ->orderBy('to_date', 'desc')
      ->get()
      ->map(function ($absence) {
        // Check if there's a ResumeToWork record for this absence
        // Try multiple reference formats
        $resumeToWork = ResumeToWork::where(function ($query) use ($absence) {
          $query->where('previous_absence_reference', "Absence #{$absence->id}")
            ->orWhere('previous_absence_reference', "absence_{$absence->id}")
            ->orWhere('previous_absence_reference', "ABS-{$absence->id}");
        })
          ->where('employee_id', $absence->employee_id)
          ->first();

        // Get HR Officer for the employee's department
        $hrOfficer = null;
        if ($absence->department) {
          $hrUser = User::getHRForDepartment($absence->department);
          if ($hrUser) {
            $hrOfficer = $hrUser->fullname ?? ($hrUser->firstname . ' ' . $hrUser->lastname);
          }
        }

        // Get Supervisor for the employee's department
        $supervisor = null;
        if ($absence->department) {
          $supervisorUser = User::getSupervisorForDepartment($absence->department);
          if ($supervisorUser) {
            $supervisor = $supervisorUser->fullname ?? ($supervisorUser->firstname . ' ' . $supervisorUser->lastname);
          }
        }

        return [
          'id' => (string) $absence->id,
          'employee_name' => $absence->employee ? $absence->employee->employee_name : $absence->full_name,
          'employee_id' => $absence->employee ? $absence->employee->employeeid : $absence->employee_id_number,
          'employee_id_db' => (string) $absence->employee_id,
          'department' => $absence->department,
          'position' => $absence->position,
          'absence_type' => $absence->absence_type,
          'from_date' => $absence->from_date->format('Y-m-d'),
          'to_date' => $absence->to_date->format('Y-m-d'),
          'days' => $absence->days,
          'reason' => $absence->reason,
          'status' => $absence->status,
          'picture' => $absence->employee ? $absence->employee->picture : null,
          'supervisor_status' => $absence->supervisor_status,
          'hr_status' => $absence->hr_status,
          'supervisor_approved_at' => $absence->supervisor_approved_at ? $absence->supervisor_approved_at->format('Y-m-d H:i:s') : null,
          'hr_approved_at' => $absence->hr_approved_at ? $absence->hr_approved_at->format('Y-m-d H:i:s') : null,
          'hr_return_date' => $resumeToWork ? $resumeToWork->return_date->format('Y-m-d') : null,
          'hr_return_date_formatted' => $resumeToWork ? $resumeToWork->return_date->format('M d, Y') : null,
          'hr_officer_name' => $hrOfficer,
          'supervisor_name' => $supervisor,
        ];
      })->values();

    return Inertia::render('resume-to-work/index', [
      'resumeRequests' => $allRequests,
      'employees' => $employees,
      'approvedLeaves' => $approvedLeaves,
      'approvedAbsences' => $approvedAbsences,
      'userRole' => [
        'is_supervisor' => $isSupervisor,
        'is_super_admin' => $isSuperAdmin,
        'supervised_departments' => $supervisedDepartments,
      ],
    ]);
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request)
  {
    try {
      $request->validate([
        'employee_id' => 'required|exists:employees,id',
        'return_date' => 'required|date',
        'previous_absence_reference' => 'nullable|string',
        'comments' => 'nullable|string',
      ]);

      $resumeToWork = ResumeToWork::create([
        'employee_id' => $request->employee_id,
        'return_date' => $request->return_date,
        'previous_absence_reference' => $request->previous_absence_reference,
        'comments' => $request->comments,
        'status' => 'pending',
      ]);

      // Create notification for the supervisor of the employee's department
      $employee = Employee::find($request->employee_id);
      $supervisor = \App\Models\User::getSupervisorForDepartment($employee->department);

      if ($supervisor) {
        Notification::create([
          'type' => 'resume_to_work',
          'user_id' => $supervisor->id,
          'data' => [
            'resume_id' => $resumeToWork->id,
            'employee_name' => $employee ? $employee->employee_name : null,
            'return_date' => $request->return_date,
            'department' => $employee->department,
          ],
        ]);
      }

      return redirect()->back()->with('success', 'Resume to work form submitted successfully!');
    } catch (Exception $e) {
      Log::error('Resume to work creation failed: ' . $e->getMessage());
      return redirect()->back()->with('error', 'Failed to submit resume to work form. Please try again.');
    }
  }

  /**
   * Process resume to work form (HR Admin action)
   */
  public function process(Request $request, $resumeToWorkId)
  {
    try {
      $user = Auth::user();

      // Only HR Admin or Super Admin can process
      if (!$user->isSuperAdmin() && !$user->hasRole('HR Admin')) {
        return redirect()->back()->with('error', 'Unauthorized action.');
      }

      // Parse the ID to determine if it's a resume or return work request
      if (str_starts_with($resumeToWorkId, 'resume_')) {
        $id = str_replace('resume_', '', $resumeToWorkId);
        $resumeToWork = ResumeToWork::findOrFail($id);
        $resumeToWork->markAsProcessed($user->id);
        $employee = $resumeToWork->employee;
        $returnDate = $resumeToWork->return_date ? \Illuminate\Support\Carbon::parse($resumeToWork->return_date)->format('Y-m-d') : null;
      } elseif (str_starts_with($resumeToWorkId, 'return_')) {
        $id = str_replace('return_', '', $resumeToWorkId);
        $returnWork = ReturnWork::findOrFail($id);
        $returnWork->update([
          'status' => 'approved',
          'approved_by' => $user->id,
          'approved_at' => now(),
        ]);
        $employee = $returnWork->employee;
        $returnDate = $returnWork->return_date ? \Illuminate\Support\Carbon::parse($returnWork->return_date)->format('Y-m-d') : null;
      } else {
        return redirect()->back()->with('error', 'Invalid request ID.');
      }

      // Create notification for supervisor
      if ($employee) {
        Notification::create([
          'type' => 'employee_returned',
          'data' => [
            'employee_name' => $employee->employee_name,
            'employee_id' => $employee->employeeid,
            'department' => $employee->department,
            'return_date' => $returnDate,
          ],
        ]);

        // Broadcast real-time notification using Laravel Echo Reverb
        try {
          broadcast(new \App\Events\ReturnWorkProcessed([
            'return_work_id' => $resumeToWorkId,
            'employee_name' => $employee->employee_name,
            'employee_id_number' => $employee->employeeid,
            'department' => $employee->department,
            'return_date' => $returnDate,
            'processed_by' => $user->name,
            'processed_at' => now()->format('Y-m-d H:i'),
          ]));

          // Also broadcast status update to employee
          if (str_starts_with($resumeToWorkId, 'return_')) {
            broadcast(new \App\Events\ReturnWorkStatusUpdated([
              'request_id' => str_replace('return_', '', $resumeToWorkId),
              'status' => 'approved',
              'employee_id' => $employee->id,
              'employee_name' => $employee->employee_name,
              'department' => $employee->department,
              'return_date' => $returnDate,
              'absence_type' => $returnWork->absence_type ?? '',
              'reason' => $returnWork->reason ?? '',
              'approved_by' => $user->name,
              'approved_at' => now()->format('Y-m-d H:i'),
            ]));
          }
        } catch (\Exception $broadcastError) {
          Log::warning('Failed to broadcast return work processed notification: ' . $broadcastError->getMessage());
        }
      }

      return redirect()->back()->with('success', 'Resume to work form processed successfully! Supervisor has been notified.');
    } catch (Exception $e) {
      Log::error('Resume to work processing failed: ' . $e->getMessage());
      return redirect()->back()->with('error', 'Failed to process resume to work form. Please try again.');
    }
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, $resumeToWorkId)
  {
    try {
      $user = Auth::user();

      // Only HR Admin or Super Admin can update
      if (!$user->isSuperAdmin() && !$user->hasRole('HR Admin')) {
        return redirect()->back()->with('error', 'Unauthorized action.');
      }

      $request->validate([
        'employee_id' => 'required|exists:employees,id',
        'return_date' => 'required|date',
        'previous_absence_reference' => 'nullable|string',
        'comments' => 'nullable|string',
      ]);

      // Parse the ID to determine if it's a resume or return work request
      if (str_starts_with($resumeToWorkId, 'resume_')) {
        $id = str_replace('resume_', '', $resumeToWorkId);
        $resumeToWork = ResumeToWork::findOrFail($id);

        // Only allow editing if not yet processed
        if ($resumeToWork->status === 'processed') {
          return redirect()->back()->with('error', 'Cannot edit a processed resume to work request.');
        }

        $resumeToWork->update([
          'employee_id' => $request->employee_id,
          'return_date' => $request->return_date,
          'previous_absence_reference' => $request->previous_absence_reference,
          'comments' => $request->comments,
        ]);
      } elseif (str_starts_with($resumeToWorkId, 'return_')) {
        $id = str_replace('return_', '', $resumeToWorkId);
        $returnWork = ReturnWork::findOrFail($id);

        // Only allow editing if not yet approved/processed
        if (in_array($returnWork->status, ['approved', 'processed'])) {
          return redirect()->back()->with('error', 'Cannot edit an approved return work request.');
        }

        $returnWork->update([
          'employee_id' => $request->employee_id,
          'return_date' => $request->return_date,
          'absence_type' => $request->previous_absence_reference,
          'reason' => $request->comments,
        ]);
      } else {
        // Check if it's a Leave or Absence ID (when editing from approved leave/absence)
        $leave = Leave::find($resumeToWorkId);
        $absence = $leave ? null : Absence::find($resumeToWorkId);

        if ($leave || $absence) {
          // This is a leave/absence ID, so we need to find or create a ResumeToWork record
          $reference = $leave ? "Leave #{$resumeToWorkId}" : "Absence #{$resumeToWorkId}";

          // Try to find existing ResumeToWork with this reference
          $resumeToWork = ResumeToWork::where('previous_absence_reference', $reference)
            ->where('employee_id', $request->employee_id)
            ->first();

          if (!$resumeToWork) {
            // Create a new ResumeToWork record
            $resumeToWork = ResumeToWork::create([
              'employee_id' => $request->employee_id,
              'return_date' => $request->return_date,
              'previous_absence_reference' => $request->previous_absence_reference ?: $reference,
              'comments' => $request->comments,
              'status' => 'pending',
            ]);
          } else {
            // Only allow editing if not yet processed
            if ($resumeToWork->status === 'processed') {
              return redirect()->back()->with('error', 'Cannot edit a processed resume to work request.');
            }

            // Update existing record - use request value if provided, otherwise keep existing
            $resumeToWork->update([
              'employee_id' => $request->employee_id,
              'return_date' => $request->return_date,
              'previous_absence_reference' => $request->previous_absence_reference ?: $resumeToWork->previous_absence_reference,
              'comments' => $request->comments,
            ]);
          }
        } else {
          // Try to find by direct ID (for backward compatibility)
          $resumeToWork = ResumeToWork::findOrFail($resumeToWorkId);

          if ($resumeToWork->status === 'processed') {
            return redirect()->back()->with('error', 'Cannot edit a processed resume to work request.');
          }

          $resumeToWork->update([
            'employee_id' => $request->employee_id,
            'return_date' => $request->return_date,
            'previous_absence_reference' => $request->previous_absence_reference,
            'comments' => $request->comments,
          ]);
        }
      }

      return redirect()->back()->with('success', 'Resume to work request updated successfully!');
    } catch (Exception $e) {
      Log::error('Resume to work update failed: ' . $e->getMessage());
      return redirect()->back()->with('error', 'Failed to update resume to work request. Please try again.');
    }
  }

  /**
   * Mark supervisor as notified
   */
  public function markSupervisorNotified(ResumeToWork $resumeToWork)
  {
    try {
      $resumeToWork->markSupervisorNotified();
      return response()->json(['success' => true]);
    } catch (Exception $e) {
      Log::error('Mark supervisor notified failed: ' . $e->getMessage());
      return response()->json(['success' => false], 500);
    }
  }

  /**
   * Send resume to work email
   */
  public function sendEmail(Request $request, $resumeToWorkId)
  {
    try {
      $user = Auth::user();

      // Only HR Admin or Super Admin can send emails
      if (!$user->isSuperAdmin() && !$user->hasRole('HR Admin')) {
        return redirect()->back()->with('error', 'Unauthorized action.');
      }

      // Parse the ID to determine if it's a resume, return work, leave, or absence request
      if (str_starts_with($resumeToWorkId, 'resume_')) {
        $id = str_replace('resume_', '', $resumeToWorkId);
        $resumeToWork = ResumeToWork::with('employee')->findOrFail($id);
        $employee = $resumeToWork->employee;
      } elseif (str_starts_with($resumeToWorkId, 'return_')) {
        $id = str_replace('return_', '', $resumeToWorkId);
        $returnWork = ReturnWork::with('employee')->findOrFail($id);
        $employee = $returnWork->employee;
      } elseif (str_starts_with($resumeToWorkId, 'leave_')) {
        // This is a leave ID from the approved leaves list
        $id = str_replace('leave_', '', $resumeToWorkId);
        $leave = Leave::with('employee')->findOrFail($id);
        $employee = $leave->employee;

        if (!$employee) {
          return redirect()->back()->with('error', 'Employee not found for this leave request.');
        }

        // Find or create ResumeToWork record for this leave
        $reference = "Leave #{$id}";
        $resumeToWork = ResumeToWork::where(function ($query) use ($id) {
          $query->where('previous_absence_reference', "Leave #{$id}")
            ->orWhere('previous_absence_reference', "Leave Request #{$id}")
            ->orWhere('previous_absence_reference', "leave_{$id}")
            ->orWhere('previous_absence_reference', "LEAVE-{$id}");
        })
          ->where('employee_id', $employee->id)
          ->first();

        // If no ResumeToWork exists, create one
        if (!$resumeToWork) {
          $resumeToWork = ResumeToWork::create([
            'employee_id' => $employee->id,
            'return_date' => $leave->leave_end_date,
            'previous_absence_reference' => $reference,
            'comments' => $leave->leave_reason,
            'status' => 'pending',
          ]);
          // Load the employee relationship
          $resumeToWork->load('employee');
        }
      } elseif (str_starts_with($resumeToWorkId, 'absence_')) {
        // This is an absence ID from the approved absences list
        $id = str_replace('absence_', '', $resumeToWorkId);
        $absence = Absence::with('employee')->findOrFail($id);
        $employee = $absence->employee;

        if (!$employee) {
          return redirect()->back()->with('error', 'Employee not found for this absence request.');
        }

        // Find or create ResumeToWork record for this absence
        $reference = "Absence #{$id}";
        $resumeToWork = ResumeToWork::where(function ($query) use ($id) {
          $query->where('previous_absence_reference', "Absence #{$id}")
            ->orWhere('previous_absence_reference', "absence_{$id}")
            ->orWhere('previous_absence_reference', "ABS-{$id}");
        })
          ->where('employee_id', $employee->id)
          ->first();

        // If no ResumeToWork exists, create one
        if (!$resumeToWork) {
          $resumeToWork = ResumeToWork::create([
            'employee_id' => $employee->id,
            'return_date' => $absence->to_date,
            'previous_absence_reference' => $reference,
            'comments' => $absence->reason,
            'status' => 'pending',
          ]);
          // Load the employee relationship
          $resumeToWork->load('employee');
        }
      } else {
        // Try to find by direct ID
        $resumeToWork = ResumeToWork::with('employee')->findOrFail($resumeToWorkId);
        $employee = $resumeToWork->employee;
      }

      if (!$employee) {
        return redirect()->back()->with('error', 'Employee not found.');
      }

      // Check if employee has email
      if (!$employee->email) {
        return redirect()->back()->with('error', 'Employee email address is not set. Please update the employee profile with a valid email address.');
      }

      // Validate employee email format
      $employeeEmail = trim($employee->email);
      if (!filter_var($employeeEmail, FILTER_VALIDATE_EMAIL)) {
        return redirect()->back()->with('error', 'Invalid email address format. Please update the employee profile with a valid email address.');
      }

      // Get supervisor for the employee's department
      $supervisor = null;
      $supervisorEmail = null;
      if ($employee->department) {
        $supervisor = User::getSupervisorForDepartment($employee->department);
        if ($supervisor && $supervisor->email) {
          $supervisorEmail = trim($supervisor->email);
          // Validate supervisor email format
          if (!filter_var($supervisorEmail, FILTER_VALIDATE_EMAIL)) {
            Log::warning('[RESUME TO WORK SEND EMAIL] Invalid supervisor email format:', [
              'supervisor_id' => $supervisor->id,
              'supervisor_email' => $supervisorEmail,
              'department' => $employee->department,
            ]);
            $supervisorEmail = null; // Skip supervisor email if invalid
          }
        }
      }

      // Mark as processed before sending email (if not already processed)
      if ($resumeToWork->status !== 'processed') {
        $resumeToWork->markAsProcessed($user->id);
        // Reload to get updated data
        $resumeToWork->refresh();
      }

      // Prepare email recipients
      $recipients = [$employeeEmail];
      if ($supervisorEmail) {
        $recipients[] = $supervisorEmail;
      }

      // Send email using ResumeToWorkEmail mailable to both employee and supervisor
      Mail::to($recipients)->send(new \App\Mail\ResumeToWorkEmail($resumeToWork));

      // Build success message
      $successMessage = 'Email sent successfully to ' . $employeeEmail;
      if ($supervisorEmail) {
        $successMessage .= ' and supervisor (' . $supervisorEmail . ')';
      }

      Log::info('[RESUME TO WORK SEND EMAIL] Email sent successfully:', [
        'resume_id' => $resumeToWorkId,
        'resume_to_work_id' => $resumeToWork->id ?? null,
        'employee_id' => $employee->id,
        'employee_email' => $employeeEmail,
        'supervisor_id' => $supervisor ? $supervisor->id : null,
        'supervisor_email' => $supervisorEmail,
        'department' => $employee->department,
        'sent_by' => $user->id,
        'sent_by_name' => $user->fullname ?? $user->name,
      ]);

      return redirect()->back()->with('success', $successMessage);
    } catch (Exception $e) {
      Log::error('[RESUME TO WORK SEND EMAIL] Failed to send email: ' . $e->getMessage());
      return redirect()->back()->with('error', 'Failed to send email: ' . $e->getMessage());
    }
  }
}
