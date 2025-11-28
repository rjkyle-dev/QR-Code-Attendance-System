<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationWorkAttitude extends Model
{
  use HasFactory;

  protected $table = 'evaluation_work_attitudes';

  protected $fillable = [
    'evaluation_id',
    'responsible',
    'job_knowledge',
    'cooperation',
    'initiative',
    'dependability',
    'remarks',
  ];

  protected $casts = [
    'responsible' => 'decimal:1',
    'job_knowledge' => 'decimal:1',
    'cooperation' => 'decimal:1',
    'initiative' => 'decimal:1',
    'dependability' => 'decimal:1',
  ];

  public function evaluation()
  {
    return $this->belongsTo(Evaluation::class);
  }
}
