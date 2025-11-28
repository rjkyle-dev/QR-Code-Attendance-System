<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationAttitudes extends Model
{
  use HasFactory;

  protected $table = 'evaluation_attitudes';

  protected $fillable = [
    'evaluation_id',
    'supervisor_rating',
    'supervisor_remarks',
    'coworker_rating',
    'coworker_remarks',
  ];

  protected $casts = [
    'supervisor_rating' => 'decimal:1',
    'coworker_rating' => 'decimal:1',
  ];

  public function evaluation()
  {
    return $this->belongsTo(Evaluation::class);
  }
}
