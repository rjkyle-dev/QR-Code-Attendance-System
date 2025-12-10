<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'firstname',
        'middlename',
        'lastname',
        'email',
        'password',
        'department',
        'profile_image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's full name.
     */
    public function getFullnameAttribute(): string
    {
        $name = trim($this->firstname . ' ' . $this->lastname);
        return $name;
    }

    /**
     * Get the departments this user supervises
     */
    public function supervisedDepartments()
    {
        return $this->hasMany(SupervisorDepartment::class);
    }

    /**
     * Check if user is a supervisor
     */
    public function isSupervisor()
    {
        return $this->hasRole('Supervisor');
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin()
    {
        return $this->hasRole('Super Admin');
    }

    /**
     * Get supervisor for a specific department
     */
    public static function getSupervisorForDepartment($department)
    {
        return self::whereHas('supervisedDepartments', function ($query) use ($department) {
            $query->where('department', $department)
                ->where('can_evaluate', true);
        })->first();
    }

    /**
     * Check if user has HR role (HR, HR Manager, HR Personnel)
     */
    public function isHR()
    {
        return $this->hasRole(['HR', 'HR Manager', 'HR Personnel']);
    }

    /**
     * Get HR assignments for this user
     */
    public function hrAssignments()
    {
        return $this->hasMany(HRDepartmentAssignment::class);
    }

    /**
     * Get all departments this user handles as HR
     */
    public function getHRDepartments()
    {
        return $this->hrAssignments()
            ->pluck('department')
            ->toArray();
    }

    /**
     * Get HR personnel for a specific department
     */
    public static function getHRForDepartment($department)
    {
        return self::whereHas('hrAssignments', function ($query) use ($department) {
            $query->where('department', $department);
        })->whereHas('roles', function ($query) {
            $query->whereIn('name', ['HR', 'HR Manager', 'HR Personnel']);
        })->first();
    }

    /**
     * Get all HR personnel for a specific department (multiple HR can handle one department)
     */
    public static function getAllHRForDepartment($department)
    {
        return self::whereHas('hrAssignments', function ($query) use ($department) {
            $query->where('department', $department);
        })->whereHas('roles', function ($query) {
            $query->whereIn('name', ['HR', 'HR Manager', 'HR Personnel']);
        })->get();
    }

    /**
     * Check if user has Manager role
     */
    public function isManager()
    {
        return $this->hasRole(['Manager', 'Department Manager']);
    }

    /**
     * Get Manager assignments for this user
     */
    public function managerAssignments()
    {
        return $this->hasMany(ManagerDepartmentAssignment::class);
    }

    /**
     * Get all departments this user handles as Manager
     */
    public function getManagerDepartments()
    {
        return $this->managerAssignments()
            ->pluck('department')
            ->toArray();
    }

    /**
     * Get Admin assignments for this user
     */
    public function adminAssignments()
    {
        return $this->hasMany(AdminDepartmentAssignment::class);
    }

    /**
     * Get all departments this user handles as Admin
     */
    public function getAdminDepartments()
    {
        return $this->adminAssignments()
            ->pluck('department')
            ->toArray();
    }
}
