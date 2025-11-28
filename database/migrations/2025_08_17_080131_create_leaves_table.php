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
        Schema::create('leaves', function (Blueprint $table) {
            $table->id();            
            $table->string('leave_type');
            $table->date('leave_start_date');
            $table->date('leave_end_date');
            $table->integer('leave_days')->comment('Number of leave days');
            $table->string('leave_status')->default('Pending')->comment('Status of the leave application (approved, rejected, pending)');
            $table->text('leave_reason')->nullable()->comment('Reason for leave application');
            $table->date('leave_date_reported')->comment('Date when the leave application was reported');
            $table->date('leave_date_approved')->nullable()->comment('Date when the leave application was approved');
            $table->text('leave_comments')->nullable()->comment('Comments from the approver');
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaves');
    }
};
