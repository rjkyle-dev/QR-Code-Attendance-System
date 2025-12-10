<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\Employee;
use App\Models\LeaveCredit;
use App\Models\User;
use App\Models\ManagerDepartmentAssignment;
use App\Traits\EmployeeFilterTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Mail;
use Exception;
use App\Models\Notification;
use App\Events\LeaveRequested;
use App\Events\RequestStatusUpdated;
use App\Mail\LeaveApprovalEmail;

class LeaveController extends Controller
{
    use EmployeeFilterTrait;

    public function index(): Response
    {
        $user = Auth::user();
        $isSupervisor = $user->isSupervisor();
        $isSuperAdmin = $user->isSuperAdmin();

        $supervisedDepartments = $this->getEvaluableDepartmentsForUser($user);

        $leaveQuery = Leave::with('employee');

        $isHR = $user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists();
        $isManager = $user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists();

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $leaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }

        $leave = $leaveQuery->orderBy('created_at', 'desc')->get();

        $leaveList = $leave->map(function ($leave) {
            $leaveCredits = LeaveCredit::getOrCreateForEmployee($leave->employee_id);

            return [
                'id'                  => $leave->id,
                'leave_type'          => $leave->leave_type,
                'leave_start_date'    => $leave->leave_start_date->format('d M Y'),
                'leave_end_date'      => $leave->leave_end_date->format('d M Y'),
                'leave_days'          => $leave->leave_days,
                'status'              => $leave->leave_status,
                'leave_reason'        => $leave->leave_reason,
                'leave_date_reported' => $leave->leave_date_reported->format('d M Y'),
                'leave_date_approved' => $leave->leave_date_approved,
                'leave_comments'      => $leave->leave_comments,
                'created_at'          => $leave->created_at->format('d M Y'),
                'employee_name'       => $leave->employee ? $leave->employee->employee_name : null,
                'picture'       => $leave->employee ? $leave->employee->picture : null,
                'department'       => $leave->employee ? $leave->employee->department : null,
                'employeeid'       => $leave->employee ? $leave->employee->employeeid : null,
                'position'       => $leave->employee ? $leave->employee->position : null,
                'remaining_credits'   => $leaveCredits->remaining_credits,
                'used_credits'        => $leaveCredits->used_credits,
                'total_credits'       => $leaveCredits->total_credits,
                'supervisor_status'   => $leave->supervisor_status,
                'hr_status'           => $leave->hr_status,
            ];
        })->toArray();

