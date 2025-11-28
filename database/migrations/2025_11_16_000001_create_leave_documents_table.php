<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('leave_documents', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('leave_id');
      $table->string('file_name');
      $table->string('mime_type')->default('application/pdf');
      $table->string('disk')->default('public');
      $table->string('path'); // relative path on disk
      $table->unsignedBigInteger('size_bytes')->nullable();
      $table->timestamps();

      $table->foreign('leave_id')->references('id')->on('leaves')->onDelete('cascade');
      $table->index('leave_id');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('leave_documents');
  }
};
