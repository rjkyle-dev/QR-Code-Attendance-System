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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->comment('Setting key identifier');
            $table->string('name')->comment('Human-readable setting name');
            $table->text('description')->nullable()->comment('Setting description');
            $table->string('type')->default('string')->comment('Setting type: string, integer, boolean');
            $table->text('value')->nullable()->comment('Setting value (stored as text, cast based on type)');
            $table->text('default_value')->nullable()->comment('Default value');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
