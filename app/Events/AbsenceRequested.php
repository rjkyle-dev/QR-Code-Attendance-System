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

class AbsenceRequested implements ShouldBroadcastNow
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public array $payload;

  public function __construct(public Absence $absence)
  {
    // Ensure relationships are loaded
    $absence->load(['employee', 'supervisorApprover', 'hrApprover']);

    $this->payload = [
      'type' => 'absence_request',
      // Flat structure for frontend compatibility
      'id' => $absence->id,
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
      // Keep nested structure for backward compatibility
      'absence' => [
        'id' => $absence->id,
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
        'hr_status' => $absence->hr_status,
        'employee_name' => $absence->employee ? $absence->employee->employee_name : $absence->full_name,
        'picture' => $absence->employee ? $absence->employee->picture : null,
      ]
    ];
  }

  public function broadcastOn(): array
  {
    $supervisor = \App\Models\User::getSupervisorForDepartment($this->absence->department);

    Log::info('AbsenceRequested event broadcasting', [
      'absence_id' => $this->absence->id,
      'department' => $this->absence->department,
      'supervisor_found' => $supervisor ? $supervisor->id : 'none',
      'channels' => $supervisor ? ['supervisor.' . $supervisor->id, 'notifications'] : ['notifications']
    ]);

    // Always broadcast to notifications channel for general access
    $channels = [new Channel('notifications')];

    // Also broadcast to supervisor's private channel if supervisor exists
    if ($supervisor) {
      // Use just the identifier - Laravel will handle the 'supervisor.' prefix from channels.php
      $channels[] = new PrivateChannel('supervisor.' . $supervisor->id);
    }

    return $channels;
  }

  public function broadcastAs(): string
  {
    return 'AbsenceRequested';
  }

  public function broadcastWith(): array
  {
    // Log payload being broadcast (channels are logged in broadcastOn())
    Log::info('AbsenceRequested event payload being broadcast:', [
      'payload_keys' => array_keys($this->payload),
      'absence_id' => $this->payload['absence_id'] ?? null,
    ]);
    return $this->payload;
  }
}
