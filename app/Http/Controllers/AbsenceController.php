<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Employee;
use App\Models\LeaveCredit;
use App\Models\AbsenceCredit;
use App\Models\User;
use App\Models\SupervisorDepartment;
use App\Models\HRDepartmentAssignment;
use App\Traits\EmployeeFilterTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Exception;
use App\Events\AbsenceRequested;
use App\Events\AbsenceSupervisorApproved;
use App\Events\AbsenceHRApproved;
use App\Events\RequestStatusUpdated;
use App\Models\Notification;

class AbsenceController extends Controller
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

        // Base query for absences
        $absenceQuery = Absence::with('employee', 'approver');

        // Filter absences based on user role
        // HR and Manager already get all absences, so only filter for Admin and Supervisor
        $isHR = $user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists();
        $isManager = $user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists();

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $absenceQuery->whereIn('department', $supervisedDepartments);
        }

        $absences = $absenceQuery->orderBy('submitted_at', 'desc')->get();

        $absenceList = $absences->map(function ($absence) {
            $absenceCredits = AbsenceCredit::getOrCreateForEmployee($absence->employee_id);
            return [
                'id' => $absence->id,
                'full_name' => $absence->full_name,
                'employee_id_number' => $absence->employee_id_number,
                'department' => $absence->department,
                'position' => $absence->position,
                'absence_type' => $absence->absence_type,
                'from_date' => $absence->from_date->format('d M Y'),
                'to_date' => $absence->to_date->format('d M Y'),
                'is_partial_day' => $absence->is_partial_day,
                'reason' => $absence->reason,
                'status' => $absence->status,
                'submitted_at' => $absence->submitted_at->format('d M Y'),
                'approved_at' => $absence->approved_at?->format('d M Y'),
                'days' => $absence->days,
                'employee_name' => $absence->employee ? $absence->employee->employee_name : $absence->full_name,
                'picture' => $absence->employee ? $absence->employee->picture : null,
                'remaining_credits' => $absenceCredits->remaining_credits,
                'used_credits' => $absenceCredits->used_credits,
                'total_credits' => $absenceCredits->total_credits,
                'supervisor_status' => $absence->supervisor_status,
                'hr_status' => $absence->hr_status,
            ];
        })->toArray();

        // Fetch employees for the add modal dropdown - filter by user role
        $employeeQuery = Employee::select('id', 'employeeid', 'employee_name', 'department', 'position');
        $isHR = $user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists();
        $isManager = $user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists();

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }
        $employees = $employeeQuery->get();

        // Add absence credits information for each employee
        $employeesWithCredits = $employees->map(function ($employee) {
            $absenceCredits = AbsenceCredit::getOrCreateForEmployee($employee->id);
            return [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'department' => $employee->department,
                'position' => $employee->position,
                'remaining_credits' => $absenceCredits->remaining_credits,
                'used_credits' => $absenceCredits->used_credits,
                'total_credits' => $absenceCredits->total_credits,
            ];
        })->toArray();

        // Get monthly absence statistics for the chart
        $monthlyAbsenceStats = $this->getMonthlyAbsenceStats($supervisedDepartments);

        return Inertia::render('absence/index', [
            'absences' => $absenceList,
            'employees' => $employeesWithCredits,
            'monthlyAbsenceStats' => $monthlyAbsenceStats,
            'user_permissions' => [
                'is_supervisor' => $isSupervisor,
                'is_super_admin' => $isSuperAdmin,
                'supervised_departments' => $supervisedDepartments,
            ],
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
     * Display the employee absence index page.
     */
    public function employeeIndex()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        if (!$employee) {
            Session::forget(['employee_id', 'employee_name']);
            return redirect()->route('employeelogin');
        }

        return Inertia::render('employee-view/request-form/absence/index', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Log the incoming request data for debugging
            Log::info('Absence request data:', $request->all());

            $validated = $request->validate([
                'employee_id' => 'nullable|exists:employees,id',
                'full_name' => 'required|string|max:255',
                'employee_id_number' => 'required|string|max:255',
                'department' => 'required|string|max:255',
                'position' => 'required|string|max:255',
                'absence_type' => 'required|in:Annual Leave,Personal Leave,Maternity/Paternity,Sick Leave,Emergency Leave,Other',
                'from_date' => 'required|date',
                'to_date' => 'required|date|after_or_equal:from_date',
                'is_partial_day' => 'boolean',
                'reason' => 'required|string|min:5',
            ]);

            Log::info('Validated absence data:', $validated);

            $absence = Absence::create([
                'employee_id' => $validated['employee_id'],
                'full_name' => $validated['full_name'],
                'employee_id_number' => $validated['employee_id_number'],
                'department' => $validated['department'],
                'position' => $validated['position'],
                'absence_type' => $validated['absence_type'],
                'from_date' => $validated['from_date'],
                'to_date' => $validated['to_date'],
                'is_partial_day' => $validated['is_partial_day'] ?? false,
                'reason' => $validated['reason'],
                'status' => 'Pending Supervisor Approval', // Two-stage workflow status
                'supervisor_status' => 'pending', // Initial supervisor status
                'hr_status' => null, // HR cannot approve yet
                'submitted_at' => now(),
            ]);

            // Load relationships for broadcasting
            $absence->load(['employee', 'supervisorApprover', 'hrApprover']);

            Log::info('Absence created successfully:', ['id' => $absence->id, 'days' => $absence->days]);

            // Get employee and supervisor info for debugging
            $employee = Employee::find($validated['employee_id']);
            $supervisor = User::getSupervisorForDepartment($validated['department']);

            Log::info('Absence submission - Supervisor lookup:', [
                'employee_id' => $validated['employee_id'],
                'employee_name' => $employee ? $employee->employee_name : 'N/A',
                'department' => $validated['department'],
                'supervisor_id' => $supervisor ? $supervisor->id : 'NONE',
                'supervisor_name' => $supervisor ? $supervisor->name : 'NONE',
            ]);

            // Broadcast to managers/HR/supervisors
            try {
                Log::info('Broadcasting AbsenceRequested event...', [
                    'absence_id' => $absence->id,
                    'department' => $validated['department'],
                    'supervisor_id' => $supervisor ? $supervisor->id : null,
                ]);

                event(new AbsenceRequested($absence));

                Log::info('AbsenceRequested event broadcasted successfully');
            } catch (\Exception $broadcastError) {
                Log::error('Failed to broadcast AbsenceRequested event:', [
                    'error' => $broadcastError->getMessage(),
                    'trace' => $broadcastError->getTraceAsString(),
                ]);
            }

            // Create notification for the supervisor of the employee's department
            try {
                if ($supervisor) {
                    Notification::create([
                        'type' => 'absence_request',
                        'user_id' => $supervisor->id,
                        'data' => [
                            'absence_id' => $absence->id,
                            'employee_name' => $employee ? $employee->employee_name : $validated['full_name'],
                            'absence_type' => $absence->absence_type,
                            'from_date' => $absence->from_date,
                            'to_date' => $absence->to_date,
                            'department' => $validated['department'],
                        ],
                    ]);
                    Log::info('Notification created for supervisor:', ['supervisor_id' => $supervisor->id]);
                } else {
                    Log::warning('No supervisor found for department:', ['department' => $validated['department']]);
                }
            } catch (Exception $notificationError) {
                Log::error('Failed to create notification:', ['error' => $notificationError->getMessage()]);
                // Don't fail the entire request if notification creation fails
            }

            // Return JSON for axios requests, redirect for form submissions
            if ($request->expectsJson() || $request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Absence request submitted successfully!',
                    'absence_id' => $absence->id,
                ]);
            }

            if ($request->routeIs('employee-view.absence.store')) {
                return redirect()->route('employee-view.absence')->with('success', 'Absence request submitted successfully!');
            }

            return redirect()->route('absence.index')->with('success', 'Absence request submitted successfully!');
        } catch (Exception $e) {
            Log::error('Absence creation failed:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            if ($request->expectsJson()) {
                return response()->json(['error' => 'Failed to submit absence request. Please try again.'], 500);
            }

            return redirect()->back()->with('error', 'Failed to submit absence request. Please try again.');
        }
    }

    /**
     * Display the approval page.
     */
    public function approve()
    {
        $user = Auth::user();
        $isSupervisor = $user->isSupervisor();
        $isSuperAdmin = $user->isSuperAdmin();

        // Get user's supervised departments if supervisor
        $supervisedDepartments = $isSupervisor ? $user->getEvaluableDepartments() : [];

        // Base query for absences - load all relationships
        $absenceQuery = Absence::with('employee', 'approver', 'supervisorApprover', 'hrApprover');

        // Filter absences based on user role
        if ($isSupervisor && !empty($supervisedDepartments)) {
            $absenceQuery->whereIn('department', $supervisedDepartments);
        }

        $absences = $absenceQuery->orderBy('submitted_at', 'desc')->get();

        $absenceList = $absences->transform(fn($absence) => [
            'id' => (string) $absence->id,
            'full_name' => $absence->full_name,
            'employee_id_number' => $absence->employee_id_number,
            'department' => $absence->department,
            'position' => $absence->position,
            'absence_type' => $absence->absence_type,
            'from_date' => $absence->from_date->format('Y-m-d'),
            'to_date' => $absence->to_date->format('Y-m-d'),
            'submitted_at' => $absence->submitted_at->format('Y-m-d H:i:s'),
            'days' => $absence->days,
            'reason' => $absence->reason,
            'is_partial_day' => $absence->is_partial_day,
            'status' => $absence->status,
            'picture' => $absence->employee ? $absence->employee->picture : null,
            'employee_name' => $absence->employee ? $absence->employee->employee_name : $absence->full_name,
            // Supervisor approval fields
            'supervisor_status' => $absence->supervisor_status,
            'supervisor_approved_by' => $absence->supervisor_approved_by,
            'supervisor_approved_at' => $absence->supervisor_approved_at ? $absence->supervisor_approved_at->format('Y-m-d H:i:s') : null,
            'supervisor_comments' => $absence->supervisor_comments,
            'supervisor_approver' => $absence->supervisorApprover ? [
                'id' => $absence->supervisorApprover->id,
                'name' => $absence->supervisorApprover->fullname,
                'email' => $absence->supervisorApprover->email,
            ] : null,
            // HR approval fields
            'hr_status' => $absence->hr_status,
            'hr_approved_by' => $absence->hr_approved_by,
            'hr_approved_at' => $absence->hr_approved_at ? $absence->hr_approved_at->format('Y-m-d H:i:s') : null,
            'hr_comments' => $absence->hr_comments,
            'hr_approver' => $absence->hrApprover ? [
                'id' => $absence->hrApprover->id,
                'name' => $absence->hrApprover->fullname,
                'email' => $absence->hrApprover->email,
            ] : null,
        ]);

        $isHR = $user->isHR();

        return Inertia::render('absence/absence-approve', [
            'initialRequests' => $absenceList,
            'user_permissions' => [
                'is_supervisor' => $isSupervisor,
                'is_super_admin' => $isSuperAdmin,
                'is_hr' => $isHR,
                'supervised_departments' => $supervisedDepartments,
            ],
        ]);
    }

    /**
     * Display the absence credit summary page.
     */
    public function creditSummary()
    {
        $user = Auth::user();
        $isSupervisor = $user->isSupervisor();
        $isSuperAdmin = $user->isSuperAdmin();

        // Get evaluable departments based on user role
        // HR and Manager see all departments, Admin and Supervisor see only assigned
        $supervisedDepartments = $this->getEvaluableDepartmentsForUser($user);

        // Fetch employees for the credit summary - filter by user role
        $employeeQuery = Employee::select('id', 'employeeid', 'employee_name', 'department', 'position');
        $isHR = $user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists();
        $isManager = $user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists();

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }
        $employees = $employeeQuery->get();

        // Add absence credits information for each employee
        $employeesWithCredits = $employees->map(function ($employee) {
            $absenceCredits = AbsenceCredit::getOrCreateForEmployee($employee->id);
            return [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'department' => $employee->department,
                'position' => $employee->position,
                'remaining_credits' => $absenceCredits->remaining_credits,
                'used_credits' => $absenceCredits->used_credits,
                'total_credits' => $absenceCredits->total_credits,
            ];
        })->toArray();

        // Get monthly absence statistics for the chart
        $monthlyAbsenceStats = $this->getMonthlyAbsenceStats($supervisedDepartments);

        return Inertia::render('absence/absence-credit', [
            'employees' => $employeesWithCredits,
            'monthlyAbsenceStats' => $monthlyAbsenceStats,
            'user_permissions' => [
                'is_supervisor' => $isSupervisor,
                'is_super_admin' => $isSuperAdmin,
                'supervised_departments' => $supervisedDepartments,
            ],
        ]);
    }

    /**
     * Get monthly absence statistics for chart display.
     */
    private function getMonthlyAbsenceStats($supervisedDepartments = [])
    {
        // Base query for absences
        $absenceQuery = Absence::query();

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
     * Update the status of an absence request.
     * Supports two-stage approval workflow: Supervisor -> HR
     */
    public function updateStatus(Request $request, Absence $absence)
    {
        $user = Auth::user();
        $isSupervisor = $user->isSupervisor();
        $isHR = $user->isHR();
        $isSuperAdmin = $user->isSuperAdmin();

        Log::info('[ABSENCE UPDATE] Update status request:', [
            'absence_id' => $absence->id,
            'user_id' => $user->id,
            'isSupervisor' => $isSupervisor,
            'isHR' => $isHR,
            'isSuperAdmin' => $isSuperAdmin,
            'request_data' => $request->all(),
        ]);

        // Determine which approval stage is being processed
        if (($isSupervisor || $isSuperAdmin) && $request->has('supervisor_status')) {
            // Supervisor approval stage
            $validated = $request->validate([
                'supervisor_status' => 'required|in:approved,rejected',
                'supervisor_comments' => 'nullable|string',
            ]);

            // Validate user can approve for this department (Supervisor, Admin, HR, or Manager)
            if (!$isSuperAdmin && !$user->canEvaluateDepartment($absence->department)) {
                $supervisedDepartments = $this->getEvaluableDepartmentsForUser($user);
                if (!in_array($absence->department, $supervisedDepartments)) {
                    Log::warning('[ABSENCE UPDATE] Supervisor cannot approve absence for department:', [
                        'supervisor_id' => $user->id,
                        'department' => $absence->department,
                        'supervised_departments' => $supervisedDepartments,
                    ]);
                    return redirect()->back()->withErrors(['error' => 'You do not have permission to approve absences for this department.']);
                }
            }

            $oldStatus = $absence->status;
            $supervisorStatus = $validated['supervisor_status'];

            Log::info('[ABSENCE UPDATE] Processing supervisor approval:', [
                'absence_id' => $absence->id,
                'supervisor_status' => $supervisorStatus,
                'old_status' => $oldStatus,
            ]);

            $absence->update([
                'supervisor_status' => $supervisorStatus,
                'supervisor_approved_by' => $user->id,
                'supervisor_approved_at' => now(),
                'supervisor_comments' => $validated['supervisor_comments'] ?? null,
                'status' => $supervisorStatus === 'approved' ? 'Pending HR Approval' : 'Rejected by Supervisor',
            ]);

            // Reload relationships for broadcasting
            $absence->load(['supervisorApprover', 'hrApprover', 'employee']);

            // Broadcast real-time update for supervisor approval
            event(new AbsenceSupervisorApproved($absence));

            // Notify employee of supervisor decision
            event(new RequestStatusUpdated(
                'absence',
                $absence->status,
                (int) $absence->employee_id,
                $absence->id,
                [
                    'absence_type' => $absence->absence_type,
                    'from_date' => $absence->from_date->format('Y-m-d'),
                    'to_date' => $absence->to_date->format('Y-m-d'),
                    'supervisor_comments' => $validated['supervisor_comments'] ?? null,
                ]
            ));
        } elseif (($isHR || $isSuperAdmin) && $request->has('hr_status')) {
            // HR approval stage - Check supervisor status
            if ($absence->supervisor_status === 'rejected') {
                // If supervisor rejected, only Super Admin can override
                if (!$isSuperAdmin) {
                    Log::warning('[ABSENCE UPDATE] HR cannot approve/reject when supervisor rejected:', [
                        'absence_id' => $absence->id,
                        'supervisor_status' => $absence->supervisor_status,
                        'user_id' => $user->id,
                        'is_hr' => $isHR,
                        'is_super_admin' => $isSuperAdmin,
                    ]);
                    return redirect()->back()->withErrors(['error' => 'This absence request was rejected by the supervisor. HR cannot perform any actions on rejected requests.']);
                }
            } elseif ($absence->supervisor_status !== 'approved') {
                // Supervisor hasn't approved yet (pending or null)
                if (!$isSuperAdmin) {
                    Log::warning('[ABSENCE UPDATE] HR cannot approve before supervisor:', [
                        'absence_id' => $absence->id,
                        'supervisor_status' => $absence->supervisor_status,
                        'user_id' => $user->id,
                    ]);
                    return redirect()->back()->withErrors(['error' => 'Supervisor must approve this absence request before HR can make a decision.']);
                }
            }

            $validated = $request->validate([
                'hr_status' => 'required|in:approved,rejected',
                'hr_comments' => 'nullable|string',
            ]);

            $oldStatus = $absence->status;
            $hrStatus = $validated['hr_status'];

            Log::info('[ABSENCE UPDATE] Processing HR approval:', [
                'absence_id' => $absence->id,
                'hr_status' => $hrStatus,
                'old_status' => $oldStatus,
            ]);

            $absence->update([
                'hr_status' => $hrStatus,
                'hr_approved_by' => $user->id,
                'hr_approved_at' => now(),
                'hr_comments' => $validated['hr_comments'] ?? null,
                'status' => $hrStatus === 'approved' ? 'Approved' : 'Rejected by HR',
                'approved_at' => now(), // Legacy field
                'approved_by' => $user->id, // Legacy field
                'approval_comments' => $validated['hr_comments'] ?? null, // Legacy field
            ]);

            // Reload relationships for broadcasting
            $absence->load(['supervisorApprover', 'hrApprover', 'employee']);

            // Handle credit management only on HR approval
            $absenceCredits = AbsenceCredit::getOrCreateForEmployee($absence->employee_id);
            if ($hrStatus === 'approved') {
                $absenceCredits->useCredits($absence->days);
                Log::info('[ABSENCE UPDATE] Credits deducted:', [
                    'absence_id' => $absence->id,
                    'days' => $absence->days,
                ]);
            }

            // Broadcast real-time update for HR approval
            event(new AbsenceHRApproved($absence));

            // Notify both supervisor AND employee after HR decision
            event(new RequestStatusUpdated(
                'absence',
                $absence->status,
                (int) $absence->employee_id,
                $absence->id,
                [
                    'absence_type' => $absence->absence_type,
                    'from_date' => $absence->from_date->format('Y-m-d'),
                    'to_date' => $absence->to_date->format('Y-m-d'),
                    'hr_comments' => $validated['hr_comments'] ?? null,
                ]
            ));
        } else {
            // Legacy support or invalid request
            Log::warning('[ABSENCE UPDATE] Invalid approval request:', [
                'absence_id' => $absence->id,
                'user_id' => $user->id,
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Invalid approval request. Please ensure you have the correct permissions and the request is in a valid state.',
                'error' => 'Invalid approval request.'
            ], 400);
        }

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'absence' => $absence->fresh(['supervisorApprover', 'hrApprover'])]);
        }

        return redirect()->route('absence.absence-approve')->with('success', 'Absence status updated successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Absence $absence)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Absence $absence)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Absence $absence)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Absence $absence)
    {
        try {
            $absence->delete();

            // Check if this is an AJAX request
            if (request()->expectsJson()) {
                return response()->json(['success' => true, 'message' => 'Absence request deleted successfully!']);
            }

            // For direct visits, redirect back to the absence index page
            return redirect()->route('absence.index')->with('success', 'Absence request deleted successfully!');
        } catch (Exception $e) {
            Log::error('Absence deletion failed: ' . $e->getMessage());

            // Check if this is an AJAX request
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Failed to delete absence request. Please try again.'], 500);
            }

            return redirect()->back()->with('error', 'Failed to delete absence request. Please try again.');
        }
    }

    public function request()
    {
        $user = Auth::user();
        $isSupervisor = $user->isSupervisor();
        $isSuperAdmin = $user->isSuperAdmin();

        // Get evaluable departments based on user role
        // HR and Manager see all departments, Admin and Supervisor see only assigned
        $supervisedDepartments = $this->getEvaluableDepartmentsForUser($user);

        // Base query for absences - load all relationships
        $absenceQuery = Absence::with('employee', 'approver', 'supervisorApprover', 'hrApprover');

        // Filter absences based on user role
        // HR and Manager already get all absences, so only filter for Admin and Supervisor
        $isHR = $user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists();
        $isManager = $user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists();

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $absenceQuery->whereIn('department', $supervisedDepartments);
        }

        $absences = $absenceQuery->orderBy('submitted_at', 'desc')->get();

        $absenceList = $absences->transform(fn($absence) => [
            'id' => (string) $absence->id,
            'full_name' => $absence->full_name,
            'employee_id_number' => $absence->employee_id_number,
            'department' => $absence->department,
            'position' => $absence->position,
            'absence_type' => $absence->absence_type,
            'from_date' => $absence->from_date->format('Y-m-d'),
            'to_date' => $absence->to_date->format('Y-m-d'),
            'submitted_at' => $absence->submitted_at->format('Y-m-d H:i:s'),
            'days' => $absence->days,
            'reason' => $absence->reason,
            'is_partial_day' => $absence->is_partial_day,
            'status' => $absence->status,
            'picture' => $absence->employee ? $absence->employee->picture : null,
            'employee_name' => $absence->employee ? $absence->employee->employee_name : $absence->full_name,
            // Supervisor approval fields
            'supervisor_status' => $absence->supervisor_status,
            'supervisor_approved_by' => $absence->supervisor_approved_by,
            'supervisor_approved_at' => $absence->supervisor_approved_at ? $absence->supervisor_approved_at->format('Y-m-d H:i:s') : null,
            'supervisor_comments' => $absence->supervisor_comments,
            'supervisor_approver' => $absence->supervisorApprover ? [
                'id' => $absence->supervisorApprover->id,
                'name' => $absence->supervisorApprover->fullname,
                'email' => $absence->supervisorApprover->email,
            ] : null,
            // HR approval fields
            'hr_status' => $absence->hr_status,
            'hr_approved_by' => $absence->hr_approved_by,
            'hr_approved_at' => $absence->hr_approved_at ? $absence->hr_approved_at->format('Y-m-d H:i:s') : null,
            'hr_comments' => $absence->hr_comments,
            'hr_approver' => $absence->hrApprover ? [
                'id' => $absence->hrApprover->id,
                'name' => $absence->hrApprover->fullname,
                'email' => $absence->hrApprover->email,
            ] : null,
        ]);

        $isHR = $user->isHR();

        return Inertia::render('absence/absence-approve', [
            'initialRequests' => $absenceList,
            'user_permissions' => [
                'is_supervisor' => $isSupervisor,
                'is_super_admin' => $isSuperAdmin,
                'is_hr' => $isHR,
                'supervised_departments' => $supervisedDepartments,
            ],
        ]);
    }

    /**
     * Get approved absences for Employee Absenteeism Report
     */
    public function approvedAbsences()
    {
        // Get all approved absences (where hr_status is 'approved' or status is 'approved')
        $absences = Absence::with(['employee', 'supervisorApprover', 'hrApprover'])
            ->where(function ($query) {
                $query->where('hr_status', 'approved')
                    ->orWhere('status', 'approved');
            })
            ->orderBy('hr_approved_at', 'desc')
            ->orderBy('approved_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get HR employee
        $hrEmployee = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['HR', 'HR Manager', 'HR Personnel']);
        })->first();

        $approvedAbsences = $absences->map(function ($absence) {
            // Get department supervisor from supervisor_departments table
            $departmentSupervisor = SupervisorDepartment::where('department', $absence->department)
                ->with('user')
                ->first();

            // Get HR person from hr_department_assignments table
            $departmentHR = HRDepartmentAssignment::where('department', $absence->department)
                ->with('user')
                ->first();

            return [
                'id' => $absence->id,
                'absence_type' => $absence->absence_type,
                'from_date' => $absence->from_date->format('Y-m-d'),
                'to_date' => $absence->to_date->format('Y-m-d'),
                'days' => $absence->days,
                'is_partial_day' => $absence->is_partial_day,
                'status' => $absence->status,
                'reason' => $absence->reason,
                'submitted_at' => $absence->submitted_at->format('Y-m-d'),
                'approved_at' => $absence->approved_at ? $absence->approved_at->format('Y-m-d') : null,
                'hr_approved_at' => $absence->hr_approved_at ? $absence->hr_approved_at->format('Y-m-d') : null,
                'employee_name' => $absence->employee ? $absence->employee->employee_name : $absence->full_name,
                'employeeid' => $absence->employee ? $absence->employee->employeeid : $absence->employee_id_number,
                'department' => $absence->department,
                'position' => $absence->position,
                'picture' => $absence->employee ? $absence->employee->picture : null,
                'supervisor_approver' => $absence->supervisorApprover ? [
                    'id' => $absence->supervisorApprover->id,
                    'name' => $absence->supervisorApprover->fullname,
                ] : null,
                'hr_approver' => $absence->hrApprover ? [
                    'id' => $absence->hrApprover->id,
                    'name' => $absence->hrApprover->fullname,
                ] : null,
                'department_supervisor' => $departmentSupervisor && $departmentSupervisor->user ? [
                    'id' => $departmentSupervisor->user->id,
                    'name' => $departmentSupervisor->user->fullname,
                ] : null,
                'department_hr' => $departmentHR && $departmentHR->user ? [
                    'id' => $departmentHR->user->id,
                    'name' => $departmentHR->user->fullname,
                ] : null,
            ];
        })->toArray();

        return Inertia::render('report/employee-absenteeism-report', [
            'absences' => $approvedAbsences,
            'hrEmployee' => $hrEmployee ? [
                'id' => $hrEmployee->id,
                'name' => $hrEmployee->fullname,
            ] : null,
        ]);
    }
}
