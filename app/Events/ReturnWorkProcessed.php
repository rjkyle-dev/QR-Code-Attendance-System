<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReturnWorkProcessed implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $payload;

    public function __construct(array $data)
    {
        $this->payload = [
            'type' => 'return_work_processed',
            'return_work_id' => $data['return_work_id'],
            'employee_name' => $data['employee_name'],
            'employee_id_number' => $data['employee_id_number'],
            'department' => $data['department'],
            'return_date' => $data['return_date'],
            'processed_by' => $data['processed_by'],
            'processed_at' => $data['processed_at'],
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ReturnWorkProcessed';
    }
}
