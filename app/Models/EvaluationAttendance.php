<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationAttendance extends Model
{
  use HasFactory;

  protected $table = 'evaluation_attendance';

  protected $fillable = [
    'evaluation_id',
    'days_late',
    'days_absent',
    'rating',
    'remarks',
  ];

  protected $casts = [
    'days_late' => 'integer',
    'days_absent' => 'integer',
    'rating' => 'decimal:1',
  ];

  public function evaluation()
  {
    return $this->belongsTo(Evaluation::class);
  }
}
