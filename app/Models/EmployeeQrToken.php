<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class EmployeeQrToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'token',
        'expires_at',
        'used_at',
        'scanned_by_device',
        'ip_address',
        'metadata',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Relationship with Employee
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Check if token is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if token has been used
     */
    public function isUsed(): bool
    {
        return !is_null($this->used_at);
    }

    /**
     * Check if token is valid (not expired and not used)
     */
    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isUsed();
    }

    /**
     * Mark token as used
     */
    public function markAsUsed(?string $device = null, ?string $ipAddress = null): void
    {
        $this->update([
            'used_at' => now(),
            'scanned_by_device' => $device,
            'ip_address' => $ipAddress,
        ]);
    }

    /**
     * Scope to get valid tokens
     */
    public function scopeValid($query)
    {
        return $query->where('expires_at', '>', now())
            ->whereNull('used_at');
    }

    /**
     * Scope to get expired tokens
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    /**
     * Scope to get unused tokens
     */
    public function scopeUnused($query)
    {
        return $query->whereNull('used_at');
    }
}
