<?php

namespace App\Http\Controllers;

use App\Models\Position;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PositionController extends Controller
{
    /**
     * Display the position settings page
     */
    public function index(): Response
    {
        $positions = Position::orderBy('department')
            ->orderBy('name')
            ->get();
        
        $departments = Department::orderBy('name')->get();

        return Inertia::render('system-settings/position', [
            'positions' => $positions,
            'departments' => $departments,
        ]);
    }

    /**
     * Store a newly created position
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Position::create([
            'name' => $request->name,
            'department' => $request->department,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Position created successfully.');
    }

    /**
     * Update the specified position
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $position = Position::findOrFail($id);
        $position->update([
            'name' => $request->name,
            'department' => $request->department,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Position updated successfully.');
    }

    /**
     * Remove the specified position
     */
    public function destroy($id)
    {
        $position = Position::findOrFail($id);
        $position->delete();

        return redirect()->back()->with('success', 'Position deleted successfully.');
    }

    /**
     * Get all positions for a specific department (for API)
     */
    public function getByDepartment(Request $request)
    {
        $department = $request->query('department');
        if (!$department) {
            return response()->json([]);
        }

        $positions = Position::where('department', $department)
            ->orderBy('name')
            ->pluck('name')
            ->toArray();
        
        return response()->json($positions);
    }

    /**
     * Get all positions as JSON (for API)
     */
    public function getAll()
    {
        $positions = Position::orderBy('department')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();
        return response()->json($positions);
    }
}
