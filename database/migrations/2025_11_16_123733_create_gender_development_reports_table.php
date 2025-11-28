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
        Schema::create('gender_development_reports', function (Blueprint $table) {
            $table->id();
            // Gender distribution data
            $table->integer('male_count')->default(0);
            $table->integer('female_count')->default(0);
            $table->integer('total_count')->default(0);
            // Age range distribution data
            $table->integer('age_20_30_male')->default(0);
            $table->integer('age_20_30_female')->default(0);
            $table->integer('age_20_30_total')->default(0);
            $table->integer('age_31_40_male')->default(0);
            $table->integer('age_31_40_female')->default(0);
            $table->integer('age_31_40_total')->default(0);
            $table->integer('age_41_50_male')->default(0);
            $table->integer('age_41_50_female')->default(0);
            $table->integer('age_41_50_total')->default(0);
            $table->integer('age_51_plus_male')->default(0);
            $table->integer('age_51_plus_female')->default(0);
            $table->integer('age_51_plus_total')->default(0);
            // Report metadata
            $table->text('observations')->nullable();
            $table->unsignedBigInteger('prepared_by_user_id')->nullable();
            $table->unsignedBigInteger('noted_by_user_id')->nullable();
            $table->date('report_date')->default(now());
            $table->timestamps();

            $table->foreign('prepared_by_user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('noted_by_user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gender_development_reports');
    }
};
