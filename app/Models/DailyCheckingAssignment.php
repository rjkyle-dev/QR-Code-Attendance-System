<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyCheckingAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'week_start_date',
        'employee_id',
        'position_field',
        'slot_index',
        'microteam',
        'is_add_crew',
        'day_index',
        'day_of_save',
        'assignment_date',
        'time_in',
        'time_out',
        'prepared_by',
        'checked_by',
    ];

    protected $casts = [
        'week_start_date' => 'date',
        'day_of_save' => 'date',
        'assignment_date' => 'date',
        'slot_index' => 'integer',
        'day_index' => 'integer',
        'is_add_crew' => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
