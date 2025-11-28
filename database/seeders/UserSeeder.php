<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {


    // Create regular employees
    // $employees = [
    //   [
    //     'firstname' => 'Jhe Ann',
    //     'lastname' => 'Selle',
    //     'email' => 'jheannselle@gmail.com',
    //     'department' => 'Packing Plant',
    //     'roles' => ['Employee']
    //   ],
    //   [
    //     'firstname' => 'Enje',
    //     'lastname' => 'Ñigas',
    //     'email' => 'enjenigas@gmail.com',
    //     'department' => 'Harvesting',
    //     'roles' => ['Employee']
    //   ],
    // ];

    // foreach ($employees as $employeeData) {
    //   $roles = $employeeData['roles'];
    //   unset($employeeData['roles']);

    //   $user = User::firstOrCreate(
    //     ['email' => $employeeData['email']],
    //     array_merge($employeeData, [
    //       'password' => bcrypt('75595328'),
    //       'email_verified_at' => now(),
    //     ])
    //   );

    //   foreach ($roles as $roleName) {
    //     if (Role::where('name', $roleName)->exists()) {
    //       $user->assignRole($roleName);
    //     } else {
    //       $this->command->warn("Role '{$roleName}' not found. Skipping assignment for user {$user->email}.");
    //     }
    //   }
    // }

    // Create some users with multiple roles
    $multiRoleUsers = [
      [
        'firstname' => 'KyleDev',
        'middlename' => 'Gepz.',
        'lastname' => 'Labz',
        'email' => 'kyledev10282001@gmail.com',
        'department' => 'Management & Staff(Admin)',
        'roles' => ['Super Admin']
      ],
      [
        'firstname' => 'Meshel',
        'middlename' => 'A.',
        'lastname' => 'Basang',
        'email' => 'meshelbasang@gmail.com',
        'department' => 'Management & Staff(Admin)',
        'roles' => ['Manager']
      ],
      [
        'firstname' => 'Rovilyn',
        'middlename' => 'B.',
        'lastname' => 'Villanueva',
        'email' => 'rovilynvillanueva@gmail.com',
        'department' => 'Management & Staff(Admin)',
        'roles' => ['HR']
      ],
      [
        'firstname' => 'Super',
        'middlename' => '',
        'lastname' => 'Admin',
        'email' => 'superadmin@gmail.com',
        'department' => 'Management & Staff(Admin)',
        'roles' => ['Super Admin']
      ]
      // [
      //   'firstname' => 'Ronelito',
      //   'middlename' => '',
      //   'lastname' => 'Mulato',
      //   'email' => 'ronelitomulato@gmail.com',
      //   'department' => 'Harvesting',
      //   'roles' => ['Supervisor']
      // ],
      // [
      //   'firstname' => 'Nestor',
      //   'middlename' => 'C.',
      //   'lastname' => 'Geraga',
      //   'email' => 'nestorcgeraga@gmail.com',
      //   'department' => 'Pest & Decease',
      //   'roles' => ['Supervisor']
      // ],
      // [
      //   'firstname' => 'Marcelo',
      //   'middlename' => '',
      //   'lastname' => 'Milana',
      //   'email' => 'marcelomilana@gmail.com',
      //   'department' => 'Packing Plant',
      //   'roles' => ['Supervisor']
      // ],
      // [
      //   'firstname' => 'Jeah Pearl',
      //   'middlename' => '',
      //   'lastname' => 'Cabal',
      //   'email' => 'jeahpearlcabal@gmail.com',
      //   'department' => 'Packing Plant',
      //   'roles' => ['Supervisor']
      // ],
      // [
      //   'firstname' => 'Norberto',
      //   'middlename' => 'O.',
      //   'lastname' => 'Aguilar',
      //   'email' => 'norbertooaguilar@gmail.com',
      //   'department' => 'Harvesting',
      //   'roles' => ['Supervisor']
      // ],
      // [
      //   'firstname' => 'LP',
      //   'middlename' => '',
      //   'lastname' => 'Subayno',
      //   'email' => 'lpsubayno@gmail.com',
      //   'department' => 'Management & Staff(Admin)',
      //   'roles' => ['ACCTG. Head']
      // ],

    ];

    foreach ($multiRoleUsers as $userData) {
      $roles = $userData['roles'];
      unset($userData['roles']);

      $user = User::firstOrCreate(
        ['email' => $userData['email']],
        array_merge($userData, [
          'password' => bcrypt('password'),
          'email_verified_at' => now(),
        ])
      );

      foreach ($roles as $roleName) {
        if (Role::where('name', $roleName)->exists()) {
          $user->assignRole($roleName);
        } else {
          $this->command->warn("Role '{$roleName}' not found. Skipping assignment for user {$user->email}.");
        }
      }
    }

    // Create additional random users using factory
    User::factory(2)->create()->each(function ($user) {
      // Randomly assign 1-2 roles to each user
      $roles = Role::inRandomOrder()->take(rand(1, 2))->get();
      if ($roles->count() > 0) {
        $user->assignRole($roles);
      } else {
        $this->command->warn("No roles found. Skipping role assignment for user {$user->email}.");
      }
    });

    $this->command->info('Users seeded successfully!');
    $this->command->info('Default login credentials:');
    $this->command->info('Super Admin: superadmin@gmail.com / 75595328');
    $this->command->info('HR: hr@gmail.com / 75595328');
    $this->command->info('Supervisor: ppsupervisor@gmail.com / 75595328');
  }
}
