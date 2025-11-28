<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::orderBy('created_at', 'desc')->get();
        $transformedPermissions = $permissions->transform(function ($permissions) {
            return [
                'id' => $permissions->id,
                'name' => $permissions->name,
                'created_at' => $permissions->created_at->format('d-m-Y'),
            ];
        });
        return Inertia::render('access/permission/index', [
            'permissions' => $transformedPermissions,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Permission store method called', ['data' => $request->all()]);

        $request->validate([
            'permission_name' => 'required|string|max:255|unique:permissions,name',
        ]);

        try {
            Permission::create([
                'name' => $request->permission_name,
                'guard_name' => 'web',
            ]);

            return redirect()->back()->with('success', 'Permission created successfully');
        } catch (\Exception $e) {
            Log::error('Permission creation failed', ['error' => $e->getMessage()]);
            return redirect()->back()->withErrors(['permission_name' => 'Failed to create permission: ' . $e->getMessage()]);
        }
    }

    public function show(Permission $permission)
    {
        return Inertia::render('permission/show', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'created_at' => $permission->created_at->format('d-m-Y'),
            ],
        ]);
    }

    public function update(Request $request, Permission $permission)
    {
        $request->validate([
            'permission_name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
        ]);

        $permission->update([
            'name' => $request->permission_name,
        ]);

        return redirect()->route('permission.index')->with('success', 'Permission updated successfully');
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();

        return redirect()->route('permission.index')->with('success', 'Permission deleted successfully');
    }
}
