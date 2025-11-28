<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Test extends Model
{
     use HasFactory, SoftDeletes;
    
    protected $table = 'tests';
    protected $fillable = [
    'email',
    'employeeid',
    'employee_name',
    'firstname',
    'middlename',
    'lastname',
    'employee_name',
    'department',
    'position',
    'service_tenure',
    'phone',
    'work_status',
    'status',
    'gender',
    'picture'
];

}
