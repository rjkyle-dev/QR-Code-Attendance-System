<?php

namespace App\Http\Controllers;

use App\Models\AttendanceSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceSessionController extends Controller
{
  public function index()
  {
    $sessions = AttendanceSession::orderBy('created_at', 'desc')->get();
    return Inertia::render('attendance/session-time', [
      'sessions' => $sessions,
    ]);
  }

  public function create()
  {
    //
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      'session_name' => 'required|string',
      'time_in_start' => 'required',
      'time_in_end' => 'required',
      'time_out_start' => 'nullable',
      'time_out_end' => 'nullable',
      'late_time' => 'nullable',
      'double_scan_window' => 'nullable|integer|min:1|max:60',
    ]);

    $session = AttendanceSession::create($validated);

    return redirect()->back()->with('success', 'Session times created successfully!');
  }

  public function show(AttendanceSession $attendanceSession)
  {
    //
  }

  public function edit(AttendanceSession $attendanceSession)
  {
    //
  }

  public function update(Request $request, AttendanceSession $attendanceSession)
  {
    $validated = $request->validate([
      'time_in_start' => 'required',
      'time_in_end' => 'required',
      'time_out_start' => 'nullable',
      'time_out_end' => 'nullable',
      'late_time' => 'nullable',
      'double_scan_window' => 'nullable|integer|min:1|max:60',
    ]);

    $attendanceSession->update($validated);

    return redirect()->back()->with('success', 'Session times updated successfully!');
  }

  public function destroy(AttendanceSession $attendanceSession)
  {
    $attendanceSession->delete();
    
    return redirect()->back()->with('success', 'Session time deleted successfully!');
  }
}
