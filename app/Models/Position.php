<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'department',
        'description',
    ];

    /**
     * Get all positions for a specific department
     */
    public static function getByDepartment(string $department): array
    {
        return static::where('department', $department)
            ->orderBy('name')
            ->pluck('name')
            ->toArray();
    }

    /**
     * Get all positions as array of names
     */
    public static function getAllNames(): array
    {
        return static::orderBy('department')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();
    }
}
