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
        'qr_code_secret',
        'gmail_password',
        'nbi_clearance',
        // HDMF fields
        'hdmf_user_id',
        // SSS fields
        'sss_user_id',
        // Philhealth fields
        'philhealth_user_id',
        // TIN fields
        'tin_user_id',
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

    public function qrTokens()
    {
        return $this->hasMany(EmployeeQrToken::class);
    }

    public function salarySettings()
    {
        return $this->hasMany(EmployeeSalarySetting::class)->where('is_active', true)->latest('effective_date');
    }

    public function currentSalarySetting()
    {
        return $this->salarySettings()->first();
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
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

    /**
     * Generate or retrieve QR code secret
     */
    public function getOrGenerateQrSecret(): string
    {
        if (empty($this->qr_code_secret)) {
            $this->qr_code_secret = bin2hex(random_bytes(32)); // 64 character hex string
            $this->save();
        }

        return $this->qr_code_secret;
    }

    /**
     * Generate a QR code token for attendance
     * 
     * @param int $expiresInSeconds Number of seconds until token expires (default: 60)
     * @return EmployeeQrToken
     */
    public function generateQrToken(int $expiresInSeconds = 60): EmployeeQrToken
    {
        // Generate unique token
        $token = bin2hex(random_bytes(32)); // 64 character hex string

        // Create expiration time
        $expiresAt = Carbon::now()->addSeconds($expiresInSeconds);

        // Invalidate any existing valid tokens for this employee (prevent multiple active QR codes)
        $this->qrTokens()
            ->valid()
            ->update(['used_at' => now()]);

        // Create new token
        $qrToken = $this->qrTokens()->create([
            'token' => $token,
            'expires_at' => $expiresAt,
        ]);

        return $qrToken;
    }

    /**
     * Generate QR code data (payload for QR code)
     * 
     * @param int $expiresInSeconds Number of seconds until token expires
     * @return array
     */
    public function generateQrCodeData(int $expiresInSeconds = 60): array
    {
        $qrToken = $this->generateQrToken($expiresInSeconds);
        $secret = $this->getOrGenerateQrSecret();

        // Create payload
        $payload = [
            'employee_id' => $this->id,
            'employeeid' => $this->employeeid,
            'token' => $qrToken->token,
            'expires_at' => $qrToken->expires_at->toIso8601String(),
        ];

        // Generate HMAC signature
        $signature = hash_hmac('sha256', json_encode($payload), $secret);
        $payload['signature'] = $signature;

        return [
            'token' => $qrToken->token,
            'expires_at' => $qrToken->expires_at->toIso8601String(),
            'expires_in' => $expiresInSeconds,
            'qr_data' => $payload,
        ];
    }

    /**
     * Validate QR code token
     * 
     * @param string $token
     * @param string|null $signature
     * @return EmployeeQrToken|null
     */
    public function validateQrToken(string $token, ?string $signature = null): ?EmployeeQrToken
    {
        $qrToken = $this->qrTokens()
            ->where('token', $token)
            ->first();

        if (!$qrToken || !$qrToken->isValid()) {
            return null;
        }

        // If signature provided, validate it
        if ($signature) {
            $secret = $this->getOrGenerateQrSecret();
            $payload = [
                'employee_id' => $this->id,
                'employeeid' => $this->employeeid,
                'token' => $qrToken->token,
                'expires_at' => $qrToken->expires_at->toIso8601String(),
            ];
            $expectedSignature = hash_hmac('sha256', json_encode($payload), $secret);

            if (!hash_equals($expectedSignature, $signature)) {
                return null; // Signature mismatch
            }
        }

        return $qrToken;
    }
}
