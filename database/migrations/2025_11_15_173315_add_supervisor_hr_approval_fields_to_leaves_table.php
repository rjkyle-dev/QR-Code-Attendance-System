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
        Schema::table('leaves', function (Blueprint $table) {
            // Supervisor approval fields
            $table->string('supervisor_status')->nullable()->after('leave_status')->comment('Supervisor approval status: pending, approved, rejected');
            $table->foreignId('supervisor_approved_by')->nullable()->after('supervisor_status')->constrained('users')->onDelete('set null')->comment('User ID of supervisor who approved/rejected');
            $table->timestamp('supervisor_approved_at')->nullable()->after('supervisor_approved_by')->comment('Timestamp when supervisor approved/rejected');
            $table->text('supervisor_comments')->nullable()->after('supervisor_approved_at')->comment('Comments from supervisor');

            // HR approval fields
            $table->string('hr_status')->nullable()->after('supervisor_comments')->comment('HR approval status: pending, approved, rejected');
            $table->foreignId('hr_approved_by')->nullable()->after('hr_status')->constrained('users')->onDelete('set null')->comment('User ID of HR who approved/rejected');
            $table->timestamp('hr_approved_at')->nullable()->after('hr_approved_by')->comment('Timestamp when HR approved/rejected');
            $table->text('hr_comments')->nullable()->after('hr_approved_at')->comment('Comments from HR');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leaves', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['supervisor_approved_by']);
            $table->dropForeign(['hr_approved_by']);

            // Drop columns
            $table->dropColumn([
                'supervisor_status',
                'supervisor_approved_by',
                'supervisor_approved_at',
                'supervisor_comments',
                'hr_status',
                'hr_approved_by',
                'hr_approved_at',
                'hr_comments',
            ]);
        });
    }
};
