<?php

namespace App\Http\Controllers;

use App\Models\MaritalStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaritalStatusController extends Controller
{
    /**
     * Display the marital status settings page
     */
    public function index(): Response
    {
        $maritalStatuses = MaritalStatus::orderBy('name')->get();

        return Inertia::render('system-settings/marital-status', [
            'maritalStatuses' => $maritalStatuses,
        ]);
    }

    /**
     * Store a newly created marital status
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:marital_statuses,name',
            'description' => 'nullable|string',
        ]);

        MaritalStatus::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Marital status created successfully.');
    }

    /**
     * Update the specified marital status
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:marital_statuses,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $maritalStatus = MaritalStatus::findOrFail($id);
        $maritalStatus->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Marital status updated successfully.');
    }

    /**
     * Remove the specified marital status
     */
    public function destroy($id)
    {
        $maritalStatus = MaritalStatus::findOrFail($id);
        $maritalStatus->delete();

        return redirect()->back()->with('success', 'Marital status deleted successfully.');
    }

    /**
     * Get all marital statuses as JSON (for API)
     */
    public function getAll()
    {
        $maritalStatuses = MaritalStatus::orderBy('name')->pluck('name')->toArray();
        return response()->json($maritalStatuses);
    }
}

