<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\EmployeeRequest;
use Inertia\Inertia;
use App\Models\Employee;
use App\Models\Fingerprint;
use App\Traits\EmployeeFilterTrait;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class EmployeeController extends Controller
{
    use EmployeeFilterTrait;
    /**
     * Generate a unique employee ID for Add Crew employees
     * Format: AC + 6 digits (AC000001 to AC999999)
     */
    private function generateAddCrewEmployeeId(): string
    {
        $maxAttempts = 100; // Prevent infinite loop
        $attempts = 0;

        do {
            // Generate a random 6-digit number
            $randomDigits = str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            $employeeId = 'AC' . $randomDigits;
            $exists = Employee::where('employeeid', $employeeId)->exists();
            $attempts++;
        } while ($exists && $attempts < $maxAttempts);

        if ($attempts >= $maxAttempts) {
            // Fallback: use timestamp-based ID if too many collisions
            $timestampDigits = str_pad(substr(time(), -4), 4, '0', STR_PAD_LEFT);
            $employeeId = 'AC' . $timestampDigits;
            // Still check if this exists, if so append random digit
            if (Employee::where('employeeid', $employeeId)->exists()) {
                $fallbackDigits = str_pad(substr(time(), -4) . rand(0, 9), 4, '0', STR_PAD_LEFT);
                $employeeId = 'AC' . $fallbackDigits;
            }
        }

        return $employeeId;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $isSupervisor = $user->isSupervisor();
        $isSuperAdmin = $user->isSuperAdmin();

        // Get evaluable departments based on user role
        // HR and Manager see all departments, Admin and Supervisor see only assigned
        $supervisedDepartments = $this->getEvaluableDepartmentsForUser($user);

        // Base query for employees
        $employeeQuery = Employee::with(['fingerprints', 'evaluations' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }]);

        // Filter employees based on user role
        // HR and Manager already get all employees, so only filter for Admin and Supervisor
        $isHR = $user->isHR() && $user->hrAssignments()->where('can_evaluate', true)->exists();
        $isManager = $user->isManager() && $user->managerAssignments()->where('can_evaluate', true)->exists();

        if (!$isSuperAdmin && !$isHR && !$isManager && !empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }

        $employees = $employeeQuery->orderBy('created_at', 'desc')->get();

        $transformedEmployees = $employees->transform(function ($employee) {
            $latestEval = $employee->evaluations->first();
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
                'marital_status' => $employee->marital_status,
                // 'nationality'   => $employee->nationality,
                'address'       => $employee->address,
                'city'          => $employee->city,
                'state'         => $employee->state,
                'country'       => $employee->country,
                'zip_code'      => $employee->zip_code,
                'phone'         => $employee->phone,
                'email'         => $employee->email,
                'position'      => $employee->position,
                'pin'           => $employee->pin,
                'gmail_password' => $employee->gmail_password,
                'recommendation_letter' => $employee->recommendation_letter,
                // HDMF fields
                'hdmf_user_id' => $employee->hdmf_user_id,
                'hdmf_username' => $employee->hdmf_username,
                'hdmf_password' => $employee->hdmf_password,
                // SSS fields
                'sss_user_id' => $employee->sss_user_id,
                'sss_username' => $employee->sss_username,
                'sss_password' => $employee->sss_password,
                // Philhealth fields
                'philhealth_user_id' => $employee->philhealth_user_id,
                'philhealth_username' => $employee->philhealth_username,
                'philhealth_password' => $employee->philhealth_password,
                // TIN fields
                'tin_user_id' => $employee->tin_user_id,
                'tin_username' => $employee->tin_username,
                'tin_password' => $employee->tin_password,
                'created_at'    => $employee->created_at->format('d M Y'),
                'fingerprints'  => $employee->fingerprints->map(function ($fp) {
                    return [
                        'id' => $fp->id,
                        'employee_id' => $fp->employee_id,
                        'finger_name' => $fp->finger_name,
                        'fingerprint_template' => base64_encode($fp->fingerprint_template),
                        'fingerprint_image' => $fp->fingerprint_image ?: null, // return as-is, no base64_encode
                        'fingerprint_captured_at' => $fp->fingerprint_captured_at,
                        'created_at' => $fp->created_at,
                        'updated_at' => $fp->updated_at,
                    ];
                }),
                'latest_rating' => $latestEval ? $latestEval->ratings : null,
            ];
        });

        // Calculate totals based on filtered data
        $totalEmployee = $employees->count();
        $totalDepartment = $isSupervisor && !empty($supervisedDepartments)
            ? count($supervisedDepartments)
            : Employee::distinct('department')->count();

        // Calculate work status counts based on filtered data
        $workStatusCounts = [
            'Regular' => $employees->where('work_status', 'Regular')->count(),
            'Add Crew' => $employees->where('work_status', 'Add Crew')->count(),
            'Probationary' => $employees->where('work_status', 'Probationary')->count(),
            // 'Sessional' => $employees->where('work_status', 'Sessional')->count(),
        ];

        // Previous period calculations - also filter by supervisor role
        $prevMonthStart = now()->subMonth()->startOfMonth();
        $prevEmployeeQuery = Employee::where('created_at', '<', now()->startOfMonth());
        $prevDepartmentQuery = Employee::where('created_at', '<', now()->startOfMonth());

        if ($isSupervisor && !empty($supervisedDepartments)) {
            $prevEmployeeQuery->whereIn('department', $supervisedDepartments);
            $prevDepartmentQuery->whereIn('department', $supervisedDepartments);
        }

        $prevTotalEmployee = $prevEmployeeQuery->count();
        $prevTotalDepartment = $isSupervisor && !empty($supervisedDepartments)
            ? count($supervisedDepartments)
            : $prevDepartmentQuery->distinct('department')->count();

        return Inertia::render('employee/index', [
            'employee'        => $transformedEmployees,
            'totalEmployee'   => $totalEmployee,
            'prevTotalEmployee' => $prevTotalEmployee,
            'totalDepartment' => $totalDepartment,
            'prevTotalDepartment' => $prevTotalDepartment,
            'workStatusCounts' => $workStatusCounts,
            'user_permissions' => [
                'is_supervisor' => $isSupervisor,
                'is_super_admin' => $isSuperAdmin,
                'supervised_departments' => $supervisedDepartments,
            ],
            'departments'     => [
                'Administration',
                'Finance & Accounting',
                'Human Resources',
                'Quality Control',
                'Production',
                'Field Operations',
                'Logistics & Distribution',
                'Research & Development',
                'Sales & Marketing',
                'Maintenance',
                'Engineering',
            ],
            'positions'       => [
                'Admin Assistant',
                'Accountant',
                'HR Officer',
                'Quality Inspector',
                'Production Supervisor',
                'Field Worker',
                'Field Supervisor',
                'Logistics Coordinator',
                'R&D Specialist',
                'Sales Executive',
                'Maintenance Technician',
                'P&D',
            ],
        ]);
    }

    /**
     * API: Return all employees with fingerprints as JSON
     */
    public function apiIndex(Request $request)
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
                'marital_status' => $employee->marital_status,
                // 'nationality'   => $employee->nationality,
                'address'       => $employee->address,
                'city'          => $employee->city,
                'state'         => $employee->state,
                'country'       => $employee->country,
                'zip_code'      => $employee->zip_code,
                'phone'         => $employee->phone,
                'email'         => $employee->email,
                'position'      => $employee->position,
                'gmail_password' => $employee->gmail_password,
                'recommendation_letter' => $employee->recommendation_letter,
                // HDMF fields
                'hdmf_user_id' => $employee->hdmf_user_id,
                'hdmf_username' => $employee->hdmf_username,
                'hdmf_password' => $employee->hdmf_password,
                // SSS fields
                'sss_user_id' => $employee->sss_user_id,
                'sss_username' => $employee->sss_username,
                'sss_password' => $employee->sss_password,
                // Philhealth fields
                'philhealth_user_id' => $employee->philhealth_user_id,
                'philhealth_username' => $employee->philhealth_username,
                'philhealth_password' => $employee->philhealth_password,
                // TIN fields
                'tin_user_id' => $employee->tin_user_id,
                'tin_username' => $employee->tin_username,
                'tin_password' => $employee->tin_password,
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

    public function create() {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(EmployeeRequest $request)
    {
        try {
            // Log the incoming request data for debugging
            \Log::info('Employee creation request received', [
                'employeeid' => $request->employeeid,
                'firstname' => $request->firstname,
                'lastname' => $request->lastname,
                'email' => $request->email
            ]);

            $fullName = $request->firstname . ' '
                . ($request->middlename ? $request->middlename . ' ' : '')
                . $request->lastname;

            // Auto-generate employee ID for Add Crew employees
            $employeeId = $request->employeeid;
            if ($request->work_status === 'Add Crew' && empty($employeeId)) {
                $employeeId = $this->generateAddCrewEmployeeId();
                \Log::info('Auto-generated employee ID for Add Crew', ['employeeid' => $employeeId]);
            }

            $data = [
                'email'           => $request->email,
                'employeeid'      => $employeeId,
                'firstname'       => $request->firstname,
                'middlename'      => $request->middlename,
                'lastname'        => $request->lastname,
                'employee_name'   => $fullName,
                'phone'           => $request->phone,
                'gender'          => $request->gender,
                'marital_status'  => $request->marital_status,
                // 'nationality'     => $request->nationality,
                'address'         => $request->address,
                'city'            => $request->city,
                'state'           => $request->state,
                'country'         => $request->country,
                'zip_code'        => $request->zip_code,
                'work_status'     => $request->work_status,
                'service_tenure'  => $request->service_tenure,
                'date_of_birth'   => $request->date_of_birth,
                'department'      => $request->department,
                'position'        => $request->position,
                'gmail_password' => $request->gmail_password,
                // HDMF fields
                'hdmf_user_id' => $request->hdmf_user_id,
                'hdmf_username' => $request->hdmf_username,
                'hdmf_password' => $request->hdmf_password,
                // SSS fields
                'sss_user_id' => $request->sss_user_id,
                'sss_username' => $request->sss_username,
                'sss_password' => $request->sss_password,
                // Philhealth fields
                'philhealth_user_id' => $request->philhealth_user_id,
                'philhealth_username' => $request->philhealth_username,
                'philhealth_password' => $request->philhealth_password,
                // TIN fields
                'tin_user_id' => $request->tin_user_id,
                'tin_username' => $request->tin_username,
                'tin_password' => $request->tin_password,
            ];

            // Log the data array before creating
            \Log::info('Employee data array prepared', $data);

            if ($request->hasFile('picture')) {
                $file = $request->file('picture');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('uploads', $filename, 'public');
                $data['picture'] = '/storage/' . $path;
            }

            if ($request->hasFile('recommendation_letter')) {
                $file = $request->file('recommendation_letter');
                $filename = time() . '_recommendation_' . $file->getClientOriginalName();
                $path = $file->storeAs('uploads/recommendations', $filename, 'public');
                $data['recommendation_letter'] = '/storage/' . $path;
            }

            // Try to create the employee with error handling
            try {
                $employee = Employee::create($data);
                \Log::info('Employee::create() called successfully', ['employee_id' => $employee->id ?? 'null']);
            } catch (\Exception $e) {
                \Log::error('Employee::create() failed', [
                    'error' => $e->getMessage(),
                    'data' => $data
                ]);
                throw $e;
            }

            if ($employee) {
                // Log the successful creation for debugging
                \Log::info('Employee created successfully', [
                    'employee_id' => $employee->id,
                    'employeeid' => $employee->employeeid,
                    'employee_name' => $employee->employee_name
                ]);

                // Only return JSON for API requests
                if ($request->wantsJson() || $request->is('api/*')) {
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Employee created successfully.',
                        'employee' => $employee,
                    ], 201);
                }
                // For Inertia/web requests, redirect back with success message
                return redirect()->back()->with('success', 'Employee created successfully');
            } else {
                \Log::error('Employee creation returned null/empty result');
            }

            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unable to create employee. Please try again.'
                ], 500);
            }
            return redirect()->back()->with('error', 'Unable to create employee. Please try again.');
        } catch (\Exception $e) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to create employee Server error.'
                ], 500);
            }
            return redirect()->back()->with('error', 'Failed to create employee Server error.');
        }
    }

    public function show($id)
    {
        $employee = Employee::with('fingerprints')->findOrFail($id);
        $employee->fingerprints = $employee->fingerprints->map(function ($fp) {
            return [
                'id' => $fp->id,
                'employee_id' => $fp->employee_id,
                'finger_name' => $fp->finger_name,
                'fingerprint_template' => base64_encode($fp->fingerprint_template),
                'fingerprint_image' => $fp->fingerprint_image ? base64_encode($fp->fingerprint_image) : null,
                'fingerprint_captured_at' => $fp->fingerprint_captured_at,
                'created_at' => $fp->created_at,
                'updated_at' => $fp->updated_at,
            ];
        });
        return response()->json($employee);
    }

    public function edit(Employee $employee) {}

    public function update(EmployeeRequest $request, $id)
    {
        try {
            Log::info('Incoming request data:', $request->all());
            $validatedData = $request->validated();
            Log::info('Validated data:', $validatedData);
            $employee = Employee::findOrFail($id);
            $fullName = $validatedData['firstname'] . ' ' .
                (!empty($validatedData['middlename']) ? $validatedData['middlename'] . ' ' : '') .
                $validatedData['lastname'];
            $validatedData['employee_name'] = $fullName;
            if ($request->hasFile('picture')) {
                Log::info('[DEBUG] Picture file received:', [
                    'filename' => $request->file('picture')->getClientOriginalName(),
                    'size' => $request->file('picture')->getSize(),
                ]);
                if ($employee->picture && file_exists(public_path($employee->picture))) {
                    Log::info('[DEBUG] Deleting old picture: ' . public_path($employee->picture));
                    unlink(public_path($employee->picture));
                }
                $file = $request->file('picture');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('uploads', $filename, 'public');
                Log::info('[DEBUG] File stored at path: ' . $path);
                $validatedData['picture'] = '/storage/' . $path;
            } else {
                Log::info('[DEBUG] No new picture uploaded, keeping old picture.');
                $validatedData['picture'] = $employee->picture;
            }
            Log::info('Final data before saving:', $validatedData);
            $employee->update($validatedData);
            Log::info('Employee updated successfully', ['employee_id' => $employee->id]);
            return redirect()->route('employee.index')->with('success', 'Employee updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Employee Update Validation Failed: ' . $e->getMessage());
            Log::info('Validation errors:', $e->errors());
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Employee Update Failed: ' . $e->getMessage());
            Log::info('Request all:', $request->all());
            return redirect()->back()->with('error', 'Failed to update employee. Server error.');
        }
    }

    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);
        $employee->delete();
        return redirect()->back()->with('success', 'Employee deleted');
    }
}
