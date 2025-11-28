<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Notification extends Model
{
  use HasFactory;
  use HasUuids;

  /**
   * The primary key is a UUID string, not auto-incrementing.
   */
  public $incrementing = false;
  protected $keyType = 'string';

  protected $fillable = [
    'type',
    'data',
    'read_at',
    'user_id',
  ];

  protected $casts = [
    'data' => 'array',
    'read_at' => 'datetime',
  ];
}
