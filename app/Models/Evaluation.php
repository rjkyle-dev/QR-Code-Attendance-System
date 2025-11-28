<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\EvaluationConfiguration;

class Evaluation extends Model
{
    /** @use HasFactory<\Database\Factories\EvaluationFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'department',
        'evaluation_frequency',
        'evaluator',
        'observations',
        'total_rating',
        'evaluation_year',
        'evaluation_period',
        'rating_date',
    ];

    protected $casts = [
        'rating_date' => 'date',
        'evaluation_year' => 'integer',
        'evaluation_period' => 'integer',
        'total_rating' => 'decimal:1',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    // New relationships
    public function attendance()
    {
        return $this->hasOne(EvaluationAttendance::class);
    }

    public function attitudes()
    {
        return $this->hasOne(EvaluationAttitudes::class);
    }

    public function workAttitude()
    {
        return $this->hasOne(EvaluationWorkAttitude::class);
    }

    public function workFunctions()
    {
        return $this->hasMany(EvaluationWorkFunction::class);
    }

    /**
     * Get the period label (e.g., "Jan-Jun" or "Jul-Dec")
     */
    public function getPeriodLabelAttribute(): string
    {
        if ($this->evaluation_period === 1) {
            return 'Jan-Jun';
        } elseif ($this->evaluation_period === 2) {
            return 'Jul-Dec';
        }
        return 'Unknown';
    }

    /**
     * Check if this evaluation is for the current period
     */
    public function isCurrentPeriod(): bool
    {
        $now = now();
        $currentPeriod = $this->calculatePeriod($now);
        $currentYear = $now->year;

        return $this->evaluation_period === $currentPeriod && $this->evaluation_year === $currentYear;
    }

    /**
     * Calculate the current evaluation period based on month
     */
    public static function calculatePeriod(\Carbon\Carbon $date): int
    {
        $month = $date->month;
        return $month <= 6 ? 1 : 2; // Jan-Jun = 1, Jul-Dec = 2
    }

    /**
     * Check if an employee can be evaluated for the current period
     */
    public static function canEvaluateEmployee(int $employeeId, string $department): bool
    {
        $now = now();
        $currentPeriod = static::calculatePeriod($now);
        $currentYear = $now->year;

        $frequency = EvaluationConfiguration::getFrequencyForDepartment($department);

        if ($frequency === 'annual') {
            // For annual, only check year
            return !static::where('employee_id', $employeeId)
                ->where('evaluation_year', $currentYear)
                ->exists();
        } else {
            // For semi-annual, check both period and year
            return !static::where('employee_id', $employeeId)
                ->where('evaluation_period', $currentPeriod)
                ->where('evaluation_year', $currentYear)
                ->exists();
        }
    }

    /**
     * Check if an employee can be evaluated for the current period (with detailed info)
     */
    public static function getEvaluationStatus(int $employeeId, string $department): array
    {
        $now = now();
        $currentPeriod = static::calculatePeriod($now);
        $currentYear = $now->year;

        $frequency = EvaluationConfiguration::getFrequencyForDepartment($department);

        if ($frequency === 'annual') {
            // Check annual evaluation
            $existingEvaluation = static::where('employee_id', $employeeId)
                ->where('evaluation_year', $currentYear)
                ->first();

            if ($existingEvaluation) {
                return [
                    'can_evaluate' => false,
                    'frequency' => 'annual',
                    'current_period' => null,
                    'current_year' => $currentYear,
                    'last_evaluation_date' => $existingEvaluation->rating_date,
                    'last_evaluation_period' => null,
                    'message' => "Already evaluated for {$currentYear}. Annual departments can only be evaluated once per year.",
                    'next_evaluation_date' => "January 1, " . ($currentYear + 1)
                ];
            }

            return [
                'can_evaluate' => true,
                'frequency' => 'annual',
                'current_period' => null,
                'current_year' => $currentYear,
                'last_evaluation_date' => null,
                'last_evaluation_period' => null,
                'message' => "Can be evaluated for {$currentYear}",
                'next_evaluation_date' => null
            ];
        } else {
            // Check semi-annual evaluation
            $existingEvaluation = static::where('employee_id', $employeeId)
                ->where('evaluation_period', $currentPeriod)
                ->where('evaluation_year', $currentYear)
                ->first();

            $periodLabel = $currentPeriod === 1 ? 'January to June' : 'July to December';

            if ($existingEvaluation) {
                $nextPeriod = $currentPeriod === 1 ? 2 : 1;
                $nextPeriodLabel = $nextPeriod === 1 ? 'January to June' : 'July to December';
                $nextYear = $nextPeriod === 1 ? $currentYear + 1 : $currentYear;
                $nextDate = $nextPeriod === 1 ? "January 1, {$nextYear}" : "July 1, {$nextYear}";

                return [
                    'can_evaluate' => false,
                    'frequency' => 'semi_annual',
                    'current_period' => $currentPeriod,
                    'current_year' => $currentYear,
                    'last_evaluation_date' => $existingEvaluation->rating_date,
                    'last_evaluation_period' => $periodLabel,
                    'message' => "Already evaluated for {$periodLabel} {$currentYear}. Semi-annual departments can only be evaluated once per period.",
                    'next_evaluation_date' => $nextDate
                ];
            }

            return [
                'can_evaluate' => true,
                'frequency' => 'semi_annual',
                'current_period' => $currentPeriod,
                'current_year' => $currentYear,
                'last_evaluation_date' => null,
                'last_evaluation_period' => null,
                'message' => "Can be evaluated for {$periodLabel} {$currentYear}",
                'next_evaluation_date' => null
            ];
        }
    }

    /**
     * Get the overall rating
     */
    public function getOverallRatingAttribute()
    {
        return $this->total_rating ?? null;
    }

    /**
     * Get the evaluation year
     */
    public function getEvaluationYearAttribute()
    {
        return $this->evaluation_year ?? now()->year;
    }

    /**
     * Get the evaluation period
     */
    public function getEvaluationPeriodAttribute()
    {
        return $this->evaluation_period ?? 1;
    }
}
