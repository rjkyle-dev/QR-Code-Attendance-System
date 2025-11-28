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
    Schema::create('resume_to_work', function (Blueprint $table) {
      $table->id();
      $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
      $table->date('return_date');
      $table->string('previous_absence_reference')->nullable();
      $table->text('comments')->nullable();
      $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
      $table->timestamp('processed_at')->nullable();
      $table->enum('status', ['pending', 'processed'])->default('pending');
      $table->boolean('supervisor_notified')->default(false);
      $table->timestamp('supervisor_notified_at')->nullable();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('resume_to_work');
  }
};
