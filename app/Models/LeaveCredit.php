<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveCredit extends Model
{
  use HasFactory;

  protected $fillable = [
    'employee_id',
    'year',
    'total_credits',
    'used_credits',
    'remaining_credits',
    'is_active',
  ];

  protected $casts = [
    'year' => 'integer',
    'total_credits' => 'integer',
    'used_credits' => 'integer',
    'remaining_credits' => 'integer',
    'is_active' => 'boolean',
  ];

  public function employee(): BelongsTo
  {
    return $this->belongsTo(Employee::class);
  }

  /**
   * Get or create leave credits for an employee for a specific year
   */
  public static function getOrCreateForEmployee($employeeId, $year = null)
  {
    $year = $year ?? now()->year;

    return static::firstOrCreate(
      [
        'employee_id' => $employeeId,
        'year' => $year,
      ],
      [
        'total_credits' => 12, // Company policy: 12 credits per year
        'used_credits' => 0,
        'remaining_credits' => 12,
        'is_active' => true,
      ]
    );
  }

  /**
   * Update used credits when a leave is approved
   */
  public function useCredits($credits)
  {
    $this->used_credits += $credits;
    $this->remaining_credits = max(0, $this->total_credits - $this->used_credits);
    $this->save();
  }

  /**
   * Refund credits when a leave is cancelled or rejected
   */
  public function refundCredits($credits)
  {
    $this->used_credits = max(0, $this->used_credits - $credits);
    $this->remaining_credits = $this->total_credits - $this->used_credits;
    $this->save();
  }
}
