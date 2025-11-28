<?php

namespace App\Events;

use App\Models\Absence;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AbsenceHRApproved implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $payload;

    public function __construct(public Absence $absence)
    {
        $this->payload = [
            'type' => 'absence_hr_approved',
            'absence_id' => $absence->id,
            'employee_id' => $absence->employee_id,
            'full_name' => $absence->full_name,
            'employee_id_number' => $absence->employee_id_number,
            'department' => $absence->department,
            'position' => $absence->position,
            'absence_type' => $absence->absence_type,
            'from_date' => $absence->from_date->format('Y-m-d'),
            'to_date' => $absence->to_date->format('Y-m-d'),
            'submitted_at' => $absence->submitted_at->format('Y-m-d H:i:s'),
            'days' => $absence->days,
            'reason' => $absence->reason,
            'is_partial_day' => $absence->is_partial_day,
            'status' => $absence->status,
            'supervisor_status' => $absence->supervisor_status,
            'supervisor_approved_by' => $absence->supervisor_approved_by,
            'supervisor_approved_at' => $absence->supervisor_approved_at ? $absence->supervisor_approved_at->format('Y-m-d H:i:s') : null,
            'supervisor_comments' => $absence->supervisor_comments,
            'hr_status' => $absence->hr_status,
            'hr_approved_by' => $absence->hr_approved_by,
            'hr_approved_at' => $absence->hr_approved_at ? $absence->hr_approved_at->format('Y-m-d H:i:s') : null,
            'hr_comments' => $absence->hr_comments,
            'employee_name' => $absence->employee ? $absence->employee->employee_name : $absence->full_name,
            'picture' => $absence->employee ? $absence->employee->picture : null,
            'supervisor_approver' => $absence->supervisorApprover ? [
                'id' => $absence->supervisorApprover->id,
                'name' => $absence->supervisorApprover->fullname,
                'email' => $absence->supervisorApprover->email,
            ] : null,
            'hr_approver' => $absence->hrApprover ? [
                'id' => $absence->hrApprover->id,
                'name' => $absence->hrApprover->fullname,
                'email' => $absence->hrApprover->email,
            ] : null,
        ];
    }

    public function broadcastOn(): array
    {
        $channels = [new Channel('notifications')];

        // Broadcast to supervisor who approved
        if ($this->absence->supervisor_approved_by) {
            $channels[] = new PrivateChannel('supervisor.' . $this->absence->supervisor_approved_by);
        }

        // Broadcast to employee
        if ($this->absence->employee_id) {
            $channels[] = new Channel('employee.' . $this->absence->employee_id);
        }

        Log::info('AbsenceHRApproved event broadcasting', [
            'absence_id' => $this->absence->id,
            'supervisor_id' => $this->absence->supervisor_approved_by,
            'employee_id' => $this->absence->employee_id,
            'channels_count' => count($channels),
        ]);

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'AbsenceHRApproved';
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
