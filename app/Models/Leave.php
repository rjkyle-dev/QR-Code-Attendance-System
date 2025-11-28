<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use App\Models\Employee;
use Illuminate\Database\Eloquent\SoftDeletes;


class Leave extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'leaves'; // optional if you follow Laravel naming conventions

    protected $fillable = [
        'employee_id',
        'leave_start_date',
        'leave_end_date',
        'leave_type',
        'leave_days',
        'leave_date_reported',
        'leave_date_approved',
        'leave_reason',
        'leave_comments',
        'leave_status',
        // Supervisor approval fields
        'supervisor_status',
        'supervisor_approved_by',
        'supervisor_approved_at',
        'supervisor_comments',
        // HR approval fields
        'hr_status',
        'hr_approved_by',
        'hr_approved_at',
        'hr_comments',
    ];

    protected $casts = [
        'leave_start_date' => 'date',
        'leave_end_date' => 'date',
        'leave_date_reported' => 'date',
        'leave_date_approved' => 'date',
        'supervisor_approved_at' => 'datetime',
        'hr_approved_at' => 'datetime',
    ];


    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * Get the supervisor who approved/rejected this leave
     */
    public function supervisorApprover()
    {
        return $this->belongsTo(User::class, 'supervisor_approved_by');
    }

    /**
     * Get the HR who approved/rejected this leave
     */
    public function hrApprover()
    {
        return $this->belongsTo(User::class, 'hr_approved_by');
    }
}
