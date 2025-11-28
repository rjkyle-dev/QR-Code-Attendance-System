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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('ratings');
            $table->date('rating_date');
            $table->unsignedTinyInteger('period')->nullable(); // 1 = Jan-Jun, 2 = Jul-Dec
            $table->unsignedSmallInteger('year')->nullable();
            $table->string('work_quality');
            $table->string('safety_compliance');
            $table->string('punctuality');
            $table->string('teamwork');
            $table->string('organization');
            $table->string('equipment_handling');
            $table->string('comment');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
