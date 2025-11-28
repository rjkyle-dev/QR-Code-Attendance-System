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
            $table->string('evaluator')->nullable();
            $table->integer('attendance_late')->nullable();
            $table->integer('attendance_absent')->nullable();
            $table->integer('attitude_supervisor_rating')->nullable();
            $table->text('attitude_supervisor_remarks')->nullable();
            $table->integer('attitude_coworker_rating')->nullable();
            $table->text('attitude_coworker_remarks')->nullable();
            $table->text('work_attitude_remarks')->nullable();
            $table->json('work_functions_data')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropColumn([
                'evaluator',
                'attendance_late',
                'attendance_absent',
                'attitude_supervisor_rating',
                'attitude_supervisor_remarks',
                'attitude_coworker_rating',
                'attitude_coworker_remarks',
                'work_attitude_remarks',
                'work_functions_data'
            ]);
        });
    }
};
