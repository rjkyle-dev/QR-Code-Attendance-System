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
        Schema::create('leave_credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->integer('year');
            $table->integer('total_credits')->default(12); // Company policy: 12 credits per year
            $table->integer('used_credits')->default(0);
            $table->integer('remaining_credits')->default(12);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Ensure one record per employee per year
            $table->unique(['employee_id', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_credits');
    }
};
