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
    // Drop old evaluations table and related data
    Schema::dropIfExists('evaluations');

    // Create new evaluations table
    Schema::create('evaluations', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('employee_id');
      $table->string('department');
      $table->string('evaluation_frequency')->default('annual');
      $table->string('evaluator');
      $table->text('observations')->nullable();
      $table->decimal('total_rating', 3, 1)->default(0);
      $table->integer('evaluation_year');
      $table->integer('evaluation_period')->default(1); // 1 for Jan-Jun, 2 for Jul-Dec
      $table->date('rating_date');
      $table->softDeletes();
      $table->timestamps();

      $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
      $table->index(['department', 'evaluation_year', 'evaluation_period']);
      $table->index(['employee_id', 'evaluation_year', 'evaluation_period']);
    });

    // Create evaluation_attendance table
    Schema::create('evaluation_attendance', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('evaluation_id');
      $table->integer('days_late')->default(0);
      $table->integer('days_absent')->default(0);
      $table->decimal('rating', 3, 1)->default(10);
      $table->text('remarks')->nullable();
      $table->timestamps();

      $table->foreign('evaluation_id')->references('id')->on('evaluations')->onDelete('cascade');
    });

    // Create evaluation_attitudes table
    Schema::create('evaluation_attitudes', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('evaluation_id');
      $table->decimal('supervisor_rating', 3, 1)->default(0);
      $table->text('supervisor_remarks')->nullable();
      $table->decimal('coworker_rating', 3, 1)->default(0);
      $table->text('coworker_remarks')->nullable();
      $table->timestamps();

      $table->foreign('evaluation_id')->references('id')->on('evaluations')->onDelete('cascade');
    });

    // Create evaluation_work_attitudes table
    Schema::create('evaluation_work_attitudes', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('evaluation_id');
      $table->decimal('responsible', 3, 1)->default(0);
      $table->decimal('job_knowledge', 3, 1)->default(0);
      $table->decimal('cooperation', 3, 1)->default(0);
      $table->decimal('initiative', 3, 1)->default(0);
      $table->decimal('dependability', 3, 1)->default(0);
      $table->text('remarks')->nullable();
      $table->timestamps();

      $table->foreign('evaluation_id')->references('id')->on('evaluations')->onDelete('cascade');
    });

    // Create evaluation_work_functions table
    Schema::create('evaluation_work_functions', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('evaluation_id');
      $table->string('function_name');
      $table->decimal('work_quality', 3, 1)->default(0);
      $table->decimal('work_efficiency', 3, 1)->default(0);
      $table->timestamps();

      $table->foreign('evaluation_id')->references('id')->on('evaluations')->onDelete('cascade');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('evaluation_work_functions');
    Schema::dropIfExists('evaluation_work_attitudes');
    Schema::dropIfExists('evaluation_attitudes');
    Schema::dropIfExists('evaluation_attendance');
    Schema::dropIfExists('evaluations');
  }
};
