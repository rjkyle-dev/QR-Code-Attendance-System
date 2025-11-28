<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use Illuminate\Support\Facades\Log;
use App\Models\Fingerprint;

class FingerprintController extends Controller
{
  // Registration endpoint
  public function store(Request $request)
  {
    $request->validate([
      'employeeid' => 'nullable|string', // Made nullable to support Add Crew
      'employee_db_id' => 'nullable|integer', // New field for database ID
      'fingerprint_template' => 'required|string', // base64 from C#
      'fingerprint_image' => 'nullable|string',
      'fingerprint_captured_at' => 'required|date',
      'finger_name' => 'nullable|string',
    ]);

    // Validate that at least one identifier is provided
    if (!$request->employeeid && !$request->employee_db_id) {
      return response()->json([
        'status' => 'error',
        'message' => 'Either employeeid or employee_db_id is required.',
      ], 400);
    }

    // Find employee by employeeid or database ID
    if ($request->employeeid) {
      $employee = Employee::where('employeeid', $request->employeeid)->first();
    } else {
      $employee = Employee::find($request->employee_db_id);
    }

    if (!$employee) {
      return response()->json([
        'status' => 'error',
        'message' => 'Employee not found.',
      ], 404);
    }

    // Decode base64 to raw bytes
    $templateBytes = base64_decode($request->fingerprint_template);

    $fingerprint = Fingerprint::create([
      'employee_id' => $employee->id,
      'fingerprint_template' => $templateBytes, // store as BLOB
      'fingerprint_image' => $request->fingerprint_image,
      'fingerprint_captured_at' => date('Y-m-d H:i:s', strtotime($request->fingerprint_captured_at)),
      'finger_name' => $request->finger_name,
    ]);

    return response()->json(['status' => 'success']);
  }

  // Verification endpoint (for specific employee)
  public function verify(Request $request)
  {
    $request->validate([
      'fingerprint_template' => 'required|string', // base64 string
      'employeeid' => 'nullable|string',
      'employee_db_id' => 'nullable|integer', // New field for database ID
    ]);

    // Validate that at least one identifier is provided
    if (!$request->employeeid && !$request->employee_db_id) {
      return response()->json([
        'status' => 'error',
        'message' => 'Either employeeid or employee_db_id is required.',
      ], 400);
    }

    // Find employee by employeeid or database ID
    if ($request->employeeid) {
      $employee = Employee::where('employeeid', $request->employeeid)->first();
    } else {
      $employee = Employee::find($request->employee_db_id);
    }

    if (!$employee) {
      return response()->json([
        'status' => 'error',
        'message' => 'Employee not found.',
      ], 404);
    }

    // Decode incoming template
    $incomingBytes = base64_decode($request->fingerprint_template);

    // Get all fingerprints for employee
    $fingerprints = Fingerprint::where('employee_id', $employee->id)->get();

    foreach ($fingerprints as $fingerprint) {
      if (hash_equals($fingerprint->fingerprint_template, $incomingBytes)) {
        return response()->json([
          'status' => 'success',
          'message' => 'Fingerprint verified.',
          'employee' => $employee,
        ]);
      }
    }

    return response()->json([
      'status' => 'not_matched',
      'message' => 'Fingerprint not verified.',
    ]);
  }

  // Return all fingerprints for C# device
  public function all()
  {
    $fingerprints = Fingerprint::with('employee')->get();
    return response()->json(
      $fingerprints->map(function ($fp) {
        return [
          'employeeid' => $fp->employee ? $fp->employee->employeeid : null,
          // Encode raw bytes as base64 for C#
          'template' => base64_encode($fp->fingerprint_template),
        ];
      })
    );
  }
}
