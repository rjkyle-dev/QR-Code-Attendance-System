<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('daily_checking_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('lock_period_7_days')->default(false);
            $table->boolean('lock_period_14_days')->default(false);
            $table->timestamps();
        });

        // Insert default settings (both off - no lock)
        DB::table('daily_checking_settings')->insert([
            'lock_period_7_days' => false,
            'lock_period_14_days' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_checking_settings');
    }
};
