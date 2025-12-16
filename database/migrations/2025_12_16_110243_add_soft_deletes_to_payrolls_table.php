<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Note: This migration is redundant as softDeletes() is already included
     * in the create_payrolls_table migration. This migration checks if the
     * column exists before adding it to prevent errors on fresh migrations.
     */
    public function up(): void
    {
        // Check if deleted_at column already exists
        if (!Schema::hasColumn('payrolls', 'deleted_at')) {
            Schema::table('payrolls', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only drop if column exists
        if (Schema::hasColumn('payrolls', 'deleted_at')) {
            Schema::table('payrolls', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
