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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->time('time_in');
            $table->time('time_out')->nullable();
            $table->time('break_time')->nullable();
            $table->string('attendance_status')->default('Pending');
            $table->string('actual_attendance_status')->nullable(); // Detailed status for C# display
            $table->date('attendance_date');
            $table->string('session')->nullable()->comment('e.g., morning, afternoon, evening');
            $table->softDeletes();
            $table->timestamps();
            $table->unique(['employee_id', 'attendance_date'], 'unique_employee_attendance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
