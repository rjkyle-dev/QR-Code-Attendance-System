<?php

namespace App\Http\Controllers;

// use Faker\Provider\ar_EG\Payment;

use App\Http\Requests\TestRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Test;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
//     public function index(): Response
// {
//     return Inertia::render('employee/index', [
//         'employee' => Employee::orderBy('created_at', 'desc')->get(),
//         // 'totalRevenue' => Payments::sum('amount'),
//          'totalEmployee' => Employee::distinct('employeeid')->count('employeeid'),
//          'totalDepartment' => Employee::distinct('department')->count()

//     ]);
// }

public function index(): Response
{
    // Fetch the employee data
    $employees = Test::orderBy('created_at', 'desc')->get();

    // Transform the employee data
    $transformedEmployees = $employees->transform(fn($employee) => [
        'id'            => $employee->id,
        'employee_name'          => $employee->employee_name, // Transform employee data
        'employee_id'   => $employee->employeeid,
        'work_status'   => $employee->work_status,
        'service_tenure'   => $employee->service_tenure,
        'department'    => $employee->department,
        'picture'    => $employee->picture,
        'gender'    => $employee->gender,
        'phone'    => $employee->phone,
        'email'    => $employee->email,
        'position'    => $employee->position,
        'created_at'    => $employee->created_at->format('d M Y'), // Formatting the date
    ]);

    // Aggregated data for total count of unique employees and departments
    $totalEmployee = Test::distinct('employeeid')->count('employeeid');
    $totalDepartment = Test::distinct('department')->count();

    // Return the data to Inertia
    return Inertia::render('test/index', [
        'employee'     => $transformedEmployees,  // Pass transformed data to Inertia
        'totalEmployee' => $totalEmployee,         // Pass aggregate data
        'totalDepartment' => $totalDepartment,     // Pass aggregate data
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
 public function store(TestRequest $request)
{
    try {

        $fullName = $request->firstname . ' ' 
                  . ($request->middlename ? $request->middlename . ' ' : '') 
                  . $request->lastname;

        $data = [
            'email'           => $request->email,
            'employeeid'      => $request->employeeid,
            'firstname'       => $request->firstname,
            'middlename'      => $request->middlename,
            'lastname'        => $request->lastname,
            'employee_name'   => $fullName,
            'phone'           => $request->phone,
            'gender'          => $request->gender,
            'status'          => $request->status,
            'work_status'     => $request->work_status,
            'service_tenure'  => $request->service_tenure,
            'department'      => $request->department,
            'position'        => $request->position,
        ];
        
        
        
        if ($request->hasFile('picture')) {
            $file = $request->file('picture');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $data['picture'] = '/storage/' . $path;
        }

      $value = Test::create($data);
            
       
      if($value){
        return redirect()->route('test.index')->with('success', 'Test create successfully');
      }

      return redirect()->back()->with('error', 'Unable to create test. Please try again.');

   
    } catch (\Exception $e) {
        Log::error('Employee Failed: ' . $e->getMessage());
        Log::info('No file uploaded');
        return redirect()->back()->with('error', 'Failed to create test. Server error.');
    }
}



    /**
     * Display the specified resource.
     */
    public function show($id)
{
    $employee = Test::findOrFail($id);
    return response()->json($employee);
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Test $employee)
    {
        //
    }

  public function update(Request $request, $id)
{
    try {
        // Validate incoming data
        $validatedData = $request->validate([
            'email' => 'email|unique:employees,email,' . $id,
            'employeeid' => 'string|max:100',
            'firstname' => 'string|max:100',
            'middlename' => 'nullable|string|max:100',
            'lastname' => 'string|max:100',
            'phone' => 'string|max:20',
            'department' => 'string|max:100',
            'position' => 'string|max:100',
            'status' => 'string|max:50',
            'service_tenure' => 'date',
            'gender' => 'string|max:50',
            'work_status' => 'max:50',
            'picture' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        Log::info('Service tenure received:', [$request->input('service_tenure')]);

        // Find the employee record
        $employee = Test::findOrFail($id);

        // Build full name
        $fullName = $validatedData['firstname'] . ' ' .
                    (!empty($validatedData['middlename']) ? $validatedData['middlename'] . ' ' : '') .
                    $validatedData['lastname'];

        $validatedData['employee_name'] = $fullName;

        // If a new picture was uploaded
        if ($request->hasFile('picture')) {
            $file = $request->file('picture');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $validatedData['picture'] = '/storage/' . $path;
        }

        // Update employee data
        $employee->update($validatedData);

        return response()->json(['message' => 'Employee updated successfully!'], 200);

    } catch (\Exception $e) {
        Log::error('Employee Update Failed: '.$e->getMessage());
        Log::info('Request all:', $request->all());
        return response()->json(['message' => 'Failed to update employee. Server error.'], 500);
    }
}



    
    public function destroy($id)
    {
        $employee = Test::findOrFail($id);
        $employee->delete();
        return redirect()->back()->with('success', 'Employee deleted');
    }
}
