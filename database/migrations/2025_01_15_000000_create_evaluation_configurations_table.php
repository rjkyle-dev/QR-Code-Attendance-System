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
    Schema::create('evaluation_configurations', function (Blueprint $table) {
      $table->id();
      $table->string('department');
      $table->enum('evaluation_frequency', ['semi_annual', 'annual']);
      $table->timestamps();

      $table->unique('department');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('evaluation_configurations');
  }
};
