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
        Schema::create('daily_checking_pdfs', function (Blueprint $table) {
            $table->id();
            $table->date('week_start_date'); // Monday of the week
            $table->date('day_of_save'); // The actual date when saving
            $table->string('microteam')->nullable(); // MICROTEAM - 01, 02, or 03
            $table->string('file_name');
            $table->string('mime_type')->default('application/pdf');
            $table->string('disk')->default('public');
            $table->string('path'); // relative path on disk
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('prepared_by')->nullable();
            $table->string('checked_by')->nullable();
            $table->timestamps();

            // Index for faster queries
            $table->index(['week_start_date', 'day_of_save', 'microteam']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_checking_pdfs');
    }
};
