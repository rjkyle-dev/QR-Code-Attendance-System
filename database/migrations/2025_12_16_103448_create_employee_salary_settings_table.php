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
        Schema::create('employee_salary_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->enum('rate_type', ['daily', 'monthly', 'hourly'])->default('daily');
            $table->decimal('rate', 15, 2)->default(0);
            $table->decimal('cola', 15, 2)->default(0)->comment('Cost of Living Allowance');
            $table->decimal('allowance', 15, 2)->default(0);
            $table->decimal('hazard_pay', 15, 2)->default(0);
            $table->decimal('overtime_rate_multiplier', 5, 2)->default(1.25)->comment('e.g., 1.25 for 125%');
            $table->decimal('night_premium_rate', 5, 2)->default(0.10)->comment('e.g., 0.10 for 10%');
            $table->boolean('is_active')->default(true);
            $table->date('effective_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_salary_settings');
    }
};
