<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupervisorDepartment extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'department',
    'can_evaluate',
  ];

  protected $casts = [
    'can_evaluate' => 'boolean',
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }
}
