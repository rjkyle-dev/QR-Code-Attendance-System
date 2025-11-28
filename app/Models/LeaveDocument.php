<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveDocument extends Model
{
  protected $fillable = [
    'leave_id',
    'file_name',
    'mime_type',
    'disk',
    'path',
    'size_bytes',
  ];

  public function leave(): BelongsTo
  {
    return $this->belongsTo(Leave::class);
  }
}
