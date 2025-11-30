<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class FixPermissionGuards extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:fix-guards';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix guard_name for existing permissions and roles to use web guard';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing permissions guard_name...');

        // Fix permissions - get all and check
        $permissions = Permission::all();

        $permissionCount = 0;
        foreach ($permissions as $permission) {
            if (empty($permission->guard_name) || $permission->guard_name !== 'web') {
                $permission->guard_name = 'web';
                $permission->save();
                $permissionCount++;
            }
        }

        $this->info("Updated {$permissionCount} permissions.");

        // Fix roles - get all and check
        $this->info('Fixing roles guard_name...');

        $roles = Role::all();

        $roleCount = 0;
        foreach ($roles as $role) {
            if (empty($role->guard_name) || $role->guard_name !== 'web') {
                $role->guard_name = 'web';
                $role->save();
                $roleCount++;
            }
        }

        $this->info("Updated {$roleCount} roles.");

        // Clear permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $this->info('Permission cache cleared.');
        $this->info('Done!');

        return Command::SUCCESS;
    }
}
