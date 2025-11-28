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
        Schema::create('daily_checking_assignments', function (Blueprint $table) {
            $table->id();
            $table->date('week_start_date'); // Monday of the week
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('position_field'); // e.g., 'boxFormer', 'palletizer', etc.
            $table->integer('slot_index'); // Which slot in the position (0, 1, 2, etc.)
            $table->integer('day_index'); // 0-6 for Monday-Sunday
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->string('prepared_by')->nullable();
            $table->string('checked_by')->nullable();
            $table->timestamps();

            // Ensure unique assignment per week, position, slot, and day
            $table->unique(['employee_id', 'position_field', 'slot_index', 'day_index'], 'unique_daily_assignment');

            // Index for faster queries
            $table->index(['week_start_date', 'position_field']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_checking_assignments');
    }
};