        $employeeQuery = Employee::select('id', 'employeeid', 'employee_name', 'department', 'position');
        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }
        $employees = $employeeQuery->get();

        $totalLeaves = Leave::count();
        $pendingLeaves = Leave::where('leave_status', 'Pending')->count();
        $approvedLeaves = Leave::where('leave_status', 'Approved')->count();
        $rejectedLeaves = Leave::where('leave_status', 'Rejected')->count();
        $cancelledLeaves = Leave::where('leave_status', 'Cancelled')->count();
        $approvalRate = $totalLeaves > 0 ? round(($approvedLeaves / $totalLeaves) * 100, 2) : 0;

        $employeesWithCredits = $employees->map(function ($employee) {
            $leaveCredits = LeaveCredit::getOrCreateForEmployee($employee->id);
            return [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'department' => $employee->department,
                'position' => $employee->position,
                'remaining_credits' => $leaveCredits->remaining_credits,
                'used_credits' => $leaveCredits->used_credits,
                'total_credits' => $leaveCredits->total_credits,
            ];
        })->toArray();

        $prevMonthStart = now()->subMonth()->startOfMonth();
        $prevMonthEnd = now()->subMonth()->endOfMonth();
        $prevTotalLeaves = Leave::whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();
        $prevPendingLeaves = Leave::where('leave_status', 'Pending')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();
        $prevApprovedLeaves = Leave::where('leave_status', 'Approved')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();
        $prevRejectedLeaves = Leave::where('leave_status', 'Rejected')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();
        $prevCancelledLeaves = Leave::where('leave_status', 'Cancelled')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();
        $prevApprovalRate = $prevTotalLeaves > 0 ? round(($prevApprovedLeaves / $prevTotalLeaves) * 100, 2) : 0;

        $leaveStats = [
            'totalLeaves' => $totalLeaves,
            'pendingLeaves' => $pendingLeaves,
            'approvedLeaves' => $approvedLeaves,
            'rejectedLeaves' => $rejectedLeaves,
            'cancelledLeaves' => $cancelledLeaves,
            'approvalRate' => $approvalRate,
            'prevTotalLeaves' => $prevTotalLeaves,
            'prevPendingLeaves' => $prevPendingLeaves,
            'prevApprovedLeaves' => $prevApprovedLeaves,
            'prevRejectedLeaves' => $prevRejectedLeaves,
            'prevCancelledLeaves' => $prevCancelledLeaves,
            'prevApprovalRate' => $prevApprovalRate,
        ];

        return Inertia::render('leave/index', [
            'leave'     => $leaveList,
            'employees' => $employeesWithCredits,
            'leaveStats' => $leaveStats,
        ]);
    }

    public function create()
    {
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'employee_id' => 'required|exists:employees,id',
                'leave_type' => 'required|string',
                'leave_start_date' => 'required|date',
                'leave_end_date' => 'required|date|after_or_equal:leave_start_date',
                'leave_days' => 'required|integer|min:1',
                'leave_reason' => 'required|string',
                'leave_date_reported' => 'required|date',
            ]);

            $employee = Employee::find($request->employee_id);
            $leaveCredits = LeaveCredit::getOrCreateForEmployee($employee->id);

            if ($leaveCredits->remaining_credits < $request->leave_days) {
                return redirect()->back()->with('error', 'Insufficient leave credits. Employee has ' . $leaveCredits->remaining_credits . ' credits remaining but requesting ' . $request->leave_days . ' days (' . $request->leave_days . ' credits).');
            }

            $leave = new Leave();
            $leave->employee_id = $request->employee_id;
            $leave->leave_type = $request->leave_type;
            $leave->leave_start_date = $request->leave_start_date;
            $leave->leave_end_date = $request->leave_end_date;
            $leave->leave_days = $request->leave_days;
            $leave->leave_reason = $request->leave_reason;
            $leave->leave_date_reported = $request->leave_date_reported;
            $leave->leave_status = 'Pending Supervisor Approval';
            $leave->supervisor_status = 'pending';
            $leave->hr_status = null;
            $leave->leave_comments = $request->leave_comments ?? '';

            $leave->save();

            Log::info('[LEAVE STORE] Leave created successfully:', [
                'leave_id' => $leave->id,
                'employee_id' => $leave->employee_id,
                'leave_status' => $leave->leave_status,
                'supervisor_status' => $leave->supervisor_status,
                'hr_status' => $leave->hr_status,
            ]);

            $employee = Employee::find($request->employee_id);
            $supervisor = User::getSupervisorForDepartment($employee->department);

            Log::info('[LEAVE STORE] Supervisor lookup:', [
                'leave_id' => $leave->id,
                'employee_id' => $request->employee_id,
                'employee_name' => $employee ? $employee->employee_name : 'N/A',
                'department' => $employee->department,
                'supervisor_id' => $supervisor ? $supervisor->id : 'NONE',
                'supervisor_name' => $supervisor ? $supervisor->fullname : 'NONE',
            ]);

            if ($supervisor) {
                Notification::create([
                    'type' => 'leave_request',
                    'user_id' => $supervisor->id,
                    'data' => [
                        'leave_id' => $leave->id,
                        'employee_name' => $employee ? $employee->employee_name : null,
                        'leave_type' => $leave->leave_type,
                        'leave_start_date' => $leave->leave_start_date,
                        'leave_end_date' => $leave->leave_end_date,
                        'department' => $employee->department,
                        'stage' => 'supervisor_approval',
                    ],
                ]);
                Log::info('[LEAVE STORE] Notification created for supervisor:', [
                    'leave_id' => $leave->id,
                    'supervisor_id' => $supervisor->id,
                    'supervisor_name' => $supervisor->fullname,
                ]);
            } else {
                Log::warning('[LEAVE STORE] No supervisor found for department:', [
                    'leave_id' => $leave->id,
                    'department' => $employee->department,
                ]);
            }

            try {
                Log::info('[LEAVE STORE] Broadcasting LeaveRequested event...', [
                    'leave_id' => $leave->id,
                    'department' => $employee->department,
                    'supervisor_id' => $supervisor ? $supervisor->id : null,
                ]);

                event(new LeaveRequested($leave));

                Log::info('[LEAVE STORE] LeaveRequested event broadcasted successfully:', [
                    'leave_id' => $leave->id,
                ]);
            } catch (\Exception $broadcastError) {
                Log::error('[LEAVE STORE] Failed to broadcast LeaveRequested event:', [
                    'leave_id' => $leave->id,
                    'error' => $broadcastError->getMessage(),
                    'trace' => $broadcastError->getTraceAsString(),
                ]);
            }

            if ($request->expectsJson() || $request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Leave request submitted successfully!',
                    'leave_id' => $leave->id,
                ]);
            }

            if ($request->routeIs('employee-view.leave.store')) {
                return redirect()->route('employee-view.leave')->with('success', 'Leave request submitted successfully!');
            }

            return redirect()->route('leave.index')->with('success', 'Leave request submitted successfully!');
        } catch (Exception $e) {
            Log::error('[LEAVE STORE] Leave creation failed:', [
                'employee_id' => $request->employee_id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'An error occurred while creating the leave request. Please try again!');
        }
    }

    public function show(Leave $leave)
    {
    }

    public function edit(Leave $leave)
    {
        $leave->load(['employee', 'supervisorApprover', 'hrApprover']);

        Log::info('[LEAVE EDIT] Loading leave for edit:', [
            'leave_id' => $leave->id,
            'leave_status' => $leave->leave_status,
            'supervisor_status' => $leave->supervisor_status,
            'hr_status' => $leave->hr_status,
        ]);

        return Inertia::render('leave/edit', [
            'leave' => [
                'id' => $leave->id,
                'leave_type' => $leave->leave_type,
                'leave_start_date' => $leave->leave_start_date,
                'leave_end_date' => $leave->leave_end_date,
                'leave_days' => $leave->leave_days,
                'leave_reason' => $leave->leave_reason,
                'leave_comments' => $leave->leave_comments,
                'leave_status' => $leave->leave_status,
                'leave_date_reported' => $leave->leave_date_reported,
                'leave_date_approved' => $leave->leave_date_approved,
                'supervisor_status' => $leave->supervisor_status,
                'supervisor_approved_by' => $leave->supervisor_approved_by,
                'supervisor_approved_at' => $leave->supervisor_approved_at,
                'supervisor_comments' => $leave->supervisor_comments,
                'supervisor_approver' => $leave->supervisorApprover ? [
                    'id' => $leave->supervisorApprover->id,
                    'name' => $leave->supervisorApprover->fullname,
                    'email' => $leave->supervisorApprover->email,
                ] : null,
                'hr_status' => $leave->hr_status,
                'hr_approved_by' => $leave->hr_approved_by,
                'hr_approved_at' => $leave->hr_approved_at,
                'hr_comments' => $leave->hr_comments,
                'hr_approver' => $leave->hrApprover ? [
                    'id' => $leave->hrApprover->id,
                    'name' => $leave->hrApprover->fullname,
                    'email' => $leave->hrApprover->email,
                ] : null,
                'employee' => $leave->employee ? [
                    'employeeid' => $leave->employee->employeeid,
                    'employee_name' => $leave->employee->employee_name,
                    'department' => $leave->employee->department,
                    'email' => $leave->employee->email,
                    'position' => $leave->employee->position,
                    'picture' => $leave->employee->picture,
                ] : null,
            ],
        ]);
    }

    public function update(Request $request, Leave $leave)
    {
        try {
            $user = Auth::user();
            $isSupervisor = $user->isSupervisor();
            $isHR = $user->isHR();
            $isSuperAdmin = $user->isSuperAdmin();

            Log::info('[LEAVE UPDATE] Update request received:', [
                'leave_id' => $leave->id,
                'user_id' => $user->id,
                'user_name' => $user->fullname,
                'is_supervisor' => $isSupervisor,
                'is_hr' => $isHR,
                'is_super_admin' => $isSuperAdmin,
                'current_status' => $leave->leave_status,
                'supervisor_status' => $leave->supervisor_status,
                'hr_status' => $leave->hr_status,
                'request_data' => $request->only(['leave_status', 'supervisor_status', 'hr_status', 'supervisor_comments', 'hr_comments']),
            ]);

            if ($leave) {
                $oldStatus = $leave->leave_status;
                $oldSupervisorStatus = $leave->supervisor_status;
                $oldHRStatus = $leave->hr_status;

                $leave->leave_start_date = $request->leave_start_date;
                $leave->leave_end_date = $request->leave_end_date;
                $leave->leave_type = $request->leave_type;
                $leave->leave_days = $request->leave_days;
                $leave->leave_date_reported = $request->leave_date_reported;
                $leave->leave_reason = $request->leave_reason;

                if ($request->has('supervisor_status') && ($isSupervisor || $isSuperAdmin)) {
                    if (!$isSuperAdmin) {
                        $employee = $leave->employee;
                        if (!$employee || !$user->canEvaluateDepartment($employee->department)) {
                            $supervisedDepartments = $this->getEvaluableDepartmentsForUser($user);
                            Log::warning('[LEAVE UPDATE] User attempted to approve leave outside their department:', [
                                'leave_id' => $leave->id,
                                'user_id' => $user->id,
                                'employee_department' => $employee ? $employee->department : 'N/A',
                                'supervised_departments' => $supervisedDepartments,
                            ]);
                            return redirect()->back()->with('error', 'You do not have permission to approve leaves for this department.');
                        }
                    }

                    $supervisorStatus = strtolower($request->supervisor_status);

                    Log::info('[LEAVE UPDATE] Processing supervisor approval:', [
                        'leave_id' => $leave->id,
                        'supervisor_status' => $supervisorStatus,
                        'old_supervisor_status' => $oldSupervisorStatus,
                        'supervisor_id' => $user->id,
                        'employee_department' => $leave->employee ? $leave->employee->department : 'N/A',
                    ]);

                    if (in_array($supervisorStatus, ['approved', 'rejected'])) {
                        $leave->supervisor_status = $supervisorStatus;
                        $leave->supervisor_approved_by = $user->id;
                        $leave->supervisor_approved_at = now();
                        $leave->supervisor_comments = $request->supervisor_comments ?? $leave->supervisor_comments;

                        if ($supervisorStatus === 'approved') {
                            $leave->leave_status = 'Pending HR Approval';
                            $leave->hr_status = 'pending';

                            Log::info('[LEAVE UPDATE] Supervisor approved, moving to HR approval:', [
                                'leave_id' => $leave->id,
                                'new_status' => $leave->leave_status,
                                'hr_status' => $leave->hr_status,
                            ]);

                            $employee = $leave->employee;
                            if ($employee) {
                                $hrPersonnel = User::getAllHRForDepartment($employee->department);

                                Log::info('[LEAVE UPDATE] Notifying HR personnel:', [
                                    'leave_id' => $leave->id,
                                    'department' => $employee->department,
                                    'hr_count' => $hrPersonnel->count(),
                                    'hr_ids' => $hrPersonnel->pluck('id')->toArray(),
                                ]);

                                foreach ($hrPersonnel as $hr) {
                                    Notification::create([
                                        'type' => 'leave_request',
                                        'user_id' => $hr->id,
                                        'data' => [
                                            'leave_id' => $leave->id,
                                            'employee_name' => $employee->employee_name,
                                            'leave_type' => $leave->leave_type,
                                            'leave_start_date' => $leave->leave_start_date,
                                            'leave_end_date' => $leave->leave_end_date,
                                            'department' => $employee->department,
                                            'supervisor_approved' => true,
                                            'supervisor_name' => $user->fullname,
                                        ],
                                    ]);
                                }

                                event(new LeaveRequested($leave));
                            }
                        } elseif ($supervisorStatus === 'rejected') {
                            $leave->leave_status = 'Rejected by Supervisor';
                            $leave->hr_status = null;

                            Log::info('[LEAVE UPDATE] Supervisor rejected:', [
                                'leave_id' => $leave->id,
                                'new_status' => $leave->leave_status,
                                'comments' => $leave->supervisor_comments,
                            ]);

                            event(new RequestStatusUpdated('leave', 'Rejected by Supervisor', $leave->employee_id, $leave->id, [
                                'leave_type' => $leave->leave_type,
                                'leave_start_date' => $leave->leave_start_date,
                                'leave_end_date' => $leave->leave_end_date,
                                'reason' => $leave->supervisor_comments,
                                'rejected_by' => 'Supervisor',
                                'rejected_by_name' => $user->fullname,
                            ]));
                        }
                    }
                }

                if ($request->has('hr_status') && ($isHR || $isSuperAdmin)) {
                    $hrStatus = strtolower($request->hr_status);

                    Log::info('[LEAVE UPDATE] Processing HR approval:', [
                        'leave_id' => $leave->id,
                        'hr_status' => $hrStatus,
                        'old_hr_status' => $oldHRStatus,
                        'supervisor_status' => $leave->supervisor_status,
                    ]);

                    if ($leave->supervisor_status !== 'approved') {
                        Log::warning('[LEAVE UPDATE] HR attempted approval but supervisor has not approved:', [
                            'leave_id' => $leave->id,
                            'supervisor_status' => $leave->supervisor_status,
                        ]);
                        return redirect()->back()->with('error', 'Supervisor approval is required before HR can approve.');
                    }

                    if (in_array($hrStatus, ['approved', 'rejected'])) {
                        $leave->hr_status = $hrStatus;
                        $leave->hr_approved_by = $user->id;
                        $leave->hr_approved_at = now();
                        $leave->hr_comments = $request->hr_comments ?? $leave->hr_comments;

                        if (!empty($request->leave_date_approved)) {
                            $leave->leave_date_approved = $request->leave_date_approved;
                        } else {
                            $leave->leave_date_approved = now()->format('Y-m-d');
                        }

                        if ($hrStatus === 'approved') {
                            $leave->leave_status = 'Approved';

                            Log::info('[LEAVE UPDATE] HR approved - Final approval:', [
                                'leave_id' => $leave->id,
                                'new_status' => $leave->leave_status,
                                'leave_date_approved' => $leave->leave_date_approved,
                            ]);

                            $leaveCredits = LeaveCredit::getOrCreateForEmployee($leave->employee_id);

                            if ($oldStatus !== 'Approved') {
                                $leaveCredits->useCredits($leave->leave_days);
                                Log::info('[LEAVE UPDATE] Credits deducted:', [
                                    'leave_id' => $leave->id,
                                    'days' => $leave->leave_days,
                                    'remaining_credits' => $leaveCredits->remaining_credits,
                                ]);
                            }

                            event(new RequestStatusUpdated('leave', 'Approved', $leave->employee_id, $leave->id, [
                                'leave_type' => $leave->leave_type,
                                'leave_start_date' => $leave->leave_start_date,
                                'leave_end_date' => $leave->leave_end_date,
                                'approved_by' => 'HR',
                                'approved_by_name' => $user->fullname,
                            ]));
                        } elseif ($hrStatus === 'rejected') {
                            $leave->leave_status = 'Rejected by HR';

                            Log::info('[LEAVE UPDATE] HR rejected:', [
                                'leave_id' => $leave->id,
                                'new_status' => $leave->leave_status,
                                'comments' => $leave->hr_comments,
                            ]);

                            event(new RequestStatusUpdated('leave', 'Rejected by HR', $leave->employee_id, $leave->id, [
                                'leave_type' => $leave->leave_type,
                                'leave_start_date' => $leave->leave_start_date,
                                'leave_end_date' => $leave->leave_end_date,
                                'reason' => $leave->hr_comments,
                                'rejected_by' => 'HR',
                                'rejected_by_name' => $user->fullname,
                            ]));
                        }
                    }
                }

                if (
                    $isSuperAdmin && $request->has('leave_status') &&
                    !($request->has('hr_status') && in_array(strtolower($request->hr_status), ['approved', 'rejected'])) &&
                    !($request->has('supervisor_status') && in_array(strtolower($request->supervisor_status), ['approved', 'rejected']))
                ) {
                    $newStatus = $request->leave_status;

                    Log::info('[LEAVE UPDATE] Super Admin override status:', [
                        'leave_id' => $leave->id,
                        'old_status' => $oldStatus,
                        'new_status' => $newStatus,
                    ]);

                    $leave->leave_status = $newStatus;
                    $leave->leave_comments = $request->leave_comments ?? $leave->leave_comments;

                    if (!empty($request->leave_date_approved)) {
                        $leave->leave_date_approved = $request->leave_date_approved;
                    } elseif (in_array($newStatus, ['Approved', 'Pending HR Approval'])) {
                        $leave->leave_date_approved = now()->format('Y-m-d');
                    }

                    $leaveCredits = LeaveCredit::getOrCreateForEmployee($leave->employee_id);

                    if ($newStatus === 'Approved' && $oldStatus !== 'Approved') {
                        $leaveCredits->useCredits($leave->leave_days);
                        Log::info('[LEAVE UPDATE] Credits deducted (Super Admin):', [
                            'leave_id' => $leave->id,
                            'days' => $leave->leave_days,
                        ]);
                    } elseif ($oldStatus === 'Approved' && $newStatus !== 'Approved') {
                        $leaveCredits->refundCredits($leave->leave_days);
                        Log::info('[LEAVE UPDATE] Credits refunded (Super Admin):', [
                            'leave_id' => $leave->id,
                            'days' => $leave->leave_days,
                        ]);
                    }

                    if ($oldStatus !== $newStatus) {
                        event(new RequestStatusUpdated('leave', $newStatus, $leave->employee_id, $leave->id, [
                            'leave_type' => $leave->leave_type,
                            'leave_start_date' => $leave->leave_start_date,
                            'leave_end_date' => $leave->leave_end_date,
                        ]));
                    }
                } else {
                    $leave->leave_comments = $request->leave_comments ?? $leave->leave_comments;
                }

                $leave->save();

                Log::info('[LEAVE UPDATE] Leave updated successfully:', [
                    'leave_id' => $leave->id,
                    'final_status' => $leave->leave_status,
                    'supervisor_status' => $leave->supervisor_status,
                    'hr_status' => $leave->hr_status,
                    'supervisor_approved_by' => $leave->supervisor_approved_by,
                    'hr_approved_by' => $leave->hr_approved_by,
                ]);

                return redirect()->route('leave.index')->with('success', 'Leave updated successfully!');
            }
        } catch (Exception $e) {
            Log::error('[LEAVE UPDATE] Update failed:', [
                'leave_id' => $leave->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'An error occurred while updating the leave. Please try again!');
        }
    }

    public function destroy($id)
    {
        $leave = Leave::findOrFail($id);
        $leave->delete();
        return redirect()->back()->with('success', 'Leave deleted');
    }

    public function employeeIndex()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        if (!$employee) {
            Session::forget(['employee_id', 'employee_name']);
            return redirect()->route('employeelogin');
        }

        $leaveRequests = Leave::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($leave) use ($employee) {
                $leaveCredits = LeaveCredit::getOrCreateForEmployee($leave->employee_id);
                return [
                    'id' => $leave->id,
                    'leave_type' => $leave->leave_type,
                    'leave_start_date' => $leave->leave_start_date->format('Y-m-d'),
                    'leave_end_date' => $leave->leave_end_date->format('Y-m-d'),
                    'leave_days' => $leave->leave_days,
                    'leave_status' => $leave->leave_status,
                    'leave_reason' => $leave->leave_reason,
                    'leave_date_reported' => $leave->leave_date_reported->format('Y-m-d'),
                    'leave_date_approved' => $leave->leave_date_approved ? $leave->leave_date_approved->format('Y-m-d') : null,
                    'leave_comments' => $leave->leave_comments,
                    'created_at' => $leave->created_at->format('Y-m-d H:i:s'),
                    'employee_name' => $employee->employee_name,
                    'picture' => $employee->picture,
                    'department' => $employee->department,
                    'employeeid' => $employee->employeeid,
                    'position' => $employee->position,
                    'remaining_credits' => $leaveCredits->remaining_credits,
                    'used_credits' => $leaveCredits->used_credits,
                    'total_credits' => $leaveCredits->total_credits,
                ];
            })->toArray();

        $totalLeaves = Leave::where('employee_id', $employee->id)->count();
        $pendingLeaves = Leave::where('employee_id', $employee->id)->where('leave_status', 'Pending')->count();
        $approvedLeaves = Leave::where('employee_id', $employee->id)->where('leave_status', 'Approved')->count();
        $rejectedLeaves = Leave::where('employee_id', $employee->id)->where('leave_status', 'Rejected')->count();
        $cancelledLeaves = Leave::where('employee_id', $employee->id)->where('leave_status', 'Cancelled')->count();

        $leaveStats = [
            'totalLeaves' => $totalLeaves,
            'pendingLeaves' => $pendingLeaves,
            'approvedLeaves' => $approvedLeaves,
            'rejectedLeaves' => $rejectedLeaves,
            'cancelledLeaves' => $cancelledLeaves,
        ];

        return Inertia::render('employee-view/request-form/leave/index', [
            'leaveRequests' => $leaveRequests,
            'leaveStats' => $leaveStats,
            'employee' => $employee,
        ]);
    }

    public function creditSummary()
    {
        $user = Auth::user();
        $isSupervisor = $user->isSupervisor();
        $isSuperAdmin = $user->isSuperAdmin();

        $supervisedDepartments = $this->getEvaluableDepartmentsForUser($user);

        $employeeQuery = Employee::select('id', 'employeeid', 'employee_name', 'department', 'position');
        $isHR = $user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists();
        $isManager = $user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists();

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }
        $employees = $employeeQuery->get();

        $employeesWithCredits = $employees->map(function ($employee) {
            $leaveCredits = LeaveCredit::getOrCreateForEmployee($employee->id);
            return [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'department' => $employee->department,
                'position' => $employee->position,
                'remaining_credits' => $leaveCredits->remaining_credits,
                'used_credits' => $leaveCredits->used_credits,
                'total_credits' => $leaveCredits->total_credits,
            ];
        })->toArray();

        $monthlyLeaveStats = $this->getMonthlyLeaveStats($supervisedDepartments);

        return Inertia::render('leave/leave-credit', [
            'employees' => $employeesWithCredits,
            'monthlyLeaveStats' => $monthlyLeaveStats,
            'user_permissions' => [
                'is_supervisor' => $isSupervisor,
                'is_super_admin' => $isSuperAdmin,
                'supervised_departments' => $supervisedDepartments,
            ],
        ]);
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
            ->whereBetween('leave_start_date', [$startDate, $endDate])
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
                return $leave->leave_start_date->format('Y-m') === $date->format('Y-m');
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

    public function sendEmail(Request $request, Leave $leave)
    {
        try {
            $user = Auth::user();
            $isHR = $user->isHR();
            $isSuperAdmin = $user->isSuperAdmin();

            if (!$isHR && !$isSuperAdmin) {
                Log::warning('[LEAVE SEND EMAIL] Unauthorized attempt to send email:', [
                    'leave_id' => $leave->id,
                    'user_id' => $user->id,
                    'user_name' => $user->fullname,
                ]);

                return redirect()->back()->with('error', 'Only HR personnel can send leave approval emails.');
            }

            $leave->load(['employee', 'supervisorApprover', 'hrApprover']);

            if (!$leave->employee) {
                Log::warning('[LEAVE SEND EMAIL] Employee not found:', [
                    'leave_id' => $leave->id,
                    'employee_id' => $leave->employee_id,
                ]);

                return redirect()->back()->with('error', 'Employee not found.');
            }

            if (!$leave->employee->email) {
                Log::warning('[LEAVE SEND EMAIL] Employee email not found:', [
                    'leave_id' => $leave->id,
                    'employee_id' => $leave->employee_id,
                    'employee_name' => $leave->employee->employee_name,
                ]);

                return redirect()->back()->with('error', 'Employee email address is not set. Please update the employee profile with a valid email address.');
            }

            $email = trim($leave->employee->email);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Log::warning('[LEAVE SEND EMAIL] Invalid email format:', [
                    'leave_id' => $leave->id,
                    'employee_id' => $leave->employee_id,
                    'employee_name' => $leave->employee->employee_name,
                    'invalid_email' => $email,
                ]);

                return redirect()->back()->with('error', 'Invalid email address format: "' . $email . '". Please update the employee profile with a valid email address (e.g., user@example.com).');
            }

            Mail::to($email)->send(new LeaveApprovalEmail($leave));

            Log::info('[LEAVE SEND EMAIL] Email sent successfully:', [
                'leave_id' => $leave->id,
                'employee_id' => $leave->employee_id,
                'employee_email' => $email,
                'sent_by' => $user->id,
                'sent_by_name' => $user->fullname,
            ]);

            return redirect()->back()->with('success', 'Email sent successfully to ' . $email);
        } catch (Exception $e) {
            Log::error('[LEAVE SEND EMAIL] Failed to send email:', [
                'leave_id' => $leave->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Failed to send email: ' . $e->getMessage());
        }
    }

    public function approvedLeaves(): Response
    {
        $leaves = Leave::with(['employee', 'supervisorApprover', 'hrApprover'])
            ->where(function ($query) {
                $query->where('hr_status', 'approved')
                    ->orWhere('leave_status', 'Approved');
            })
            ->orderBy('leave_date_approved', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $approvedLeaves = $leaves->map(function ($leave) {
            $department = $leave->employee ? $leave->employee->department : null;

            $departmentHR = null;
            if ($department) {
                $hrUser = User::getHRForDepartment($department);
                if ($hrUser) {
                    $departmentHR = [
                        'id' => $hrUser->id,
                        'name' => $hrUser->fullname,
                    ];
                }
            }

            $departmentManager = null;
            if ($department) {
                $managerAssignment = ManagerDepartmentAssignment::where('department', $department)
                    ->with('user')
                    ->first();
                if ($managerAssignment && $managerAssignment->user) {
                    $departmentManager = [
                        'id' => $managerAssignment->user->id,
                        'name' => $managerAssignment->user->fullname,
                    ];
                }
            }

            $usedCredits = null;
            $remainingCredits = null;
            if ($leave->employee) {
                $leaveCredits = LeaveCredit::getOrCreateForEmployee($leave->employee->id);
                $usedCredits = $leaveCredits->used_credits;
                $remainingCredits = $leaveCredits->remaining_credits;
            }

            return [
                'id' => $leave->id,
                'leave_type' => $leave->leave_type,
                'leave_start_date' => $leave->leave_start_date->format('Y-m-d'),
                'leave_end_date' => $leave->leave_end_date->format('Y-m-d'),
                'leave_days' => $leave->leave_days,
                'status' => $leave->leave_status,
                'leave_reason' => $leave->leave_reason,
                'leave_date_reported' => $leave->leave_date_reported->format('Y-m-d'),
                'leave_date_approved' => $leave->leave_date_approved ? $leave->leave_date_approved->format('Y-m-d') : null,
                'leave_comments' => $leave->leave_comments,
                'employee_name' => $leave->employee ? $leave->employee->employee_name : null,
                'employeeid' => $leave->employee ? $leave->employee->employeeid : null,
                'department' => $department,
                'position' => $leave->employee ? $leave->employee->position : null,
                'picture' => $leave->employee ? $leave->employee->picture : null,
                'supervisor_approver' => $leave->supervisorApprover ? [
                    'id' => $leave->supervisorApprover->id,
                    'name' => $leave->supervisorApprover->fullname,
                ] : null,
                'hr_approver' => $leave->hrApprover ? [
                    'id' => $leave->hrApprover->id,
                    'name' => $leave->hrApprover->fullname,
                ] : null,
                'department_hr' => $departmentHR,
                'department_manager' => $departmentManager,
                'used_credits' => $usedCredits,
                'remaining_credits' => $remainingCredits,
            ];
        })->toArray();

        return Inertia::render('report/employee-leave-list', [
            'leaves' => $approvedLeaves,
        ]);
    }
}
