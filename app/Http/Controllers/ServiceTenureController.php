<?php

namespace App\Http\Controllers;

use App\Models\ServiceTenure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use Illuminate\Support\Facades\Log;
use App\Traits\EmployeeFilterTrait;
use Illuminate\Support\Facades\Auth;



class ServiceTenureController extends Controller
{
    use EmployeeFilterTrait;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('service-tenure/index');
    }

    public function employee()
    {
        $user = Auth::user();

        // Use filtered employees based on user role
        $baseQuery = Employee::with(['serviceTenure' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }]);

        $employees = $this->getFilteredEmployees($user, $baseQuery);

        $employeeList = $employees->map(function ($employee) {
            $latestServiceTenure = $employee->serviceTenure->first();

            // Calculate length of service from service_tenure date
            $lengthOfService = '';
            if ($employee->service_tenure) {
                $startDate = \Carbon\Carbon::parse($employee->service_tenure);
                $now = \Carbon\Carbon::now();
                $diff = $startDate->diff($now);
                $lengthOfService = $diff->y . ' years, ' . $diff->m . ' months';
            }

            // Status logic: Active if payment not fully done AND not retired, Inactive if payment fully done OR retired
            $status = 'Active'; // Default to Active
            if ($latestServiceTenure) {
                // Check if payment is fully done (remaining_years = 0 means fully paid)
                $isPaymentFullyDone = $latestServiceTenure->remaining_years <= 0;
                // Use the status field from service_tenures table
                $serviceTenureStatus = $latestServiceTenure->status;

                // If payment is fully done or status indicates inactive, mark as inactive
                if ($isPaymentFullyDone || ($serviceTenureStatus && strtolower($serviceTenureStatus) === 'inactive')) {
                    $status = 'Inactive';
                }
            }

            return [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'picture' => $employee->picture,
                'department' => $employee->department,
                'position' => $employee->position,
                'service_tenure' => $employee->service_tenure ? \Carbon\Carbon::parse($employee->service_tenure)->format('M d, Y') : '',
                'length_of_service' => $lengthOfService,
                'years_claim' => $latestServiceTenure ? $latestServiceTenure->years_claim : '0',
                'status' => $status,
            ];
        });

        return Inertia::render('service-tenure/employee', [
            'employees_all' => $employeeList,
        ]);
    }

    public function serviceTenure()
    {
        $user = Auth::user();

        // Use filtered employees based on user role
        $baseQuery = Employee::with(['serviceTenure' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }]);

        $employees = $this->getFilteredEmployees($user, $baseQuery);

        $employeeList = $employees->map(function ($employee) {
            $latestServiceTenure = $employee->serviceTenure->first();

            // Calculate length of service from service_tenure date
            $lengthOfService = '';
            if ($employee->service_tenure) {
                $startDate = \Carbon\Carbon::parse($employee->service_tenure);
                $now = \Carbon\Carbon::now();
                $diff = $startDate->diff($now);
                $lengthOfService = $diff->y . ' years, ' . $diff->m . ' months';
            }

            // Status logic: Active if payment not fully done AND not retired, Inactive if payment fully done OR retired
            $status = 'Active'; // Default to Active
            if ($latestServiceTenure) {
                // Check if payment is fully done (remaining_years = 0 means fully paid)
                $isPaymentFullyDone = $latestServiceTenure->remaining_years <= 0;
                // Use the status field from service_tenures table
                $serviceTenureStatus = $latestServiceTenure->status;

                // If payment is fully done or status indicates inactive, mark as inactive
                if ($isPaymentFullyDone || ($serviceTenureStatus && strtolower($serviceTenureStatus) === 'inactive')) {
                    $status = 'Inactive';
                }
            }

            return [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'picture' => $employee->picture,
                'department' => $employee->department,
                'position' => $employee->position,
                'service_tenure' => $employee->service_tenure ? \Carbon\Carbon::parse($employee->service_tenure)->format('M d, Y') : '',
                'length_of_service' => $lengthOfService,
                'years_claim' => $latestServiceTenure ? $latestServiceTenure->years_claim : '0',
                'status' => $status,
            ];
        });

        return Inertia::render('service-tenure/service-tenure', [
            'employees_all' => $employeeList,
        ]);
    }

    public function payAdvancement()
    {
        try {
            $user = Auth::user();

            // Base query with additional filters for pay advancement
            $baseQuery = Employee::with(['serviceTenure' => function ($q) {
                $q->orderBy('created_at', 'desc');
            }])
                ->where('work_status', 'Regular');
            // ->whereNotNull('service_tenure') // Only employees with service tenure date

            // Use filtered employees based on user role
            $employees = $this->getFilteredEmployees($user, $baseQuery);

            // Debug: Log the count of employees found
            Log::info('Pay Advancement - Employees found: ' . $employees->count());

            $employeeList = $employees->map(function ($employee) {
                $latestServiceTenure = $employee->serviceTenure->first();

                // Calculate length of service from service_tenure date
                $lengthOfService = '';
                $totalYears = 0;
                if ($employee->service_tenure) {
                    $startDate = \Carbon\Carbon::parse($employee->service_tenure);
                    $now = \Carbon\Carbon::now();
                    $diff = $startDate->diff($now);
                    $lengthOfService = $diff->y . ' years, ' . $diff->m . ' months';
                    $totalYears = $diff->y ?? 0;
                }

                // Calculate remaining years
                $claimedYears = $latestServiceTenure ? $latestServiceTenure->years_claim : 0;
                $remainingYears = max(0, $totalYears - $claimedYears);

                return [
                    'id' => $employee->id,
                    'employeeid' => $employee->employeeid,
                    'employee_name' => $employee->employee_name,
                    'department' => $employee->department,
                    'position' => $employee->position,
                    'service_tenure' => $employee->service_tenure ? \Carbon\Carbon::parse($employee->service_tenure)->format('M d, Y') : '',
                    'length_of_service' => $lengthOfService,
                    'years_claim' => $claimedYears,
                    'remaining_years' => $remainingYears,
                    'status' => $employee->work_status,
                ];
            });

            // Debug: Log the processed employee list
            Log::info('Pay Advancement - Processed employees: ' . $employeeList->count());

            return Inertia::render('service-tenure/pay-advancement', [
                'employees' => $employeeList,
            ]);
        } catch (\Exception $e) {
            Log::error('Pay Advancement Error: ' . $e->getMessage());
            return Inertia::render('service-tenure/pay-advancement', [
                'employees' => [],
                'errors' => ['error' => 'Failed to load employees: ' . $e->getMessage()]
            ]);
        }
    }

    /**
     * Store pay advancement request
     */
    public function storePayAdvancement(Request $request)
    {
        try {
            $validated = $request->validate([
                'employee_id' => 'required|exists:employees,id',
                'years_to_pay' => 'required|integer|min:1',
                'equivalent_amount' => 'nullable|numeric|min:0',
                'date_of_payout' => 'required|date|after:today',
                'remarks' => 'nullable|string|max:500',
            ]);

            // Check if employee has enough remaining years
            $employee = Employee::findOrFail($validated['employee_id']);
            $latestServiceTenure = $employee->serviceTenure()->latest()->first();

            $startDate = \Carbon\Carbon::parse($employee->service_tenure);
            $now = \Carbon\Carbon::now();
            $diff = $startDate->diff($now);
            $totalYears = $diff->y ?? 0;
            $claimedYears = $latestServiceTenure ? $latestServiceTenure->years_claim : 0;
            $remainingYears = max(0, $totalYears - $claimedYears);

            if ($validated['years_to_pay'] > $remainingYears) {
                return back()->withErrors([
                    'years_to_pay' => "Cannot exceed remaining years ({$remainingYears})"
                ]);
            }

            // Create or update service tenure record
            $newClaimedYears = $claimedYears + $validated['years_to_pay'];
            $newRemainingYears = max(0, $totalYears - $newClaimedYears);

            ServiceTenure::create([
                'employee_id' => $validated['employee_id'],
                'years_claim' => $newClaimedYears,
                'remaining_years' => $newRemainingYears,
                'total_years' => $totalYears,
                'status' => 'pending',
                'remarks' => $validated['remarks'],
                'date_of_payout' => $validated['date_of_payout'],
                'date_of_approval' => null,
            ]);

            return redirect()->route('service-tenure.pay-advancement')->with([
                'success' => 'Pay advancement request submitted successfully!'
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to submit pay advancement request: ' . $e->getMessage()
            ]);
        }
    }

    public function report()
    {
        return Inertia::render('service-tenure/report');
    }

    /**
     * Recalculate service tenure for all employees
     */
    public function recalculate()
    {
        try {
            $user = Auth::user();

            // Use filtered employees based on user role
            $baseQuery = Employee::with(['serviceTenure' => function ($q) {
                $q->orderBy('created_at', 'desc');
            }]);

            $employees = $this->getFilteredEmployees($user, $baseQuery);

            $employeeList = $employees->map(function ($employee) {
                $latestServiceTenure = $employee->serviceTenure->first();

                // Calculate length of service from service_tenure date
                $lengthOfService = '';
                if ($employee->service_tenure) {
                    $startDate = \Carbon\Carbon::parse($employee->service_tenure);
                    $now = \Carbon\Carbon::now();
                    $diff = $startDate->diff($now);
                    $lengthOfService = $diff->y . ' years, ' . $diff->m . ' months';
                }

                // Status logic: Active if payment not fully done AND not retired, Inactive if payment fully done OR retired
                $status = 'Active'; // Default to Active
                if ($latestServiceTenure) {
                    // Check if payment is fully done (remaining_years = 0 means fully paid)
                    $isPaymentFullyDone = $latestServiceTenure->remaining_years <= 0;
                    // Use the status field from service_tenures table
                    $serviceTenureStatus = $latestServiceTenure->status;

                    // If payment is fully done or status indicates inactive, mark as inactive
                    if ($isPaymentFullyDone || ($serviceTenureStatus && strtolower($serviceTenureStatus) === 'inactive')) {
                        $status = 'Inactive';
                    }
                }

                return [
                    'id' => $employee->id,
                    'employeeid' => $employee->employeeid,
                    'employee_name' => $employee->employee_name,
                    'picture' => $employee->picture,
                    'department' => $employee->department,
                    'position' => $employee->position,
                    'service_tenure' => $employee->service_tenure ? \Carbon\Carbon::parse($employee->service_tenure)->format('M d, Y') : '',
                    'length_of_service' => $lengthOfService,
                    'years_claim' => $latestServiceTenure ? $latestServiceTenure->years_claim : '0',
                    'status' => $status,
                ];
            });

            return redirect()->route('service-tenure.service-tenure')->with([
                'employees_all' => $employeeList,
                'success' => 'Service tenure calculations refreshed successfully!'
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to recalculate service tenure: ' . $e->getMessage()]);
        }
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ServiceTenure $serviceTenure)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ServiceTenure $serviceTenure)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ServiceTenure $serviceTenure)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ServiceTenure $serviceTenure)
    {
        //
    }
}
