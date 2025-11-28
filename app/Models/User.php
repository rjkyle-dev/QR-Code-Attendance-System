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
     * Check if user can evaluate employees in a specific department
     */
    public function canEvaluateDepartment($department)
    {
        // Super Admin can evaluate any department
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Supervisor with can_evaluate permission
        if ($this->supervisedDepartments()
            ->where('department', $department)
            ->where('can_evaluate', true)
            ->exists()
        ) {
            return true;
        }

        // HR Personnel with assignment to this department and can_evaluate = true
        if ($this->hrAssignments()
            ->where('department', $department)
            ->where('can_evaluate', true)
            ->exists()
        ) {
            return true;
        }

        // Manager with assignment to this department and can_evaluate = true
        if ($this->managerAssignments()
            ->where('department', $department)
            ->where('can_evaluate', true)
            ->exists()
        ) {
            return true;
        }

        // Admin with assignment to this department and can_evaluate = true
        if ($this->adminAssignments()
            ->where('department', $department)
            ->where('can_evaluate', true)
            ->exists()
        ) {
            return true;
        }

        return false;
    }

    /**
     * Get all departments this user can evaluate
     */
    public function getEvaluableDepartments()
    {
        $departments = [];

        // Super Admin can evaluate all departments
        if ($this->isSuperAdmin()) {
            return \App\Models\Employee::distinct()->pluck('department')->toArray();
        }

        // HR Personnel can evaluate all departments (no filtering by assignment)
        if ($this->isHR() && $this->hrAssignments()->where('can_evaluate', true)->exists()) {
            return \App\Models\Employee::distinct()->pluck('department')->toArray();
        }

        // Manager can evaluate all departments (no filtering by assignment)
        if ($this->isManager() && $this->managerAssignments()->where('can_evaluate', true)->exists()) {
            return \App\Models\Employee::distinct()->pluck('department')->toArray();
        }

        // Get departments from Supervisor assignments
        $supervisorDepartments = $this->supervisedDepartments()
            ->where('can_evaluate', true)
            ->pluck('department')
            ->toArray();
        $departments = array_merge($departments, $supervisorDepartments);

        // Get departments from HR assignments with can_evaluate = true
        // (Only if not already handled above - for non-HR role users)
        if (!$this->isHR()) {
            $hrDepartments = $this->hrAssignments()
                ->where('can_evaluate', true)
                ->pluck('department')
                ->toArray();
            $departments = array_merge($departments, $hrDepartments);
        }

        // Get departments from Manager assignments with can_evaluate = true
        // (Only if not already handled above - for non-Manager role users)
        if (!$this->isManager()) {
            $managerDepartments = $this->managerAssignments()
                ->where('can_evaluate', true)
                ->pluck('department')
                ->toArray();
            $departments = array_merge($departments, $managerDepartments);
        }

        // Get departments from Admin assignments with can_evaluate = true
        // Admin can only see their assigned departments (e.g., Mr. Kyle assigned to Utility sees only Utility)
        $adminDepartments = $this->adminAssignments()
            ->where('can_evaluate', true)
            ->pluck('department')
            ->toArray();
        $departments = array_merge($departments, $adminDepartments);

        // Remove duplicates and return
        return array_unique($departments);
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
     * Check if user can evaluate (super admin, supervisor, HR, manager, or admin with department assignments)
     */
    public function canEvaluate()
    {
        // Super Admin can always evaluate
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Supervisor with can_evaluate permission
        if ($this->isSupervisor() && $this->supervisedDepartments()->where('can_evaluate', true)->exists()) {
            return true;
        }

        // HR Personnel with department assignments and can_evaluate = true
        if ($this->hrAssignments()->where('can_evaluate', true)->exists()) {
            return true;
        }

        // Manager with department assignments and can_evaluate = true
        if ($this->managerAssignments()->where('can_evaluate', true)->exists()) {
            return true;
        }

        // Admin with department assignments and can_evaluate = true
        if ($this->adminAssignments()->where('can_evaluate', true)->exists()) {
            return true;
        }

        return false;
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
