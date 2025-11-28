<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;

class TestRoles extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'test:roles';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Test if roles exist in the database';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $this->info('Checking for roles...');

    $roles = Role::all();

    if ($roles->count() > 0) {
      $this->info('Found ' . $roles->count() . ' roles:');
      foreach ($roles as $role) {
        $this->line('- ' . $role->name);
      }
    } else {
      $this->error('No roles found in the database!');
      $this->info('Run: php artisan db:seed --class=PermissionSeeder');
    }
  }
}
