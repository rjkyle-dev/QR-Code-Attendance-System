<?php

namespace App\Http\Controllers;

use App\Models\AttendanceSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceSessionController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    $sessions = AttendanceSession::orderBy('created_at', 'desc')->get();
    return Inertia::render('attendance/session-time', [
      'sessions' => $sessions,
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
   * Store a newly created resource in storage.
   */
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

  /**
   * Display the specified resource.
   */
  public function show(AttendanceSession $attendanceSession)
  {
    //
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(AttendanceSession $attendanceSession)
  {
    //
  }

  /**
   * Update the specified resource in storage.
   */
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

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(AttendanceSession $attendanceSession)
  {
    $attendanceSession->delete();
    
    return redirect()->back()->with('success', 'Session time deleted successfully!');
  }
}
