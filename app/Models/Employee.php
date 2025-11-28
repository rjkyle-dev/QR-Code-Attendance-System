<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'employees';

    protected $fillable = [
        'email',
        'employeeid',
        'employee_name',
        'firstname',
        'middlename',
        'lastname',
        'date_of_birth',
        'department',
        'position',
        'service_tenure',
        'phone',
        'work_status',
        'gender',
        'marital_status',
        'address',
        'city',
        'state',
        'country',
        'zip_code',
        'picture',
        'pin',
        'gmail_password',
        'recommendation_letter',
        // HDMF fields
        'hdmf_user_id',
        'hdmf_username',
        'hdmf_password',
        // SSS fields
        'sss_user_id',
        'sss_username',
        'sss_password',
        // Philhealth fields
        'philhealth_user_id',
        'philhealth_username',
        'philhealth_password',
        // TIN fields
        'tin_user_id',
        'tin_username',
        'tin_password',
    ];

    protected static function boot()
    {
        parent::boot();

        // Auto-generate PIN when creating or updating employee
        static::creating(function ($employee) {
            if (empty($employee->pin)) {
                $employee->pin = $employee->generatePin();
            }
        });

        static::updating(function ($employee) {
            // Only regenerate PIN if lastname or date_of_birth changed
            if ($employee->isDirty('lastname') || $employee->isDirty('date_of_birth')) {
                $employee->pin = $employee->generatePin();
            }
        });
    }

    /**
     * Generate PIN based on lastname and birth year
     * Format: first 3 letters of lastname (lowercase) + birth year
     */
    public function generatePin(): string
    {
        $lastname = strtolower(substr($this->lastname, 0, 3));
        $birthYear = $this->date_of_birth ? Carbon::parse($this->date_of_birth)->format('Y') : date('Y');

        return $lastname . $birthYear;
    }

    /**
     * Reset PIN for employee
     */
    public function resetPin(): string
    {
        $this->pin = $this->generatePin();
        $this->save();

        return $this->pin;
    }

    // app/Models/Employee.php

    public function fingerprints()
    {
        return $this->hasMany(Fingerprint::class);
    }
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }

    public function serviceTenure()
    {
        return $this->hasMany(ServiceTenure::class);
    }

    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    public function absences()
    {
        return $this->hasMany(Absence::class);
    }

    public function leaveCredits()
    {
        return $this->hasMany(LeaveCredit::class);
    }

    public function absenceCredits()
    {
        return $this->hasMany(AbsenceCredit::class);
    }

    public function resumeToWork()
    {
        return $this->hasMany(ResumeToWork::class);
    }

    /**
     * Get current year's leave credits
     */
    public function getCurrentLeaveCredits($year = null)
    {
        $year = $year ?? now()->year;
        return LeaveCredit::getOrCreateForEmployee($this->id, $year);
    }

    /**
     * Get remaining leave credits for current year
     */
    public function getRemainingLeaveCredits($year = null)
    {
        $credits = $this->getCurrentLeaveCredits($year);
        return $credits->remaining_credits;
    }

    /**
     * Get current year's absence credits
     */
    public function getCurrentAbsenceCredits($year = null)
    {
        $year = $year ?? now()->year;
        return AbsenceCredit::getOrCreateForEmployee($this->id, $year);
    }

    /**
     * Get remaining absence credits for current year
     */
    public function getRemainingAbsenceCredits($year = null)
    {
        $credits = $this->getCurrentAbsenceCredits($year);
        return $credits->remaining_credits;
    }
}
