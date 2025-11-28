<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationWorkFunction extends Model
{
  use HasFactory;

  protected $table = 'evaluation_work_functions';

  protected $fillable = [
    'evaluation_id',
    'function_name',
    'work_quality',
    'work_efficiency',
  ];

  protected $casts = [
    'work_quality' => 'decimal:1',
    'work_efficiency' => 'decimal:1',
  ];

  public function evaluation()
  {
    return $this->belongsTo(Evaluation::class);
  }
}
