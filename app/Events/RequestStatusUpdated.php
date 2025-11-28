<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RequestStatusUpdated implements ShouldBroadcastNow
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public function __construct(
    public string $requestType, // 'leave' or 'absence'
    public string $status, // Approved/Rejected/etc
    public int $employeeId,
    public int|string $requestId,
    public array $extra = []
  ) {}

  public function broadcastOn(): array
  {
    return [new Channel('employee.' . $this->employeeId)];
  }

  public function broadcastAs(): string
  {
    return 'RequestStatusUpdated';
  }

  public function broadcastWith(): array
  {
    return [
      'type' => $this->requestType . '_status',
      'status' => $this->status,
      'employee_id' => $this->employeeId,
      'request_id' => $this->requestId,
      'meta' => $this->extra,
    ];
  }
}
