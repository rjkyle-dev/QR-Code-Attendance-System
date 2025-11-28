<?php

namespace App\Events;

use App\Models\Leave;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class LeaveRequested implements ShouldBroadcastNow
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public array $payload;

  public function __construct(public Leave $leave)
  {
    // Pull current leave credits so supervisors see correct numbers immediately
    $leaveCredits = \App\Models\LeaveCredit::getOrCreateForEmployee($leave->employee_id);

    $this->payload = [
      'type' => 'leave_request',
      'leave_id' => $leave->id,
      'employee_id' => $leave->employee_id,
      'employee_name' => $leave->employee ? $leave->employee->employee_name : 'Unknown Employee',
      'leave_type' => $leave->leave_type,
      'leave_start_date' => $leave->leave_start_date,
      'leave_end_date' => $leave->leave_end_date,
      'department' => $leave->employee ? $leave->employee->department : null,
      // include credits so frontend renders correct values without refresh
      'remaining_credits' => $leaveCredits->remaining_credits,
      'used_credits' => $leaveCredits->used_credits,
      'total_credits' => $leaveCredits->total_credits,
    ];
  }

  public function broadcastOn(): array
  {
    $supervisor = \App\Models\User::getSupervisorForDepartment($this->leave->employee->department);

    Log::info('LeaveRequested event broadcasting', [
      'leave_id' => $this->leave->id,
      'department' => $this->leave->employee->department,
      'supervisor_found' => $supervisor ? $supervisor->id : 'none',
      'channels' => $supervisor ? ['supervisor.' . $supervisor->id, 'notifications'] : ['notifications']
    ]);

    // Always broadcast to notifications channel for general access
    $channels = [new Channel('notifications')];

    // Also broadcast to supervisor's private channel if supervisor exists
    if ($supervisor) {
      $channels[] = new PrivateChannel('supervisor.' . $supervisor->id);
    }

    return $channels;
  }

  public function broadcastAs(): string
  {
    return 'LeaveRequested';
  }

  public function broadcastWith(): array
  {
    // Log payload being broadcast (channels are logged in broadcastOn())
    Log::info('LeaveRequested event payload being broadcast:', [
      'payload_keys' => array_keys($this->payload),
      'leave_id' => $this->payload['leave_id'] ?? null,
    ]);
    return $this->payload;
  }
}
