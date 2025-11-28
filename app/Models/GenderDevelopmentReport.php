<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GenderDevelopmentReport extends Model
{
    protected $table = 'gender_development_reports';

    protected $fillable = [
        'male_count',
        'female_count',
        'total_count',
        'age_20_30_male',
        'age_20_30_female',
        'age_20_30_total',
        'age_31_40_male',
        'age_31_40_female',
        'age_31_40_total',
        'age_41_50_male',
        'age_41_50_female',
        'age_41_50_total',
        'age_51_plus_male',
        'age_51_plus_female',
        'age_51_plus_total',
        'observations',
        'prepared_by_user_id',
        'noted_by_user_id',
        'report_date',
    ];

    protected $casts = [
        'report_date' => 'date',
    ];

    public function preparedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prepared_by_user_id');
    }

    public function notedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'noted_by_user_id');
    }
}
