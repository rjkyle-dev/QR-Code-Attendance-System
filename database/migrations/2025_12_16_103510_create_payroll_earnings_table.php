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
        Schema::create('payroll_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained('payrolls')->onDelete('cascade');
            $table->string('type')->comment('rate, basic, cola, adjustments, overtime, night_premium, honorarium, allowance, hazard_pay, sh_prem, lh_prem, drd_prem, 13th_month');
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('quantity', 10, 2)->nullable()->comment('For hours, days, etc.');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_earnings');
    }
};
