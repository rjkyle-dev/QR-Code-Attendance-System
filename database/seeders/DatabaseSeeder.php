<?php

namespace Database\Seeders;

use App\Models\Leave;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run PermissionSeeder FIRST to create roles and permissions
        $this->call(PermissionSeeder::class);

        // Create the main developer users AFTER roles exist
        $users = [
            [
                'firstname' => 'Kyle',
                'middlename' => 'Dev',
                'lastname' => 'Labz',
                'email' => 'kyledev10282001@gmail.com',
                'password' => Hash::make('75595328'),
                'email_verified_at' => now(),
            ],
            [
                'firstname' => 'Philip Roy',
                'middlename' => 'Q',
                'lastname' => 'Concha',
                'email' => 'philiproyconcha@gmail.com',
                'password' => Hash::make('75595328'),
                'email_verified_at' => now(),
            ],

        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // Assign Super Admin role to both users if the role exists
            if (\Spatie\Permission\Models\Role::where('name', 'Super Admin')->exists()) {
                $user->assignRole('Super Admin');
            }
        }

        // Seed employees first if not present
        if (\App\Models\Employee::count() === 0) {
            \App\Models\Employee::factory(10)->create();
        }

        // Seed evaluations
        \App\Models\Employee::factory(10)->create();

        $this->call([
            EmployeeSeeder::class,
            AttendanceSeeder::class,
        ]);

        // Then run other seeders
        $this->call([
            LeaveSeeder::class,
            AbsenceSeeder::class,
            UserSeeder::class,
            SupervisorDepartmentSeeder::class,
            // EvaluationConfigurationSeeder::class, // Add this before EvaluationSeeder
            EvaluationSeeder::class, // Creates 30 evaluations per department
            // Add recognition award test data
        ]);
    }
}
