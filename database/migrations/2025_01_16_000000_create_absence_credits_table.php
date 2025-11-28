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
    // If the table already exists, skip creation to avoid 1050 errors
    if (Schema::hasTable('absence_credits')) {
      return;
    }

    Schema::create('absence_credits', function (Blueprint $table) {
      $table->id();
      // Create column first; add FK after if employees table exists
      $table->unsignedBigInteger('employee_id');
      $table->integer('year');
      $table->integer('total_credits')->default(12); // Company policy: 12 credits per year
      $table->integer('used_credits')->default(0);
      $table->integer('remaining_credits')->default(12);
      $table->boolean('is_active')->default(true);
      $table->timestamps();

      // Ensure one record per employee per year
      $table->unique(['employee_id', 'year']);
    });

    // Add foreign key only if employees table exists (prevents 1824 errors)
    if (Schema::hasTable('employees')) {
      Schema::table('absence_credits', function (Blueprint $table) {
        $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
      });
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('absence_credits');
  }
};
