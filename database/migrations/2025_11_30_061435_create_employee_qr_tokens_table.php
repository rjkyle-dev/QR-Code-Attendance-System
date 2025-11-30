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
        Schema::create('employee_qr_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('token', 255)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->string('scanned_by_device', 255)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->json('metadata')->nullable()->comment('Additional data like location, user agent, etc.');
            $table->timestamps();

            // Indexes for performance
            $table->index('token');
            $table->index(['employee_id', 'expires_at']);
            $table->index('used_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_qr_tokens');
    }
};
