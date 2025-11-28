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
        Schema::table('daily_checking_assignments', function (Blueprint $table) {
            // Add assignment_date to track when an employee was first assigned
            // This is used to enforce the 14-day lock period
            $table->date('assignment_date')->nullable()->after('day_of_save');

            // Add index for faster queries by assignment_date
            $table->index('assignment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_checking_assignments', function (Blueprint $table) {
            $table->dropIndex(['assignment_date']);
            $table->dropColumn('assignment_date');
        });
    }
};
