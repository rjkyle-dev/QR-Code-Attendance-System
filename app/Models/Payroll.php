<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payroll extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'payroll_date',
        'cutoff_period',
        'period_start',
        'period_end',
        'gross_pay',
        'total_deductions',
        'net_pay',
        'status',
        'approved_by',
        'approved_at',
        'remarks',
    ];

    protected $casts = [
        'payroll_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'gross_pay' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_pay' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function earnings()
    {
        return $this->hasMany(PayrollEarning::class);
    }

    public function deductions()
    {
        return $this->hasMany(PayrollDeduction::class);
    }

    public function details()
    {
        return $this->hasMany(PayrollDetail::class);
    }

    public function attendanceDeductions()
    {
        return $this->hasOne(PayrollAttendanceDeduction::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
