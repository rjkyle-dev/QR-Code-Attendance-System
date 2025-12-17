<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\HRDepartmentAssignment;
use App\Traits\EmployeeFilterTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    use EmployeeFilterTrait;

    public function index()
    {
        $user = Auth::user();
        $isSuperAdmin = $user->isSuperAdmin();

        $supervisedDepartments = $this->getEvaluableDepartmentsForUser($user);

        $attendanceQuery = Attendance::with(['employee' => function ($query) {
            $query->withTrashed();
        }]);

        $isHR = $user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists();
        $isManager = $user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists();

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $attendanceQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }

        $attendance = $attendanceQuery->orderBy('created_at', 'asc')->get();

        $attendanceList = $attendance->transform(
            fn($attendance) => [
                'id'               => $attendance->id,
                'timeIn'           => $attendance->time_in,
                'timeOut'          => $attendance->time_out,
                'breakTime'        => $attendance->break_time,
                'attendanceStatus' => $attendance->attendance_status,
                'actualAttendanceStatus' => $attendance->actual_attendance_status,
                'attendanceDate'   => $attendance->attendance_date,
                'employee_name'    => $attendance->employee ? $attendance->employee->employee_name : null,
                'picture'          => $attendance->employee ? $attendance->employee->picture : null,
                'department'       => $attendance->employee ? $attendance->employee->department : null,
                'employeeid'       => $attendance->employee ? $attendance->employee->employeeid : null,
                'position'         => $attendance->employee ? $attendance->employee->position : null,
                'session'          => $attendance->session,
            ]
        );

        $sessions = AttendanceSession::orderBy('created_at', 'desc')->get();

        $employeeQuery = \App\Models\Employee::query();
        $prevEmployeeQuery = \App\Models\Employee::where('created_at', '<', now()->startOfMonth());

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
            $prevEmployeeQuery->whereIn('department', $supervisedDepartments);
        }

        $totalEmployee = $employeeQuery->distinct('employeeid')->count('employeeid');
        $totalDepartment = $isSuperAdmin || $isHR || $isManager
            ? \App\Models\Employee::distinct('department')->count('department')
            : count($supervisedDepartments);
        $prevTotalEmployee = $prevEmployeeQuery->distinct('employeeid')->count('employeeid');
        $prevTotalDepartment = $isSuperAdmin || $isHR || $isManager
            ? \App\Models\Employee::where('created_at', '<', now()->startOfMonth())->distinct('department')->count('department')
            : count($supervisedDepartments);

        return Inertia::render('attendance/index', [
            'attendanceData' => $attendanceList,
            'sessions' => $sessions,
            'totalEmployee' => $totalEmployee,
            'prevTotalEmployee' => $prevTotalEmployee,
            'totalDepartment' => $totalDepartment,
            'prevTotalDepartment' => $prevTotalDepartment,
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $request->validate([
            'employeeid' => 'required|string',
            'timeIn' => 'required',
            'attendanceStatus' => 'required|string',
            'attendanceDate' => 'required|date',
        ]);

        $employee = \App\Models\Employee::where('employeeid', $request->employeeid)->first();
        if (!$employee) {
            return redirect()->back()->with('error', 'Employee not found.');
        }

        $session = $request->input('session');
        if (!$session) {
            $now = $request->timeIn ? $request->timeIn : now()->format('H:i:s');
            $hour = (int)substr($now, 0, 2);
            if ($hour >= 6 && $hour < 12) {
                $session = 'morning';
            } elseif ($hour >= 12 && $hour < 18) {
                $session = 'afternoon';
            } else {
                $session = 'night';
            }
        }

        $existing = \App\Models\Attendance::where('employee_id', $employee->id)
            ->where('attendance_date', $request->attendanceDate)
            ->where('session', $session)
            ->first();
        if ($existing) {
            return redirect()->back()->with('error', 'Attendance already recorded for this employee, date, and session.');
        }

        $attendance = new \App\Models\Attendance();
        $attendance->employee_id = $employee->id;
        $attendance->time_in = $request->timeIn;
        $attendance->attendance_status = $request->attendanceStatus;
        $attendance->attendance_date = $request->attendanceDate;
        $attendance->session = $session;
        if ($request->has('timeOut')) $attendance->time_out = $request->timeOut;
        if ($request->has('breakTime')) $attendance->break_time = $request->breakTime;
        $attendance->save();

        return redirect()->back()->with('success', 'Attendance recorded successfully!');
    }

    public function show(Attendance $attendance)
    {
        //
    }

    public function edit(Attendance $attendance)
    {
        //
    }

    public function update(Request $request, Attendance $attendance)
    {
        //
    }

    public function destroy(Attendance $attendance)
    {
        //
    }
}
