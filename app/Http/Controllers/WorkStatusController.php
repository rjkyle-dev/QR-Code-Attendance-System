<?php

namespace App\Http\Controllers;

use App\Models\WorkStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkStatusController extends Controller
{
    /**
     * Display the work status settings page
     */
    public function index(): Response
    {
        $workStatuses = WorkStatus::orderBy('name')->get();

        return Inertia::render('system-settings/work-status', [
            'workStatuses' => $workStatuses,
        ]);
    }

    /**
     * Store a newly created work status
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:work_statuses,name',
            'description' => 'nullable|string',
        ]);

        WorkStatus::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Work status created successfully.');
    }

    /**
     * Update the specified work status
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:work_statuses,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $workStatus = WorkStatus::findOrFail($id);
        $workStatus->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Work status updated successfully.');
    }

    /**
     * Remove the specified work status
     */
    public function destroy($id)
    {
        $workStatus = WorkStatus::findOrFail($id);
        $workStatus->delete();

        return redirect()->back()->with('success', 'Work status deleted successfully.');
    }

    /**
     * Get all work statuses as JSON (for API)
     */
    public function getAll()
    {
        $workStatuses = WorkStatus::orderBy('name')->pluck('name')->toArray();
        return response()->json($workStatuses);
    }
}

