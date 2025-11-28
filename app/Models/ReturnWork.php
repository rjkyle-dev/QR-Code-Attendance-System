<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnWork extends Model
{
    use HasFactory;

    protected $table = 'return_work';

    protected $fillable = [
        'employee_id',
        'full_name',
        'employee_id_number',
        'department',
        'position',
        'return_date',
        'absence_type',
        'reason',
        'medical_clearance',
        'return_date_reported',
        'status',
        'submitted_at',
        'approved_at',
        'approved_by',
        'approval_comments',
    ];

    protected $casts = [
        'return_date' => 'date',
        'return_date_reported' => 'date',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
