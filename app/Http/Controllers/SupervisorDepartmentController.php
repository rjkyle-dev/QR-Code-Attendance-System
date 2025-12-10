<?php

namespace App\Http\Controllers;

use App\Models\SupervisorDepartment;
use App\Models\HRDepartmentAssignment;
use App\Models\ManagerDepartmentAssignment;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class SupervisorDepartmentController extends Controller
{
  public function index()
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin() && !$user->isSupervisor()) {
      return redirect()->route('dashboard.index')->withErrors(['error' => 'Access denied.']);
    }

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

    return Inertia::render('evaluation/supervisor-management', [
      'supervisors' => $supervisors,
      'hr_personnel' => $hrPersonnel,
      'managers' => $managers,
      'departments' => $departments,
      'assignments' => $assignments,
      'hr_assignments' => $hrAssignments,
      'manager_assignments' => $managerAssignments,
      'user_permissions' => [
        'is_super_admin' => $user->isSuperAdmin(),
        'is_supervisor' => $user->isSupervisor(),
      ],
    ]);
  }

  public function store(Request $request)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $request->validate([
      'user_id' => 'required|exists:users,id',
      'department' => 'required|string',
      'can_evaluate' => 'boolean',
    ]);

    $supervisor = User::findOrFail($request->user_id);
    if (!$supervisor->isSupervisor()) {
      return back()->withErrors(['error' => 'Selected user must be a supervisor.']);
    }

    SupervisorDepartment::updateOrCreate(
      [
        'user_id' => $request->user_id,
        'department' => $request->department,
      ],
      [
        'can_evaluate' => $request->can_evaluate ?? true,
      ]
    );

    return back()->with('success', 'Supervisor assignment created successfully.');
  }

  public function update(Request $request, SupervisorDepartment $assignment)
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

    return back()->with('success', 'Supervisor assignment updated successfully.');
  }

  public function destroy(SupervisorDepartment $assignment)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $assignment->delete();

    return back()->with('success', 'Supervisor assignment removed successfully.');
  }

  public function storeHRAssignment(Request $request)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $request->validate([
      'user_id' => 'required|exists:users,id',
      'department' => 'required|string',
    ]);

    $hrUser = User::findOrFail($request->user_id);
    if (!$hrUser->hasRole('HR') && !$hrUser->hasRole('HR Manager') && !$hrUser->hasRole('HR Personnel')) {
      return back()->withErrors(['error' => 'Selected user must have an HR role.']);
    }

    HRDepartmentAssignment::create([
      'user_id' => $request->user_id,
      'department' => $request->department,
      'can_evaluate' => $request->can_evaluate ?? true,
    ]);

    return back()->with('success', 'HR Personnel assignment created successfully.');
  }

  public function updateHRAssignment(Request $request, HRDepartmentAssignment $assignment)
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

    return back()->with('success', 'HR Personnel assignment updated successfully.');
  }

  public function destroyHRAssignment(HRDepartmentAssignment $assignment)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $assignment->delete();

    return back()->with('success', 'HR Personnel assignment removed successfully.');
  }

  public function storeManagerAssignment(Request $request)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $request->validate([
      'user_id' => 'required|exists:users,id',
      'department' => 'required|string',
    ]);

    $managerUser = User::findOrFail($request->user_id);
    if (!$managerUser->hasRole('Manager') && !$managerUser->hasRole('Department Manager')) {
      return back()->withErrors(['error' => 'Selected user must have a Manager role.']);
    }

    ManagerDepartmentAssignment::create([
      'user_id' => $request->user_id,
      'department' => $request->department,
      'can_evaluate' => $request->can_evaluate ?? true,
    ]);

    return back()->with('success', 'Manager assignment created successfully.');
  }

  public function updateManagerAssignment(Request $request, ManagerDepartmentAssignment $assignment)
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

    return back()->with('success', 'Manager assignment updated successfully.');
  }

  public function destroyManagerAssignment(ManagerDepartmentAssignment $assignment)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $assignment->delete();

    return back()->with('success', 'Manager assignment removed successfully.');
  }
}
