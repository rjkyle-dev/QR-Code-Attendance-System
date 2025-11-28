<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManagerDepartmentAssignment extends Model
{
    protected $table = 'manager_department_assignments';

    protected $fillable = [
        'user_id',
        'department',
        'can_evaluate',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
