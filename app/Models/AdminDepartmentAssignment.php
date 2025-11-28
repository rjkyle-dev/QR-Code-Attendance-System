<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminDepartmentAssignment extends Model
{
  protected $table = 'admin_department_assignments';

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
