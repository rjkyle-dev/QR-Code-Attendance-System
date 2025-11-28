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
            // Drop old government ID fields
            $table->dropColumn(['sss', 'pag_ibig', 'philhealth', 'tin', 'nationality']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Re-add old government ID fields
            $table->integer('sss')->nullable();
            $table->integer('pag_ibig')->nullable();
            $table->integer('philhealth')->nullable();
            $table->integer('tin')->nullable();
            $table->string('nationality', 100)->nullable();
        });
    }
};
