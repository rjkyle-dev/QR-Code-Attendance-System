<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Create permissions
    $permissions = [
      // Dashboard permissions
      'View Dashboard',
      'View Payroll',
      'View Admin Management',
      // Employee permissions
      'View Employee Details',
      'View Employee',
      'Add Employee',
      'Update Employee',
      'Delete Employee',


      // Attendance permissions
      'View Attendance Details',
      'View Attendance',
      'Add Attendance',
      'Update Attendance',
      'Delete Attendance',
      'Set Session Times',

      // Evaluation permissions
      'View Evaluation Details',
      'View Evaluation',
      'Add Evaluation',
      'Update Evaluation',
      'Delete Evaluation',
      'Start Evaluation Rating',
      'Refresh Evaluation List',
      'View Evaluation By Department',
      'View Supervisor Management',

      // Leave permissions
      'View Leave',
      'View Leave Details',
      'Add Leave',
      'Update Leave',
      'Delete Leave',
      'Download Leave PDF',
      'Sent Email Approval',
      'Leave Status Approval',
      'View Leave Credit Summary',

      // Service Tenure permissions
      'View Service Tenure Management',
      'Add Service Tenure',
      'Update Service Tenure',
      'Delete Service Tenure',
      'View Service Tenure',
      'View Service Tenure Dashboard',
      'View Service Tenure Employee',
      'View Service Tenure Pay Advancement',
      'View Service Tenure Report',

      // Report permissions
      'View Report',
      'View Report Attendance',
      'View Report Leave',
      'View Report Performance',
      'View Report Analytics',
      'Add Report',
      'Update Report',
      'Delete Report',

      // User Management permissions
      'View Admin',
      'View Admin Details',
      'Add Admin',
      'Update Admin',
      'Delete Admin',

      // Role Management permissions
      'View Role',
      'View Roles Details',
      'Add Roles',
      'Update Roles',
      'Delete Roles',

      // Permission Control permissions
      'View Permission Details',
      'View Permission',
      'Add Permission',
      'Update Permission',
      'Delete Permission',

      // Absence permissions
      'View Absence',
      'View Absence Details',
      'Add Absence',
      'Update Absence',
      'Delete Absence',
      'Absence Request',

      'View Absence Credit Summary',
      // Access Management permissions
      'View Access',

      'View Resume to Work',
      'Add Password',
      'View Password',
    ];

    foreach ($permissions as $permission) {
      // Try to find existing permission by name (regardless of guard_name)
      $permissionModel = Permission::where('name', $permission)->first();

      if ($permissionModel) {
        // Update guard_name if it's not 'web'
        if ($permissionModel->guard_name !== 'web') {
          $permissionModel->guard_name = 'web';
          $permissionModel->save();
        }
      } else {
        // Create new permission with guard_name
        Permission::create([
          'name' => $permission,
          'guard_name' => 'web'
        ]);
      }
    }

    // Create roles and assign permissions
    $roles = [
      'Super Admin' => $permissions, // All permissions
      'Manager' => $permissions, // All permissions
      'HR Manager' => $permissions, // All permissions
      'Employee' => [
        'View Dashboard',
        'View Employee Details',
        'View Attendance Details',
        'View Leave',
        'View Leave Details',
        'Add Leave',
        'Update Leave',
        'View Service Tenure Employee',
        'Absence Request',
        'View Absence',
        'View Absence Details',
        'View Resume to Work',
      ],
      'HR' => [
        'View Dashboard',
        'View Employee Details',
        'View Employee',
        'Add Employee',
        'Update Employee',
        'View Attendance Details',
        'View Attendance',
        'View Leave',
        'View Leave Details',
        'Add Leave',
        'Update Leave',
        'Delete Leave',
        'Leave Status Approval',
        'View Leave Credit Summary',
        'View Service Tenure Management',
        'Add Service Tenure',
        'Update Service Tenure',
        'View Service Tenure',
        'View Service Tenure Dashboard',
        'View Service Tenure Employee',
        'View Service Tenure Pay Advancement',
        'View Service Tenure Report',
        'View Absence',
        'View Absence Details',
        'Add Absence',
        'Update Absence',
        'Delete Absence',
        'Absence Request',
        'View Absence Credit Summary',
        'View Resume to Work',
        'Add Password',
        'View Password',
      ],
      'Supervisor' => [
        // Dashboard permissions
        'View Dashboard',

        // Evaluation permissions
        'View Evaluation Details',
        'View Evaluation',
        'Add Evaluation',
        'Update Evaluation',
        'View Dashboard',
        'View Employee Details',
        'View Attendance Details',
        'View Leave',
        'View Evaluation By Department',
        'View Leave Credit Summary',

        'View Absence Credit Summary',
        'Delete Evaluation',
        'Start Evaluation Rating',
        'Refresh Evaluation List',
        'View Employee Details',
        'View Attendance Details',
        'View Leave',

        // Report permissions
        'View Report',
        'View Report Attendance',
        'View Report Leave',
        'View Report Performance',
        'View Report Analytics',

      ],
    ];

    foreach ($roles as $roleName => $rolePermissions) {
      // Try to find existing role by name (regardless of guard_name)
      $role = Role::where('name', $roleName)->first();

      if ($role) {
        // Update guard_name if it's not 'web'
        if ($role->guard_name !== 'web') {
          $role->guard_name = 'web';
          $role->save();
        }
      } else {
        // Create new role with guard_name
        $role = Role::create([
          'name' => $roleName,
          'guard_name' => 'web'
        ]);
      }

      $role->syncPermissions($rolePermissions);
    }

    $this->command->info('Permissions and roles seeded successfully!');
  }
}
