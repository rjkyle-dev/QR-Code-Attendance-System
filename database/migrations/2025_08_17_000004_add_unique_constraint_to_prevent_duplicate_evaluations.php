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
    Schema::table('evaluations', function (Blueprint $table) {
      // Add unique constraint to prevent duplicate evaluations
      // for the same employee in the same period/year
      $table->unique(['employee_id', 'evaluation_year', 'evaluation_period'], 'unique_employee_evaluation_period');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('evaluations', function (Blueprint $table) {
      $table->dropUnique('unique_employee_evaluation_period');
    });
  }
};
