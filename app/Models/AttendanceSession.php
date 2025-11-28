<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceSession extends Model
{
    /** @use HasFactory<\Database\Factories\AttendanceSessionFactory> */
    use HasFactory;

    protected $fillable = [
        'session_name',
        'time_in_start',
        'time_in_end',
        'time_out_start',
        'time_out_end',
        'late_time',
        'double_scan_window',
    ];
}
