<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    /**
     * Display the department settings page
     */
    public function index(): Response
    {
        $departments = Department::orderBy('name')->get();

        return Inertia::render('system-settings/department', [
            'departments' => $departments,
        ]);
    }

    /**
     * Store a newly created department
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
        ]);

        Department::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Department created successfully.');
    }

    /**
     * Update the specified department
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $department = Department::findOrFail($id);
        $department->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Department updated successfully.');
    }

    /**
     * Remove the specified department
     */
    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        $department->delete();

        return redirect()->back()->with('success', 'Department deleted successfully.');
    }

    /**
     * Get all departments as JSON (for API)
     */
    public function getAll()
    {
        $departments = Department::orderBy('name')->pluck('name')->toArray();
        return response()->json($departments);
    }
}
