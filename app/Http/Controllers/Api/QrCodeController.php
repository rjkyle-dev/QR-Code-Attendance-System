<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class QrCodeController extends Controller
{
    /**
     * Generate QR code token for logged-in employee
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generate(Request $request)
    {
        // Get employee from session
        $employeeId = Session::get('employee_id');

        if (!$employeeId) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not authenticated'
            ], 401);
        }

        $employee = Employee::where('employeeid', $employeeId)->first();

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        // Rate limiting: max 10 requests per employee per minute
        $key = 'qr_generate:' . $employee->id;
        if (RateLimiter::tooManyAttempts($key, 10)) {
            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please wait before generating a new QR code.'
            ], 429);
        }

        RateLimiter::hit($key, 60); // 60 seconds window

        try {
            // Generate QR code data (default 60 seconds expiry)
            $expiresIn = (int) ($request->input('expires_in', 60));
            $qrData = $employee->generateQrCodeData($expiresIn);

            return response()->json([
                'success' => true,
                'token' => $qrData['token'],
                'expires_at' => $qrData['expires_at'],
                'expires_in' => $qrData['expires_in'],
                'qr_data' => $qrData['qr_data'],
            ]);
        } catch (\Exception $e) {
            Log::error('QR Code generation failed', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code. Please try again.'
            ], 500);
        }
    }

    /**
     * Generate QR code for any employee (Admin only)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateForEmployee(Request $request)
    {
        // Check if user is authenticated (admin)
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $request->validate([
            'employee_id' => 'required|integer|exists:employees,id',
            'expires_in' => 'nullable|integer|min:30|max:300',
        ]);

        $employee = Employee::find($request->employee_id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        try {
            // Generate QR code data (default 60 seconds expiry, but can be longer for admin)
            $expiresIn = (int) ($request->input('expires_in', 300)); // Default 5 minutes for admin
            $qrData = $employee->generateQrCodeData($expiresIn);

            return response()->json([
                'success' => true,
                'token' => $qrData['token'],
                'expires_at' => $qrData['expires_at'],
                'expires_in' => $qrData['expires_in'],
                'qr_data' => $qrData['qr_data'],
                'employee' => [
                    'id' => $employee->id,
                    'employeeid' => $employee->employeeid,
                    'employee_name' => $employee->employee_name,
                    'firstname' => $employee->firstname,
                    'lastname' => $employee->lastname,
                    'department' => $employee->department,
                    'position' => $employee->position,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('QR Code generation failed (admin)', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code. Please try again.'
            ], 500);
        }
    }
}
