<?php

namespace App\Http\Controllers;

use App\Models\SupervisorDepartment;
use App\Models\HRDepartmentAssignment;
use App\Models\ManagerDepartmentAssignment;
use App\Models\AdminDepartmentAssignment;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AdminManagementController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $supervisors = User::whereHas('roles', function ($query) {
            $query->where('name', 'Supervisor');
        })->with('supervisedDepartments')->get();

        $hrPersonnel = User::whereHas('roles', function ($query) {
            $query->where('name', 'like', '%HR%')
                ->orWhere('name', 'like', '%hr%');
        })->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray(),
            ];
        });

        $managers = User::whereHas('roles', function ($query) {
            $query->where('name', 'like', '%Manager%')
                ->orWhere('name', 'like', '%manager%');
        })->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray(),
            ];
        });

        $departments = Employee::distinct()->pluck('department')->toArray();

        $assignments = SupervisorDepartment::with('user')->get();

        $hrAssignments = HRDepartmentAssignment::with('user')->get()->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'user_id' => $assignment->user_id,
                'department' => $assignment->department,
                'can_evaluate' => $assignment->can_evaluate ?? true,
                'user' => [
                    'id' => $assignment->user->id,
                    'firstname' => $assignment->user->firstname,
                    'lastname' => $assignment->user->lastname,
                    'email' => $assignment->user->email,
                ],
            ];
        });

        $managerAssignments = ManagerDepartmentAssignment::with('user')->get()->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'user_id' => $assignment->user_id,
                'department' => $assignment->department,
                'can_evaluate' => $assignment->can_evaluate ?? true,
                'user' => [
                    'id' => $assignment->user->id,
                    'firstname' => $assignment->user->firstname,
                    'lastname' => $assignment->user->lastname,
                    'email' => $assignment->user->email,
                ],
            ];
        });

        $adminUsers = User::with('roles')
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'Supervisor');
            })
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'like', '%HR%')
                    ->orWhere('name', 'like', '%hr%');
            })
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'like', '%Manager%')
                    ->orWhere('name', 'like', '%manager%');
            })
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'firstname' => $user->firstname,
                    'lastname' => $user->lastname,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->toArray(),
                ];
            });

        $adminAssignments = AdminDepartmentAssignment::with('user')->get()->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'user_id' => $assignment->user_id,
                'department' => $assignment->department,
                'can_evaluate' => $assignment->can_evaluate ?? true,
                'user' => [
                    'id' => $assignment->user->id,
                    'firstname' => $assignment->user->firstname,
                    'lastname' => $assignment->user->lastname,
                    'email' => $assignment->user->email,
                ],
            ];
        });

        return Inertia::render('admin-management/index', [
            'supervisors' => $supervisors,
            'hr_personnel' => $hrPersonnel,
            'managers' => $managers,
            'departments' => $departments,
            'assignments' => $assignments,
            'hr_assignments' => $hrAssignments,
            'manager_assignments' => $managerAssignments,
            'admin_users' => $adminUsers,
            'admin_assignments' => $adminAssignments,
            'user_permissions' => [
                'is_super_admin' => $user->isSuperAdmin(),
                'is_supervisor' => $user->isSupervisor(),
            ],
        ]);
    }

    public function storeAdminAssignment(Request $request)
    {
        $user = Auth::user();

        if (!$user->isSuperAdmin()) {
            return back()->withErrors(['error' => 'Access denied.']);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'department' => 'required|string',
        ]);

        AdminDepartmentAssignment::updateOrCreate(
            [
                'user_id' => $request->user_id,
                'department' => $request->department,
            ],
            [
                'user_id' => $request->user_id,
                'department' => $request->department,
                'can_evaluate' => $request->can_evaluate ?? true,
            ]
        );

        return back()->with('success', 'Admin assignment created successfully.');
    }

    public function updateAdminAssignment(Request $request, AdminDepartmentAssignment $assignment)
    {
        $user = Auth::user();

        if (!$user->isSuperAdmin()) {
            return back()->withErrors(['error' => 'Access denied.']);
        }

        $request->validate([
            'can_evaluate' => 'required|boolean',
        ]);

        $assignment->update([
            'can_evaluate' => $request->can_evaluate,
        ]);

        return back()->with('success', 'Admin assignment updated successfully.');
    }

    public function destroyAdminAssignment(AdminDepartmentAssignment $assignment)
    {
        $user = Auth::user();

        if (!$user->isSuperAdmin()) {
            return back()->withErrors(['error' => 'Access denied.']);
        }

        $assignment->delete();

        return back()->with('success', 'Admin assignment removed successfully.');
    }
}
