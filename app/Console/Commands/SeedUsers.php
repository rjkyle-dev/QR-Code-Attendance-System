<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\UserSeeder;

class SeedUsers extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'seed:users {--fresh : Run fresh migrations first}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Seed the database with users, roles, and permissions';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    if ($this->option('fresh')) {
      $this->info('Running fresh migrations...');
      $this->call('migrate:fresh');
    }

    $this->info('Seeding permissions and roles...');
    $this->call('db:seed', ['--class' => PermissionSeeder::class]);

    $this->info('Seeding users...');
    $this->call('db:seed', ['--class' => UserSeeder::class]);

    $this->info('Database seeded successfully!');
    $this->info('');
    $this->info('Default login credentials:');
    $this->info('Developer: kyledev10282001@gmail.com / 75595328');
    $this->info('Admin: admin@example.com / password');
    $this->info('HR Manager: hr@example.com / password');
    $this->info('Supervisor: supervisor@example.com / password');
    $this->info('');
    $this->info('Additional users created with random data and roles.');
  }
}
