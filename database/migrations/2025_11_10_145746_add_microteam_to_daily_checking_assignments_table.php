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
            $table->string('microteam')->nullable()->after('slot_index'); // 'MICROTEAM - 01', 'MICROTEAM - 02', 'MICROTEAM - 03', or null for Add Crew
            $table->boolean('is_add_crew')->default(false)->after('microteam');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_checking_assignments', function (Blueprint $table) {
            $table->dropColumn(['microteam', 'is_add_crew']);
        });
    }
};
