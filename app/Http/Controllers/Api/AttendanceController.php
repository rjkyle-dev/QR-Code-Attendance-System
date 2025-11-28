<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;

class AttendanceController extends Controller
{
  public function index()
  {
    // Include soft-deleted employees in the relationship to ensure employee data is loaded
    $attendance = Attendance::with(['employee' => function ($query) {
      $query->withTrashed();
    }])->orderBy('created_at', 'desc')->get();

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

    return response()->json($attendanceList);
  }
}
