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
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_name'); // morning, afternoon, night
            $table->time('time_in_start'); // Start time for time-in period
            $table->time('time_in_end');   // End time for time-in period
            $table->time('time_out_start')->nullable(); // Start time for time-out period (optional)
            $table->time('time_out_end')->nullable();   // End time for time-out period (optional)
            $table->time('late_time')->nullable(); // Late time (optional)
            $table->integer('double_scan_window')->default(10); // Double scan window in minutes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_sessions');
    }
};
