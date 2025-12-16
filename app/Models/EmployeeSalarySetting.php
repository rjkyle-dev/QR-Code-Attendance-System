<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeSalarySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'rate_type',
        'rate',
        'cola',
        'allowance',
        'hazard_pay',
        'overtime_rate_multiplier',
        'night_premium_rate',
        'is_active',
        'effective_date',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'cola' => 'decimal:2',
        'allowance' => 'decimal:2',
        'hazard_pay' => 'decimal:2',
        'overtime_rate_multiplier' => 'decimal:2',
        'night_premium_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'effective_date' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
