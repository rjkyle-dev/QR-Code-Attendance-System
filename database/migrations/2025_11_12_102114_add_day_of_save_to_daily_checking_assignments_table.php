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
            // Add day_of_save column to track the actual date when data was saved
            // This allows direct querying by date instead of calculating week_start_date and day_index
            $table->date('day_of_save')->nullable()->after('day_index');

            // Add index for faster queries by day_of_save
            $table->index('day_of_save');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_checking_assignments', function (Blueprint $table) {
            $table->dropIndex(['day_of_save']);
            $table->dropColumn('day_of_save');
        });
    }
};
