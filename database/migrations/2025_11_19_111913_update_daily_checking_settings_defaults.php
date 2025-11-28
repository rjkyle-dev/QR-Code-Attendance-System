<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    // Update existing records to ensure defaults are set
    // If no settings exist, create default entry
    $existingSettings = DB::table('daily_checking_settings')->first();

    if (!$existingSettings) {
      DB::table('daily_checking_settings')->insert([
        'lock_period_7_days' => false,
        'lock_period_14_days' => false,
        'created_at' => now(),
        'updated_at' => now(),
      ]);
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    // No need to reverse this migration
    // The defaults are already set in the create migration
  }
};
