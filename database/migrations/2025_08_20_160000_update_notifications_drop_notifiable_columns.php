<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('notifications')) {
            return;
        }

        $hasType = Schema::hasColumn('notifications', 'notifiable_type');
        $hasId = Schema::hasColumn('notifications', 'notifiable_id');

        if ($hasType || $hasId) {
            Schema::table('notifications', function (Blueprint $table) use ($hasType, $hasId) {
                if ($hasType) {
                    $table->dropColumn('notifiable_type');
                }
                if ($hasId) {
                    $table->dropColumn('notifiable_id');
                }
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('notifications')) {
            return;
        }

        $missingType = !Schema::hasColumn('notifications', 'notifiable_type');
        $missingId = !Schema::hasColumn('notifications', 'notifiable_id');

        if ($missingType || $missingId) {
            Schema::table('notifications', function (Blueprint $table) use ($missingType, $missingId) {
                if ($missingType) {
                    $table->string('notifiable_type')->nullable();
                }
                if ($missingId) {
                    $table->unsignedBigInteger('notifiable_id')->nullable();
                }
                if ($missingType && $missingId) {
                    $table->index(['notifiable_type', 'notifiable_id'], 'notifications_notifiable_type_notifiable_id_index');
                }
            });
        }
    }
}; 