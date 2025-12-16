<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollAttendanceDeduction extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_id',
        'absent_days',
        'late_hours',
        'undertime_hours',
        'absent_deduction',
        'late_deduction',
        'undertime_deduction',
    ];

    protected $casts = [
        'absent_days' => 'decimal:2',
        'late_hours' => 'decimal:2',
        'undertime_hours' => 'decimal:2',
        'absent_deduction' => 'decimal:2',
        'late_deduction' => 'decimal:2',
        'undertime_deduction' => 'decimal:2',
    ];

    public function payroll()
    {
        return $this->belongsTo(Payroll::class);
    }
}
