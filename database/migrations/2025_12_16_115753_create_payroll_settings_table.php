<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Note: Default settings are seeded via PayrollSettingsSeeder.
     * Default values are defined in: resources/js/hooks/payroll-settings-defaults.ts
     */
    public function up(): void
    {
        Schema::create('payroll_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->comment('Setting key identifier');
            $table->string('name')->comment('Human-readable setting name');
            $table->text('description')->nullable()->comment('Setting description');
            $table->string('type')->default('decimal')->comment('Setting type: decimal, integer, string, time, boolean');
            $table->text('value')->nullable()->comment('Setting value (stored as text, cast based on type)');
            $table->text('default_value')->nullable()->comment('Default value');
            $table->string('category')->default('general')->comment('Category: government_deductions, work_schedule, calculations');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_settings');
    }
};
