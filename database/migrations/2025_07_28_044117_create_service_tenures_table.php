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
        Schema::create('service_tenures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees');
            $table->integer('years_claim')->nullable();
            $table->integer('remaining_years')->nullable();
            $table->integer('total_years')->nullable();
            $table->string('status')->nullable();
            $table->string('remarks')->nullable();
            $table->string('date_of_payout')->nullable();
            $table->string('date_of_approval')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_tenures');
    }
};
