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
            // HDMF fields
            $table->string('hdmf_user_id', 100)->nullable();
            $table->string('hdmf_username', 100)->nullable();
            $table->string('hdmf_password', 100)->nullable();
            
            // SSS fields
            $table->string('sss_user_id', 100)->nullable();
            $table->string('sss_username', 100)->nullable();
            $table->string('sss_password', 100)->nullable();
            
            // Philhealth fields
            $table->string('philhealth_user_id', 100)->nullable();
            $table->string('philhealth_username', 100)->nullable();
            $table->string('philhealth_password', 100)->nullable();
            
            // TIN fields
            $table->string('tin_user_id', 100)->nullable();
            $table->string('tin_username', 100)->nullable();
            $table->string('tin_password', 100)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Drop HDMF fields
            $table->dropColumn(['hdmf_user_id', 'hdmf_username', 'hdmf_password']);
            
            // Drop SSS fields
            $table->dropColumn(['sss_user_id', 'sss_username', 'sss_password']);
            
            // Drop Philhealth fields
            $table->dropColumn(['philhealth_user_id', 'philhealth_username', 'philhealth_password']);
            
            // Drop TIN fields
            $table->dropColumn(['tin_user_id', 'tin_username', 'tin_password']);
        });
    }
};
