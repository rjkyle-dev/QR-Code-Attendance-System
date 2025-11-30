<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeQrToken;
use App\Models\Attendance;
use App\Models\AttendanceSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Broadcast;
use Carbon\Carbon;

class QrAttendanceController extends Controller
{
    /**
     * Scan QR code and log attendance
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function scan(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'signature' => 'nullable|string',
            'device_fingerprint' => 'nullable|string',
            'location' => 'nullable|array',
        ]);

        $token = $request->input('token');
        $signature = $request->input('signature');
        $deviceFingerprint = $request->input('device_fingerprint');
        $ipAddress = $request->ip();

        try {
            // Find token in database
            $qrToken = EmployeeQrToken::where('token', $token)
                ->with('employee')
                ->first();

            if (!$qrToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code token'
                ], 400);
            }

            // Validate token
            if (!$qrToken->isValid()) {
                if ($qrToken->isExpired()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'QR code has expired. Please generate a new one.'
                    ], 400);
                }

                if ($qrToken->isUsed()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'QR code has already been used. Please generate a new one.'
                    ], 400);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'QR code is invalid'
                ], 400);
            }

            $employee = $qrToken->employee;

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            // Validate signature if provided
            if ($signature) {
                $validToken = $employee->validateQrToken($token, $signature);
                if (!$validToken) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid QR code signature'
                    ], 400);
                }
            }

            // Rate limiting per employee
            $rateLimitKey = 'qr_scan:' . $employee->id;
            if (RateLimiter::tooManyAttempts($rateLimitKey, 10)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many scan attempts. Please wait.'
                ], 429);
            }

            // Check attendance session validation
            $now = Carbon::now();
            $sessionValidation = $this->validateAttendanceSession($now);

            if (!$sessionValidation['allowed']) {
                return response()->json([
                    'success' => false,
                    'message' => $sessionValidation['message'],
                    'current_session' => $sessionValidation['current_session'] ?? null,
                ], 400);
            }

            // Determine if this is time-in or time-out
            $attendanceAction = $this->determineAttendanceAction($employee, $now, $sessionValidation['session']);

            if ($attendanceAction['action'] === 'duplicate') {
                return response()->json([
                    'success' => false,
                    'message' => $attendanceAction['message'],
                ], 400);
            }

            // Log attendance
            $attendance = $this->logAttendance(
                $employee,
                $now,
                $sessionValidation['session'],
                $attendanceAction['action']
            );

            // Mark token as used
            $qrToken->markAsUsed($deviceFingerprint, $ipAddress);

            // Hit rate limiter
            RateLimiter::hit($rateLimitKey, 60);

            // Broadcast real-time update (via event if needed)
            // You can create an AttendanceRecorded event and broadcast it here
            // For now, we'll just log it
            Log::info('QR Attendance recorded', [
                'employee_id' => $employee->id,
                'attendance_id' => $attendance->id,
                'action' => $attendanceAction['action'],
            ]);

            return response()->json([
                'success' => true,
                'message' => $attendanceAction['message'],
                'attendance' => [
                    'id' => $attendance->id,
                    'employee_id' => $employee->id,
                    'employeeid' => $employee->employeeid,
                    'employee_name' => $employee->employee_name,
                    'time_in' => $attendance->time_in ? Carbon::parse($attendance->time_in)->format('H:i:s') : null,
                    'time_out' => $attendance->time_out ? Carbon::parse($attendance->time_out)->format('H:i:s') : null,
                    'attendance_date' => Carbon::parse($attendance->attendance_date)->format('Y-m-d'),
                    'session' => $attendance->session,
                    'status' => $attendance->attendance_status,
                    'action' => $attendanceAction['action'],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('QR code attendance scan failed', [
                'token' => substr($token, 0, 10) . '...',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing attendance. Please try again.'
            ], 500);
        }
    }

    /**
     * Validate if attendance is allowed at current time based on sessions
     */
    private function validateAttendanceSession(Carbon $now): array
    {
        $sessions = AttendanceSession::all();

        if ($sessions->isEmpty()) {
            // No sessions configured, allow attendance (fallback)
            return [
                'allowed' => true,
                'session' => $this->determineSessionFallback($now),
            ];
        }

        $currentTime = $now->format('H:i:s');

        foreach ($sessions as $session) {
            // Check time-in window
            if ($session->time_in_start && $session->time_in_end) {
                if ($this->isTimeInRange($now, $session->time_in_start, $session->time_in_end)) {
                    return [
                        'allowed' => true,
                        'session' => $session->session_name,
                    ];
                }
            }

            // Check time-out window
            if ($session->time_out_start && $session->time_out_end) {
                if ($this->isTimeInRange($now, $session->time_out_start, $session->time_out_end)) {
                    return [
                        'allowed' => true,
                        'session' => $session->session_name,
                    ];
                }
            }
        }

        // No active session found
        return [
            'allowed' => false,
            'message' => 'Attendance not allowed outside session hours.',
            'current_session' => null,
        ];
    }

