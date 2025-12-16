<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get all departments as array of names
     */
    public static function getAllNames(): array
    {
        return static::orderBy('name')->pluck('name')->toArray();
    }
}

