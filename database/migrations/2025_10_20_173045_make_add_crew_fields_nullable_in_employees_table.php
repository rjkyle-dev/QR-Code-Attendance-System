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
        Schema::table('employees', function (Blueprint $table) {
            $table->string('department', 100)->nullable()->change();
            $table->string('position', 100)->nullable()->change();
            $table->date('service_tenure')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('department', 100)->nullable(false)->change();
            $table->string('position', 100)->nullable(false)->change();
            $table->date('service_tenure')->nullable(false)->change();
        });
    }
};
