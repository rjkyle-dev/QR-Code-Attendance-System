<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyCheckingPdf extends Model
{
    use HasFactory;

    protected $fillable = [
        'week_start_date',
        'day_of_save',
        'microteam',
        'file_name',
        'mime_type',
        'disk',
        'path',
        'size_bytes',
        'prepared_by',
        'checked_by',
    ];

    protected $casts = [
        'week_start_date' => 'date',
        'day_of_save' => 'date',
    ];
}