    /**
     * Check if time is within range (handles overnight ranges)
     */
    private function isTimeInRange(Carbon $time, string $startTime, string $endTime): bool
    {
        $timeOfDay = $time->format('H:i:s');
        $start = Carbon::parse($startTime)->format('H:i:s');
        $end = Carbon::parse($endTime)->format('H:i:s');

        // Normal range (same day)
        if ($start <= $end) {
            return $timeOfDay >= $start && $timeOfDay <= $end;
        }

        // Overnight range (crosses midnight)
        return $timeOfDay >= $start || $timeOfDay <= $end;
    }

    /**
     * Determine session fallback based on hour
     */
    private function determineSessionFallback(Carbon $time): string
    {
        $hour = (int) $time->format('H');
        if ($hour >= 6 && $hour < 12) {
            return 'morning';
        } elseif ($hour >= 12 && $hour < 18) {
            return 'afternoon';
        } else {
            return 'night';
        }
    }

    /**
     * Determine if this should be time-in or time-out
     */
    private function determineAttendanceAction(Employee $employee, Carbon $now, string $session): array
    {
        // Check for existing attendance today
        $todayAttendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('attendance_date', $now->toDateString())
            ->first();

        if (!$todayAttendance) {
            // No attendance today, this is time-in
            return [
                'action' => 'time_in',
                'message' => 'Time-in recorded successfully',
            ];
        }

        // Has time-in
        if ($todayAttendance->time_out) {
            // Already has both time-in and time-out
            return [
                'action' => 'duplicate',
                'message' => 'Attendance already completed for today.',
            ];
        }

        // Has time-in but no time-out
        // Check if we're in time-out period
        $sessions = AttendanceSession::all();
        $currentTime = $now->format('H:i:s');

        foreach ($sessions as $attendanceSession) {
            if ($attendanceSession->session_name === $session) {
                if ($attendanceSession->time_out_start && $attendanceSession->time_out_end) {
                    if ($this->isTimeInRange($now, $attendanceSession->time_out_start, $attendanceSession->time_out_end)) {
                        return [
                            'action' => 'time_out',
                            'message' => 'Time-out recorded successfully',
                        ];
                    }
                }
            }
        }

        // Not in time-out period, but has time-in - allow time-out anyway (flexible)
        return [
            'action' => 'time_out',
            'message' => 'Time-out recorded successfully',
        ];
    }

    /**
     * Log attendance to database
     */
    private function logAttendance(Employee $employee, Carbon $now, string $session, string $action): Attendance
    {
        $todayAttendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('attendance_date', $now->toDateString())
            ->first();

        // Determine attendance status (Present or Late)
        $attendanceStatus = 'Present';
        $sessions = AttendanceSession::all();

        foreach ($sessions as $attendanceSession) {
            if ($attendanceSession->session_name === $session && $attendanceSession->late_time) {
                $lateTime = Carbon::parse($attendanceSession->late_time);
                if ($now->gt($lateTime)) {
                    $attendanceStatus = 'Late';
                }
                break;
            }
        }

        if ($action === 'time_in') {
            // Create new attendance record
            $attendance = Attendance::create([
                'employee_id' => $employee->id,
                'time_in' => $now->format('H:i:s'),
                'attendance_date' => $now->toDateString(),
                'session' => $session,
                'attendance_status' => $attendanceStatus,
            ]);
        } else {
            // Update existing attendance with time-out
            if (!$todayAttendance) {
                // Shouldn't happen, but create new record if needed
                $attendance = Attendance::create([
                    'employee_id' => $employee->id,
                    'time_in' => $now->format('H:i:s'), // Use current time as fallback
                    'time_out' => $now->format('H:i:s'),
                    'attendance_date' => $now->toDateString(),
                    'session' => $session,
                    'attendance_status' => $attendanceStatus,
                ]);
            } else {
                $todayAttendance->update([
                    'time_out' => $now->format('H:i:s'),
                ]);
                $attendance = $todayAttendance->fresh();
            }
        }

        return $attendance;
    }

