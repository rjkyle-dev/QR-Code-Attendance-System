<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::table('service_tenures', function (Blueprint $table) {
      // Add missing columns if they don't exist
      if (!Schema::hasColumn('service_tenures', 'remaining_years')) {
        $table->integer('remaining_years')->nullable();
      }
      if (!Schema::hasColumn('service_tenures', 'total_years')) {
        $table->integer('total_years')->nullable();
      }
      if (!Schema::hasColumn('service_tenures', 'date_of_payout')) {
        $table->string('date_of_payout')->nullable();
      }
      if (!Schema::hasColumn('service_tenures', 'date_of_approval')) {
        $table->string('date_of_approval')->nullable();
      }
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('service_tenures', function (Blueprint $table) {
      $table->dropColumn(['remaining_years', 'total_years', 'date_of_payout', 'date_of_approval']);
    });
  }
};
