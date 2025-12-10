<?php

namespace App\Http\Controllers;

use App\Models\GenderDevelopmentReport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GenderDevelopmentReportController extends Controller
{
    public function getHR()
    {
        $hr = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['HR', 'HR Manager', 'HR Personnel']);
        })->first();

        if (!$hr) {
            return response()->json(['error' => 'No HR employee found'], 404);
        }

        return response()->json([
            'id' => $hr->id,
            'name' => $hr->fullname,
        ]);
    }

    public function getManager()
    {
        $manager = User::whereHas('roles', function ($query) {
            $query->where('name', 'Manager');
        })->first();

        if (!$manager) {
            return response()->json(['error' => 'No Manager found'], 404);
        }

        return response()->json([
            'id' => $manager->id,
            'name' => $manager->fullname,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'male_count' => 'required|integer|min:0',
            'female_count' => 'required|integer|min:0',
            'total_count' => 'required|integer|min:0',
            'age_20_30_male' => 'required|integer|min:0',
            'age_20_30_female' => 'required|integer|min:0',
            'age_20_30_total' => 'required|integer|min:0',
            'age_31_40_male' => 'required|integer|min:0',
            'age_31_40_female' => 'required|integer|min:0',
            'age_31_40_total' => 'required|integer|min:0',
            'age_41_50_male' => 'required|integer|min:0',
            'age_41_50_female' => 'required|integer|min:0',
            'age_41_50_total' => 'required|integer|min:0',
            'age_51_plus_male' => 'required|integer|min:0',
            'age_51_plus_female' => 'required|integer|min:0',
            'age_51_plus_total' => 'required|integer|min:0',
            'observations' => 'nullable|string',
            'prepared_by_user_id' => 'nullable|exists:users,id',
            'noted_by_user_id' => 'nullable|exists:users,id',
            'report_date' => 'nullable|date',
        ]);

        $report = GenderDevelopmentReport::create($validated);

        return response()->json([
            'message' => 'Gender and Development report saved successfully',
            'report' => $report,
        ], 201);
    }
}
