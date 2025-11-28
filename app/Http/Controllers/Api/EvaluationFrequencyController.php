<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EvaluationConfiguration;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EvaluationFrequencyController extends Controller
{
  /**
   * Get all department evaluation frequencies
   */
  public function index()
  {
    try {
      $departments = Employee::distinct()->pluck('department')->filter()->toArray();

      // If no departments found, return empty array
      if (empty($departments)) {
        return response()->json([]);
      }

      $frequencies = [];

      foreach ($departments as $department) {
        $config = EvaluationConfiguration::where('department', $department)->first();
        $employeeCount = Employee::where('department', $department)->count();

        $frequencies[] = [
          'department' => $department,
          'evaluation_frequency' => $config ? $config->evaluation_frequency : 'annual',
          'employee_count' => $employeeCount,
        ];
      }

      return response()->json($frequencies);
    } catch (\Exception $e) {
      Log::error('Failed to fetch evaluation frequencies: ' . $e->getMessage());
      return response()->json(['error' => 'Failed to fetch frequencies'], 500);
    }
  }

  /**
   * Update evaluation frequency for a department
   */
  public function update(Request $request, $department)
  {
    try {
      // User is already authenticated and authorized by middleware
      $user = Auth::user();

      // Check if user has evaluation permissions
      if (!$user->hasPermissionTo('View Evaluation')) {
        return response()->json(['error' => 'Unauthorized. Only users with evaluation permissions can update frequencies.'], 403);
      }

      // Validate request
      $validated = $request->validate([
        'evaluation_frequency' => 'required|in:semi_annual,annual',
      ]);

      // Update or create configuration
      EvaluationConfiguration::updateOrCreate(
        ['department' => $department],
        ['evaluation_frequency' => $validated['evaluation_frequency']]
      );

      Log::info('Evaluation frequency updated', [
        'department' => $department,
        'frequency' => $validated['evaluation_frequency'],
        'updated_by' => $user->id,
      ]);

      return response()->json([
        'message' => 'Frequency updated successfully',
        'department' => $department,
        'evaluation_frequency' => $validated['evaluation_frequency'],
      ]);
    } catch (\Exception $e) {
      Log::error('Failed to update evaluation frequency: ' . $e->getMessage());
      return response()->json(['error' => 'Failed to update frequency'], 500);
    }
  }

  /**
   * Get evaluation frequency for a specific department
   */
  public function show($department)
  {
    try {
      $config = EvaluationConfiguration::where('department', $department)->first();
      $employeeCount = Employee::where('department', $department)->count();

      return response()->json([
        'department' => $department,
        'evaluation_frequency' => $config ? $config->evaluation_frequency : 'annual',
        'employee_count' => $employeeCount,
      ]);
    } catch (\Exception $e) {
      Log::error('Failed to fetch department frequency: ' . $e->getMessage());
      return response()->json(['error' => 'Failed to fetch frequency'], 500);
    }
  }
}
