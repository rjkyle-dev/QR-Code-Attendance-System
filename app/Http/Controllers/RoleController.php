<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->orderBy('created_at', 'desc')->get();
        $transformedRoles = $roles->transform(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
                'created_at' => $role->created_at->format('d-m-Y'),
            ];
        });

        return Inertia::render('access/role/index', [
            'roles' => $transformedRoles,
        ]);
    }

    public function create()
    {
        $permissions = Permission::orderBy('name')->get();
        $transformedPermissions = $permissions->transform(function ($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'created_at' => $permission->created_at->format('d-m-Y'),
            ];
        });

        return Inertia::render('access/role/create', [
            'permissions' => $transformedPermissions,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Role store method called', ['data' => $request->all()]);

        $request->validate([
            'role_name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'string',
        ]);

        try {
            $role = Role::create([
                'name' => $request->role_name,
                'guard_name' => 'web',
            ]);

            if ($request->has('permissions') && is_array($request->permissions)) {
                $role->syncPermissions($request->permissions);
            }

            return redirect()->route('role.index')->with('success', 'Role created successfully');
        } catch (\Exception $e) {
            Log::error('Role creation failed', ['error' => $e->getMessage()]);
            return redirect()->back()->withErrors(['role_name' => 'Failed to create role: ' . $e->getMessage()]);
        }
    }

    public function show(Role $role)
    {
        return Inertia::render('access/role/show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
                'created_at' => $role->created_at->format('d-m-Y'),
            ],
        ]);
    }

    public function edit(Role $role)
    {
        $permissions = Permission::orderBy('name')->get();
        $transformedPermissions = $permissions->transform(function ($permission) use ($role) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'created_at' => $permission->created_at->format('d-m-Y'),
                'selected' => $role->hasPermissionTo($permission->name),
            ];
        });

        return Inertia::render('access/role/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
                'created_at' => $role->created_at->format('d-m-Y'),
            ],
            'permissions' => $transformedPermissions,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'role_name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'array',
            'permissions.*' => 'string',
        ]);

        try {
            $role->update([
                'name' => $request->role_name,
            ]);

            if ($request->has('permissions') && is_array($request->permissions)) {
                $role->syncPermissions($request->permissions);
            }

            return redirect()->route('role.index')->with('success', 'Role updated successfully');
        } catch (\Exception $e) {
            Log::error('Role update failed', ['error' => $e->getMessage()]);
            return redirect()->back()->withErrors(['role_name' => 'Failed to update role: ' . $e->getMessage()]);
        }
    }

    public function destroy(Role $role)
    {
        try {
            $role->delete();
            return redirect()->route('role.index')->with('success', 'Role deleted successfully');
        } catch (\Exception $e) {
            Log::error('Role deletion failed', ['error' => $e->getMessage()]);
            return redirect()->back()->withErrors(['error' => 'Failed to delete role: ' . $e->getMessage()]);
        }
    }
}
