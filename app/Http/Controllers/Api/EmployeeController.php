<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;

class EmployeeController extends Controller
{
  /**
   * API: Return all employees with fingerprints as JSON
   */
  public function index(Request $request)
  {
    $employees = Employee::with('fingerprints')->orderBy('created_at', 'desc')->get();
    $transformedEmployees = $employees->transform(function ($employee) {
      return [
        'id'            => $employee->id,
        'employee_name' => $employee->employee_name,
        'firstname'     => $employee->firstname,
        'middlename'    => $employee->middlename,
        'lastname'      => $employee->lastname,
        'employeeid'    => $employee->employeeid,
        'work_status'   => $employee->work_status,
        'service_tenure' => $employee->service_tenure,
        'department'    => $employee->department,
        'picture'       => $employee->picture,
        'date_of_birth' => $employee->date_of_birth,
        'gender'        => $employee->gender,
        'status'        => $employee->status,
        'phone'         => $employee->phone,
        'email'         => $employee->email,
        'pin'           => $employee->pin,
        'position'      => $employee->position,
                'gmail_password' => $employee->gmail_password,
        'nbi_clearance' => $employee->nbi_clearance,
        // HDMF fields
        'hdmf_user_id' => $employee->hdmf_user_id,
        // SSS fields
        'sss_user_id' => $employee->sss_user_id,
        // Philhealth fields
        'philhealth_user_id' => $employee->philhealth_user_id,
        // TIN fields
        'tin_user_id' => $employee->tin_user_id,
        'created_at'    => $employee->created_at->format('d M Y'),
        'fingerprints'  => $employee->fingerprints->map(function ($fp) {
          return [
            'id' => $fp->id,
            'employee_id' => $fp->employee_id,
            'finger_name' => $fp->finger_name,
            'fingerprint_template' => base64_encode($fp->fingerprint_template),
            'fingerprint_image' => $fp->fingerprint_image ?: null,
            'fingerprint_captured_at' => $fp->fingerprint_captured_at,
            'created_at' => $fp->created_at,
            'updated_at' => $fp->updated_at,
          ];
        }),
      ];
    });
    return response()->json($transformedEmployees);
  }
}
