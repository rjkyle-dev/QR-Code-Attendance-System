<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResumeToWork extends Model
{
    use HasFactory;

    protected $table = 'resume_to_work';

    protected $fillable = [
        'employee_id',
        'return_date',
        'previous_absence_reference',
        'comments',
        'processed_by',
        'processed_at',
        'status', // pending, processed
        'supervisor_notified',
        'supervisor_notified_at',
    ];

    protected $casts = [
        'return_date' => 'date',
        'processed_at' => 'datetime',
        'supervisor_notified_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Mark as processed by HR Admin
     */
    public function markAsProcessed($processedBy)
    {
        $this->update([
            'processed_by' => $processedBy,
            'processed_at' => now(),
            'status' => 'processed',
        ]);
    }

    /**
     * Mark supervisor as notified
     */
    public function markSupervisorNotified()
    {
        $this->update([
            'supervisor_notified' => true,
            'supervisor_notified_at' => now(),
        ]);
    }
} 