    /**
     * Record attendance using employee ID directly (for manual entry)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recordByEmployeeId(Request $request)
    {
        $request->validate([
            'employeeid' => 'required|string',
        ]);

        $employeeId = $request->input('employeeid');
        $ipAddress = $request->ip();

        try {
            // Find employee by employeeid
            $employee = Employee::where('employeeid', $employeeId)->first();

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee ID not found'
                ], 404);
            }

            // Rate limiting per employee
            $rateLimitKey = 'attendance_manual:' . $employee->id;
            if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many attendance attempts. Please wait before trying again.'
                ], 429);
            }

            RateLimiter::hit($rateLimitKey, 60);

            // Check attendance session validation
            $now = Carbon::now();
            $sessionValidation = $this->validateAttendanceSession($now);

            if (!$sessionValidation['allowed']) {
                return response()->json([
                    'success' => false,
                    'message' => $sessionValidation['message'],
                    'current_session' => $sessionValidation['current_session'] ?? null,
                ], 400);
            }

            // Determine if this is time-in or time-out
            $attendanceAction = $this->determineAttendanceAction($employee, $now, $sessionValidation['session']);

            if ($attendanceAction['action'] === 'duplicate') {
                return response()->json([
                    'success' => false,
                    'message' => $attendanceAction['message'],
                ], 400);
            }

            // Log attendance
            $attendance = $this->logAttendance(
                $employee,
                $now,
                $sessionValidation['session'],
                $attendanceAction['action']
            );

            Log::info('Manual attendance recorded', [
                'employee_id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'attendance_id' => $attendance->id,
                'action' => $attendanceAction['action'],
                'ip_address' => $ipAddress,
            ]);

            return response()->json([
                'success' => true,
                'message' => $attendanceAction['message'],
                'attendance' => [
                    'id' => $attendance->id,
                    'employee_id' => $employee->id,
                    'employeeid' => $employee->employeeid,
                    'employee_name' => $employee->employee_name,
                    'time_in' => $attendance->time_in ? Carbon::parse($attendance->time_in)->format('H:i:s') : null,
                    'time_out' => $attendance->time_out ? Carbon::parse($attendance->time_out)->format('H:i:s') : null,
                    'attendance_date' => Carbon::parse($attendance->attendance_date)->format('Y-m-d'),
                    'session' => $attendance->session,
                    'status' => $attendance->attendance_status,
                    'action' => $attendanceAction['action'],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Manual attendance recording failed', [
                'employeeid' => $employeeId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing attendance. Please try again.'
            ], 500);
        }
    }

    /**
     * Get today's attendance records (public endpoint)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTodayAttendance(Request $request)
    {
        try {
            $today = Carbon::today()->toDateString();

            $attendances = Attendance::with(['employee' => function ($query) {
                $query->withTrashed();
            }])
                ->whereDate('attendance_date', $today)
                ->orderBy('time_in', 'desc')
                ->get();

            $attendanceList = $attendances->map(function ($attendance) {
                return [
                    'id' => $attendance->id,
                    'employee_id' => $attendance->employee_id,
                    'employeeid' => $attendance->employee ? $attendance->employee->employeeid : null,
                    'employee_name' => $attendance->employee ? $attendance->employee->employee_name : 'Unknown Employee',
                    'department' => $attendance->employee ? $attendance->employee->department : null,
                    'position' => $attendance->employee ? $attendance->employee->position : null,
                    'time_in' => $attendance->time_in,
                    'time_out' => $attendance->time_out,
                    'attendance_status' => $attendance->attendance_status,
                    'session' => $attendance->session,
                    'attendance_date' => $attendance->attendance_date,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $attendanceList,
                'count' => $attendanceList->count(),
                'date' => $today,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching today attendance: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance records',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
