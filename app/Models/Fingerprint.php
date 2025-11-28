<?php
// [DEPRECATED] This model is no longer used. Fingerprint data is now stored directly in the employees table.

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fingerprint extends Model
{
    protected $fillable = [
        'employee_id',
        'fingerprint_template',
        'fingerprint_image',
        'fingerprint_captured_at',
        'finger_name', // now fillable
    ];
    public $timestamps = true;

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
