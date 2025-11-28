<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceTenure extends Model
{
    /** @use HasFactory<\Databa se\Factories\ServiceTenureFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'years_claim',
        'remaining_years',
        'total_years',
        'status',
        'remarks',
        'date_of_payout',
        'date_of_approval',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
