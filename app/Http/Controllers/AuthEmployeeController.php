<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Leave;
use App\Models\LeaveCredit;
use App\Models\Absence;
use App\Models\AbsenceCredit;
use App\Models\ReturnWork;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;

class AuthEmployeeController extends Controller
{
    public function index()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        if (!$employee) {
            Session::forget(['employee_id', 'employee_name']);
            return redirect()->route('employeelogin');
        }

        $dashboardData = $this->getDashboardData($employee);

        return Inertia::render('employee-view/dashboard', [
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
            'dashboardData' => $dashboardData
        ]);
    }

    private function getDashboardData($employee)
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $currentYear = Carbon::now()->year;

        $leaveCredits = LeaveCredit::getOrCreateForEmployee($employee->id, $currentYear);
        $leaveBalance = $leaveCredits->remaining_credits;

        $absenceCredits = AbsenceCredit::getOrCreateForEmployee($employee->id);
        $absenceBalance = $absenceCredits->remaining_credits;

        $absenceCount = Absence::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereMonth('from_date', $currentMonth->month)
            ->whereYear('from_date', $currentMonth->year)
            ->count();

        $evaluationRating = 0;

        $totalWorkDays = $this->getTotalWorkDays($currentMonth);
        $presentDays = Attendance::where('employee_id', $employee->id)
            ->where('attendance_status', 'Present')
            ->whereMonth('attendance_date', $currentMonth->month)
            ->whereYear('attendance_date', $currentMonth->year)
            ->count();

        $attendancePercentage = $totalWorkDays > 0 ? round(($presentDays / $totalWorkDays) * 100, 1) : 0;

        $productivity = $attendancePercentage;

        $recentActivities = $this->getRecentActivities($employee);

        $leaveRequests = Leave::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'leave_type' => $leave->leave_type,
                    'leave_start_date' => $leave->leave_start_date->format('Y-m-d'),
                    'leave_end_date' => $leave->leave_end_date->format('Y-m-d'),
                    'leave_days' => $leave->leave_days,
                    'leave_status' => $leave->leave_status,
                    'leave_reason' => $leave->leave_reason,
                    'created_at' => $leave->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $absenceRequests = Absence::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($absence) {
                return [
                    'id' => $absence->id,
                    'absence_type' => $absence->absence_type,
                    'from_date' => $absence->from_date->format('Y-m-d'),
                    'to_date' => $absence->to_date->format('Y-m-d'),
                    'days' => $absence->days,
                    'status' => $absence->status,
                    'reason' => $absence->reason,
                    'created_at' => $absence->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $notifications = \App\Models\Notification::where('type', 'like', '%employee%')
            ->orWhere('type', 'like', '%leave%')
            ->orWhere('type', 'like', '%absence%')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at ? $notification->read_at->format('Y-m-d H:i:s') : null,
                    'created_at' => $notification->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $unreadNotificationCount = \App\Models\Notification::whereNull('read_at')
            ->where(function ($query) {
                $query->where('type', 'like', '%employee%')
                    ->orWhere('type', 'like', '%leave%')
                    ->orWhere('type', 'like', '%absence%');
            })
            ->count();

        return [
            'leaveBalance' => $leaveBalance,
            'absenceCount' => $absenceCount,
            'absenceBalance' => $absenceBalance,
            'evaluationRating' => $evaluationRating,
            'assignedArea' => $employee->department,
            'attendancePercentage' => $attendancePercentage,
            'productivity' => $productivity,
            'recentActivities' => $recentActivities,
            'leaveCredits' => [
                'remaining' => $leaveCredits->remaining_credits,
                'used' => $leaveCredits->used_credits,
                'total' => $leaveCredits->total_credits,
            ],
            'absenceCredits' => [
                'remaining' => $absenceCredits->remaining_credits,
                'used' => $absenceCredits->used_credits,
                'total' => $absenceCredits->total_credits,
            ],
            'leaveRequests' => $leaveRequests,
            'absenceRequests' => $absenceRequests,
            'notifications' => $notifications,
            'unreadNotificationCount' => $unreadNotificationCount,
        ];
    }


    private function getTotalWorkDays($month)
    {
        $days = 0;
        $current = $month->copy();

        while ($current->month === $month->month) {
            if ($current->isWeekday()) {
                $days++;
            }
            $current->addDay();
        }

        return $days;
    }

    private function getRecentActivities($employee)
    {
        $activities = [];

        $recentLeaves = Leave::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentLeaves as $leave) {
            $activities[] = [
                'id' => 'leave_' . $leave->id,
                'title' => ucfirst($leave->leave_type) . ' Leave request ' . $leave->leave_status,
                'timeAgo' => $leave->created_at->diffForHumans(),
                'status' => strtolower($leave->leave_status),
                'type' => 'leave'
            ];
        }

        $recentAbsences = Absence::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentAbsences as $absence) {
            $activities[] = [
                'id' => 'absence_' . $absence->id,
                'title' => ucfirst($absence->absence_type) . ' Absence request ' . $absence->status,
                'timeAgo' => $absence->created_at->diffForHumans(),
                'status' => strtolower($absence->status),
                'type' => 'absence'
            ];
        }

        $recentReturnWork = ReturnWork::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentReturnWork as $returnWork) {
            $activities[] = [
                'id' => 'return_work_' . $returnWork->id,
                'title' => 'Return to Work request ' . $returnWork->status,
                'timeAgo' => $returnWork->created_at->diffForHumans(),
                'status' => strtolower($returnWork->status),
                'type' => 'return_work'
            ];
        }


        usort($activities, function ($a, $b) {
            return strtotime($b['timeAgo']) - strtotime($a['timeAgo']);
        });

        return array_slice($activities, 0, 4);
    }

    public function create(): Response
    {
        return Inertia::render('employee-view/login');
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|string',
            'pin' => 'required|string',
        ]);

        // Check for hardcoded credentials
        if ($request->employee_id === 'employeetest' && $request->pin === 'employee123') {
            // Find or create the hardcoded employee
            $employee = Employee::firstOrCreate(
                ['employeeid' => 'employee123'],
                [
                    'employeeid' => 'employee123',
                    'employee_name' => 'Test Employee',
                    'firstname' => 'Test',
                    'lastname' => 'Employee',
                    'pin' => 'employee123',
                    'department' => 'IT',
                    'position' => 'Developer',
                ]
            );

            Session::put('employee_id', $employee->employeeid);
            Session::put('employee_name', $employee->employee_name);

            return redirect()->route('employee-view');
        }

        $employee = Employee::where('employeeid', $request->employee_id)->first();

        if (!$employee) {
            return back()->withErrors([
                'employee_id' => 'Employee ID not found.',
            ]);
        }

        if ($employee->pin !== $request->pin) {
            return back()->withErrors([
                'pin' => 'Invalid PIN.',
            ]);
        }

        Session::put('employee_id', $employee->employeeid);
        Session::put('employee_name', $employee->employee_name);

        return redirect()->route('employee-view');
    }

    public function logout()
    {
        Session::forget(['employee_id', 'employee_name']);
        Session::flush();
        return redirect()->route('employeelogin')->with('status', 'You have been successfully logged out.');
    }

    public function resetPin(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|string',
        ]);

        $employee = Employee::where('employeeid', $request->employee_id)->first();

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found.'
            ], 404);
        }

        $newPin = $employee->resetPin();

        return response()->json([
            'success' => true,
            'message' => 'PIN reset successfully.',
            'pin' => $newPin
        ]);
    }

    public function profile()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        return Inertia::render('employee-view/profile', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'address' => null,
            ]
        ]);
    }

    public function attendance()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        return Inertia::render('employee-view/attendance', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
            ]
        ]);
    }

    public function qrCode()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        if (!$employee) {
            Session::forget(['employee_id', 'employee_name']);
            return redirect()->route('employeelogin');
        }

        return Inertia::render('employee-view/qr-code', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
            ]
        ]);
    }


    public function leave()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        $currentYear = Carbon::now()->year;
        $leaveCredits = LeaveCredit::getOrCreateForEmployee($employee->id, $currentYear);
        $leaveBalance = $leaveCredits->remaining_credits;

        return Inertia::render('employee-view/request-form/leave/index', [
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
            'leaveBalance' => $leaveBalance
        ]);
    }

    public function absence()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

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
            ]
        ]);
    }

    public function returnWork()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        $previousAbsences = Absence::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->orderBy('from_date', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($absence) {
                return [
                    'id' => $absence->id,
                    'date' => $absence->from_date->format('Y-m-d'),
                    'type' => $absence->absence_type,
                    'reason' => $absence->reason
                ];
            });

        return Inertia::render('employee-view/request-form/return-work/index', [
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
            'previousAbsences' => $previousAbsences
        ]);
    }

    public function records()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        $leaveRecords = Leave::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => 'REQ' . str_pad($leave->id, 3, '0', STR_PAD_LEFT),
                    'type' => 'Leave (' . ucfirst($leave->leave_type) . ')',
                    'dates' => $leave->leave_start_date->format('Y-m-d') . ' to ' . $leave->leave_end_date->format('Y-m-d'),
                    'days' => $leave->leave_days . ' days',
                    'status' => $leave->leave_status,
                    'submitted' => $leave->created_at->format('Y-m-d'),
                    'comments' => $leave->leave_reason
                ];
            });

        $absenceRecords = Absence::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($absence) {
                return [
                    'id' => 'ABS' . str_pad($absence->id, 3, '0', STR_PAD_LEFT),
                    'type' => 'Absence (' . $absence->absence_type . ')',
                    'dates' => $absence->from_date->format('Y-m-d'),
                    'days' => $absence->days . ' day' . ($absence->days > 1 ? 's' : ''),
                    'status' => $absence->status,
                    'submitted' => $absence->created_at->format('Y-m-d'),
                    'comments' => $absence->reason
                ];
            });

        $allRecords = $leaveRecords->concat($absenceRecords)
            ->sortByDesc('submitted')
            ->values();

        $currentYear = Carbon::now()->year;
        $leaveCredits = LeaveCredit::getOrCreateForEmployee($employee->id, $currentYear);
        $leaveBalance = $leaveCredits->remaining_credits;

        $summary = [
            'leaveDaysRemaining' => $leaveBalance,
            'totalRequests' => $allRecords->count(),
            'approved' => $allRecords->where('status', 'approved')->count(),
            'pending' => $allRecords->where('status', 'pending')->count(),
        ];

        return Inertia::render('employee-view/records', [
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
            'records' => $allRecords,
            'summary' => $summary
        ]);
    }

    public function show($id)
    {
    }

    public function edit($id)
    {
    }

    public function update(Request $request, $id)
    {
    }

    public function destroy($id)
    {
    }

    public function logouts(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('home');
    }

    public function profileSettings()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        return Inertia::render('employee-view/profile-settings', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
                'email' => $employee->email,
                'phone' => $employee->phone,
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'firstname' => 'required|string|max:100',
            'lastname' => 'required|string|max:100',
            'profile_image' => 'nullable|image|max:5120',
        ]);

        $employee = Employee::where('employeeid', Session::get('employee_id'))->firstOrFail();

        $employee->firstname = $request->firstname;
        $employee->lastname = $request->lastname;
        $employee->employee_name = trim($request->firstname . ' ' . $request->lastname);

        if ($request->hasFile('profile_image')) {
            $file = $request->file('profile_image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $employee->picture = '/storage/' . $path;
        }

        $employee->save();

        return back()->with('status', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:4|confirmed',
        ]);

        $employee = Employee::where('employeeid', Session::get('employee_id'))->firstOrFail();

        if ($employee->pin !== $request->current_password) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $employee->pin = $request->new_password;
        $employee->save();

        return back()->with('status', 'Password updated successfully.');
    }

    public function markNotificationAsRead(Request $request)
    {
        $request->validate([
            'notification_id' => 'required|string',
        ]);

        $notification = \App\Models\Notification::find($request->notification_id);

        if ($notification) {
            $notification->update(['read_at' => now()]);
        }

        return back()->with('success', 'Notification marked as read');
    }

    public function markAllNotificationsAsRead(Request $request)
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->firstOrFail();

        \App\Models\Notification::whereNull('read_at')
            ->where(function ($query) {
                $query->where('type', 'like', '%employee%')
                    ->orWhere('type', 'like', '%leave%')
                    ->orWhere('type', 'like', '%absence%');
            })
            ->update(['read_at' => now()]);

        return back()->with('success', 'All notifications marked as read');
    }

    public function refreshDashboard()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        $dashboardData = $this->getDashboardData($employee);

        return response()->json([
            'dashboardData' => $dashboardData,
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
            ]
        ]);
    }

    public function storeReturnWork(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|integer',
            'full_name' => 'required|string|max:255',
            'employee_id_number' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'return_date' => 'required|date',
            'absence_type' => 'required|string|max:255',
            'reason' => 'required|string',
            'medical_clearance' => 'nullable|string',
            'return_date_reported' => 'required|date',
        ]);

        try {
            $returnWork = \App\Models\ReturnWork::create([
                'employee_id' => $request->employee_id,
                'full_name' => $request->full_name,
                'employee_id_number' => $request->employee_id_number,
                'department' => $request->department,
                'position' => $request->position,
                'return_date' => $request->return_date,
                'absence_type' => $request->absence_type,
                'reason' => $request->reason,
                'medical_clearance' => $request->medical_clearance,
                'return_date_reported' => $request->return_date_reported,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            $employee = Employee::find($request->employee_id);
            $supervisor = \App\Models\User::getSupervisorForDepartment($employee->department);

            Log::info('Return work submission - Supervisor lookup:', [
                'employee_id' => $request->employee_id,
                'employee_name' => $employee ? $employee->employee_name : 'N/A',
                'department' => $employee->department,
                'supervisor_id' => $supervisor ? $supervisor->id : 'NONE',
                'supervisor_name' => $supervisor ? $supervisor->name : 'NONE',
            ]);

            try {
                Log::info('Broadcasting ReturnWorkRequested event...', [
                    'return_work_id' => $returnWork->id,
                    'department' => $employee->department,
                    'supervisor_id' => $supervisor ? $supervisor->id : null,
                ]);

                broadcast(new \App\Events\ReturnWorkRequested([
                    'return_work_id' => $returnWork->id,
                    'employee_name' => $employee->employee_name,
                    'employee_id_number' => $employee->employeeid,
                    'department' => $employee->department,
                    'return_date' => $returnWork->return_date,
                    'absence_type' => $returnWork->absence_type,
                    'reason' => $returnWork->reason,
                    'return_date_reported' => $returnWork->return_date_reported,
                ]));

                Log::info('ReturnWorkRequested event broadcasted successfully');
            } catch (\Exception $broadcastError) {
                Log::error('Failed to broadcast return work notification:', [
                    'error' => $broadcastError->getMessage(),
                    'trace' => $broadcastError->getTraceAsString(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Return to work notification submitted successfully!',
                'data' => $returnWork
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing return to work notification: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit return to work notification. Please try again.'
            ], 500);
        }
    }
}
