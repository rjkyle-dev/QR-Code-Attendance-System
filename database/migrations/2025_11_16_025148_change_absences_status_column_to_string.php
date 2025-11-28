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
        Schema::table('absences', function (Blueprint $table) {
            // Change status from ENUM to string to support workflow statuses
            // We need to drop and recreate because MySQL doesn't support direct ENUM to string conversion
            $table->dropColumn('status');
        });

        Schema::table('absences', function (Blueprint $table) {
            $table->string('status')->default('pending')->after('reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('absences', function (Blueprint $table) {
            // Revert back to ENUM
            $table->dropColumn('status');
        });

        Schema::table('absences', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('reason');
        });
    }
};
