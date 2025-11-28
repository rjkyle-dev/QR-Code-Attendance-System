<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ReturnWorkRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $payload;

    public function __construct(array $data)
    {
        $this->payload = [
            'type' => 'return_work_request',
            'return_work_id' => $data['return_work_id'],
            'employee_name' => $data['employee_name'],
            'employee_id_number' => $data['employee_id_number'],
            'department' => $data['department'],
            'return_date' => $data['return_date'],
            'absence_type' => $data['absence_type'],
            'reason' => $data['reason'],
            'return_date_reported' => $data['return_date_reported'],
        ];
    }

    public function broadcastOn(): array
    {
        $supervisor = \App\Models\User::getSupervisorForDepartment($this->payload['department']);

        Log::info('ReturnWorkRequested event broadcasting', [
            'department' => $this->payload['department'],
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
        return 'ReturnWorkRequested';
    }

    public function broadcastWith(): array
    {
        // Log payload being broadcast (channels are logged in broadcastOn())
        Log::info('ReturnWorkRequested event payload being broadcast:', [
            'payload_keys' => array_keys($this->payload),
            'return_work_id' => $this->payload['return_work_id'] ?? null,
        ]);
        return $this->payload;
    }
}
