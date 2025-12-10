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
            // Drop HDMF password and username columns
            $table->dropColumn(['hdmf_username', 'hdmf_password']);
            
            // Drop SSS password and username columns
            $table->dropColumn(['sss_username', 'sss_password']);
            
            // Drop Philhealth password and username columns
            $table->dropColumn(['philhealth_username', 'philhealth_password']);
            
            // Drop TIN password and username columns
            $table->dropColumn(['tin_username', 'tin_password']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Restore HDMF columns
            $table->string('hdmf_username', 100)->nullable();
            $table->string('hdmf_password', 100)->nullable();
            
            // Restore SSS columns
            $table->string('sss_username', 100)->nullable();
            $table->string('sss_password', 100)->nullable();
            
            // Restore Philhealth columns
            $table->string('philhealth_username', 100)->nullable();
            $table->string('philhealth_password', 100)->nullable();
            
            // Restore TIN columns
            $table->string('tin_username', 100)->nullable();
            $table->string('tin_password', 100)->nullable();
        });
    }
};
