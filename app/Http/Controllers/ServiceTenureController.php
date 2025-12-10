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

    public function index()
    {
        return Inertia::render('service-tenure/index');
    }

    public function employee()
    {
        $user = Auth::user();

        $baseQuery = Employee::with(['serviceTenure' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }]);

        $employees = $this->getFilteredEmployees($user, $baseQuery);

        $employeeList = $employees->map(function ($employee) {
            $latestServiceTenure = $employee->serviceTenure->first();

            $lengthOfService = '';
            if ($employee->service_tenure) {
                $startDate = \Carbon\Carbon::parse($employee->service_tenure);
                $now = \Carbon\Carbon::now();
                $diff = $startDate->diff($now);
                $lengthOfService = $diff->y . ' years, ' . $diff->m . ' months';
            }

            $status = 'Active';
            if ($latestServiceTenure) {
                $isPaymentFullyDone = $latestServiceTenure->remaining_years <= 0;
                $serviceTenureStatus = $latestServiceTenure->status;

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

        $baseQuery = Employee::with(['serviceTenure' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }]);

        $employees = $this->getFilteredEmployees($user, $baseQuery);

        $employeeList = $employees->map(function ($employee) {
            $latestServiceTenure = $employee->serviceTenure->first();

            $lengthOfService = '';
            if ($employee->service_tenure) {
                $startDate = \Carbon\Carbon::parse($employee->service_tenure);
                $now = \Carbon\Carbon::now();
                $diff = $startDate->diff($now);
                $lengthOfService = $diff->y . ' years, ' . $diff->m . ' months';
            }

            $status = 'Active';
            if ($latestServiceTenure) {
                $isPaymentFullyDone = $latestServiceTenure->remaining_years <= 0;
                $serviceTenureStatus = $latestServiceTenure->status;

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

            $baseQuery = Employee::with(['serviceTenure' => function ($q) {
                $q->orderBy('created_at', 'desc');
            }])
                ->where('work_status', 'Regular');

            $employees = $this->getFilteredEmployees($user, $baseQuery);

            Log::info('Pay Advancement - Employees found: ' . $employees->count());

            $employeeList = $employees->map(function ($employee) {
                $latestServiceTenure = $employee->serviceTenure->first();

                $lengthOfService = '';
                $totalYears = 0;
                if ($employee->service_tenure) {
                    $startDate = \Carbon\Carbon::parse($employee->service_tenure);
                    $now = \Carbon\Carbon::now();
                    $diff = $startDate->diff($now);
                    $lengthOfService = $diff->y . ' years, ' . $diff->m . ' months';
                    $totalYears = $diff->y ?? 0;
                }

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

    public function recalculate()
    {
        try {
            $user = Auth::user();

            $baseQuery = Employee::with(['serviceTenure' => function ($q) {
                $q->orderBy('created_at', 'desc');
            }]);

            $employees = $this->getFilteredEmployees($user, $baseQuery);

            $employeeList = $employees->map(function ($employee) {
                $latestServiceTenure = $employee->serviceTenure->first();

                $lengthOfService = '';
                if ($employee->service_tenure) {
                    $startDate = \Carbon\Carbon::parse($employee->service_tenure);
                    $now = \Carbon\Carbon::now();
                    $diff = $startDate->diff($now);
                    $lengthOfService = $diff->y . ' years, ' . $diff->m . ' months';
                }

                $status = 'Active';
                if ($latestServiceTenure) {
                    $isPaymentFullyDone = $latestServiceTenure->remaining_years <= 0;
                    $serviceTenureStatus = $latestServiceTenure->status;

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

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    public function show(ServiceTenure $serviceTenure)
    {
        //
    }

    public function edit(ServiceTenure $serviceTenure)
    {
        //
    }

    public function update(Request $request, ServiceTenure $serviceTenure)
    {
        //
    }

    public function destroy(ServiceTenure $serviceTenure)
    {
        //
    }
}
