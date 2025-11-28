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
        Schema::table('manager_department_assignments', function (Blueprint $table) {
            $table->boolean('can_evaluate')->default(true)->after('department');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('manager_department_assignments', function (Blueprint $table) {
            $table->dropColumn('can_evaluate');
        });
    }
};
