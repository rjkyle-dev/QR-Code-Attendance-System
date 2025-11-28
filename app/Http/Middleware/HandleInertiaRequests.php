<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\Notification;
use App\Models\Employee;
use Illuminate\Support\Facades\Session;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();

        // Fetch user-specific notifications (latest 10)
        $notifications = collect();
        $unreadCount = 0;

        if ($user) {
            $isSuperAdmin = $user->hasRole('Super Admin');

            if ($isSuperAdmin) {
                // Super admin sees all notifications
                $notifications = Notification::orderBy('created_at', 'desc')->take(10)->get();
                $unreadCount = Notification::whereNull('read_at')->count();
            } else {
                // Other users see only their own notifications
                $notifications = Notification::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->take(10)
                    ->get();
                $unreadCount = Notification::where('user_id', $user->id)
                    ->whereNull('read_at')
                    ->count();
            }
        }

        $permissions = $user ? $user->getAllPermissions()->pluck('name')->toArray() : [];

        // Transform user data to include profile_image and roles
        $transformedUser = null;
        if ($user) {
            $transformedUser = [
                'id' => $user->id,
                'firstname' => $user->firstname,
                'middlename' => $user->middlename,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'profile_image' => $user->profile_image,
                'department' => $user->department,
                'roles' => $user->roles->pluck('name')->toArray(),
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'isSupervisor' => $user->isSupervisor(),
                'isSuperAdmin' => $user->isSuperAdmin(),
                'isHR' => $user->isHR(),
            ];
        }

        // Share the logged-in employee (for employee portal pages) globally
        $sharedEmployee = null;
        $employeeIdFromSession = Session::get('employee_id');
        if ($employeeIdFromSession) {
            $employee = Employee::where('employeeid', $employeeIdFromSession)->first();
            if ($employee) {
                $sharedEmployee = [
                    'id' => $employee->id,
                    'employeeid' => $employee->employeeid,
                    'employee_name' => $employee->employee_name,
                    'firstname' => $employee->firstname,
                    'lastname' => $employee->lastname,
                    'department' => $employee->department,
                    'position' => $employee->position,
                    'picture' => $employee->picture,
                ];
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $transformedUser,
                'permissions' => $permissions,
            ],
            // Make employee available to all Inertia pages
            'employee' => $sharedEmployee,
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            // Add notifications globally
            'notifications' => $notifications,
            'unreadNotificationCount' => $unreadCount,
            'flash' => [
                'success' => fn() => $request->session()->get('success') ?? null,
                'error' => fn() => $request->session()->get('error') ?? null,
            ],
        ];
    }
}
