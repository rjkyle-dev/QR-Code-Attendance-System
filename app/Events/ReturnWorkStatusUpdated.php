<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReturnWorkStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $payload;

    public function __construct(array $data)
    {
        $this->payload = [
            'type' => 'return_work_status',
            'request_id' => $data['request_id'],
            'status' => $data['status'],
            'employee_id' => $data['employee_id'],
            'employee_name' => $data['employee_name'],
            'department' => $data['department'],
            'return_date' => $data['return_date'],
            'absence_type' => $data['absence_type'],
            'reason' => $data['reason'],
            'approved_by' => $data['approved_by'] ?? null,
            'approved_at' => $data['approved_at'] ?? null,
            'approval_comments' => $data['approval_comments'] ?? null,
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('employee.' . $this->payload['employee_id']),
            new Channel('notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'RequestStatusUpdated';
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
