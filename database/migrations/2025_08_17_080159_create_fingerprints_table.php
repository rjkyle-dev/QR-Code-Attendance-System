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
        Schema::create('fingerprints', function (Blueprint $table) {
            $table->id();
            $table->binary('fingerprint_template'); // Store raw bytes
            $table->longText('fingerprint_image')->nullable();
            $table->timestamp('fingerprint_captured_at')->nullable();
            $table->string('finger_name')->nullable();
            $table->timestamps();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fingerprints');
    }
};
