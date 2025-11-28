<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    // Remove duplicate evaluations, keeping only the latest one for each employee-period-year combination
    $duplicates = DB::table('evaluations')
      ->select('employee_id', 'evaluation_year', 'evaluation_period', DB::raw('MAX(id) as latest_id'))
      ->groupBy('employee_id', 'evaluation_year', 'evaluation_period')
      ->havingRaw('COUNT(*) > 1')
      ->get();

    foreach ($duplicates as $duplicate) {
      // Delete all evaluations except the latest one for this combination
      DB::table('evaluations')
        ->where('employee_id', $duplicate->employee_id)
        ->where('evaluation_year', $duplicate->evaluation_year)
        ->where('evaluation_period', $duplicate->evaluation_period)
        ->where('id', '!=', $duplicate->latest_id)
        ->delete();
    }

            // Log the cleanup
        \Illuminate\Support\Facades\Log::info('Duplicate evaluations cleanup completed', [
            'duplicates_found' => $duplicates->count(),
            'details' => $duplicates->toArray()
        ]);
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    // This migration cannot be reversed as it deletes data
    // The data is permanently lost
  }
};
