<?php

namespace Database\Seeders;

use App\Models\SupervisorDepartment;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class SupervisorDepartmentSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Get or create supervisor role
    $supervisorRole = Role::firstOrCreate(['name' => 'Supervisor']);

    // Create sample supervisors if they don't exist
    $supervisors = [
      // [
      //   'firstname' => 'RJ Kyle',
      //   'lastname' => 'Labrador',
      //   'email' => 'rjkylegepolongcalabrador@gmail.com',
      //   'password' => bcrypt('75595328'),
      //   'department' => 'Management & Staff(Admin)',
      // ],
      // [
      //   'firstname' => 'Ronelito',
      //   'middlename' => '',
      //   'lastname' => 'Mulato',
      //   'email' => 'ronelitomulato@gmail.com',
      //   'password' => bcrypt('75595328'),
      //   'department' => 'Harvesting',

      // ],
      // [
      //   'firstname' => 'Nestor',
      //   'middlename' => 'C.',
      //   'lastname' => 'Geraga',
      //   'email' => 'nestorcgeraga@gmail.com',
      //   'password' => bcrypt('75595328'),
      //   'department' => 'Pest & Decease',
      // ],
      // [
      //   'firstname' => 'Marcelo',
      //   'middlename' => '',
      //   'lastname' => 'Milana',
      //   'email' => 'marcelomilana@gmail.com',
      //   'password' => bcrypt('75595328'),
      //   'department' => 'Packing Plant',
      // ],
      // [
      //   'firstname' => 'Jeah Pearl',
      //   'middlename' => '',
      //   'lastname' => 'Cabal',
      //   'email' => 'jeahpearlcabal@gmail.com',
      //   'password' => bcrypt('75595328'),
      //   'department' => 'Packing Plant',
      // ],
      // [
      //   'firstname' => 'Norberto',
      //   'middlename' => 'O.',
      //   'lastname' => 'Aguilar',
      //   'email' => 'norbertooaguilar@gmail.com',
      //   'password' => bcrypt('75595328'),
      //   'department' => 'Harvesting',
      // ],
      // [
      //   'firstname' => 'LP',
      //   'middlename' => '',
      //   'lastname' => 'Subayno',
      //   'email' => 'lpsubayno@gmail.com',
      //   'password' => bcrypt('75595328'),
      //   'department' => 'Management & Staff(Admin)',
      // ],
      [
        'firstname' => 'CC Area',
        'middlename' => '',
        'lastname' => 'Supervisor',
        'email' => 'ccareasupervisor@gmail.com',
        'password' => bcrypt('75595328'),
        'department' => 'Coop Area',
      ],
      [
        'firstname' => 'PP Area',
        'middlename' => '',
        'lastname' => 'Supervisor',
        'email' => 'ppsupervisor@gmail.com',
        'password' => bcrypt('75595328'),
        'department' => 'Packing Plant',
      ],
      [
        'firstname' => 'Harvesting Area',
        'middlename' => '',
        'lastname' => 'Supervisor',
        'email' => 'harvestingsupervisor@gmail.com',
        'password' => bcrypt('75595328'),
        'department' => 'Harvesting',
      ],
      [
        'firstname' => 'Pest & Decease Area',
        'middlename' => '',
        'lastname' => 'Supervisor',
        'email' => 'pestanddecausesupervisor@gmail.com',
        'password' => bcrypt('75595328'),
        'department' => 'Pest & Decease',
      ],
      [
        'firstname' => 'Engineering Area',
        'middlename' => '',
        'lastname' => 'Supervisor',
        'email' => 'engineeringsupervisor@gmail.com',
        'password' => bcrypt('75595328'),
        'department' => 'Engineering',
      ],
      [
        'firstname' => 'Utility Area',
        'middlename' => '',
        'lastname' => 'Supervisor',
        'email' => 'utilitysupervisor@gmail.com',
        'password' => bcrypt('75595328'),
        'department' => 'Utility',
      ],
      [
        'firstname' => 'Admin Area',
        'middlename' => '',
        'lastname' => 'Supervisor',
        'email' => 'adminsupervisor@gmail.com',
        'password' => bcrypt('75595328'),
        'department' => 'Management & Staff(Admin)',
      ],
      [
        'firstname' => 'Security Forces Area',
        'middlename' => '',
        'lastname' => 'Supervisor',
        'email' => 'securityforcessupervisor@gmail.com',
        'password' => bcrypt('75595328'),
        'department' => 'Security Forces',
      ],
      [
        'firstname' => 'Miscellaneous Area',
        'middlename' => '',
        'lastname' => 'Supervisor',
        'email' => 'miscellaneoussupervisor@gmail.com',
        'password' => bcrypt('75595328'),
        'department' => 'Miscellaneous',
      ],
    ];

    foreach ($supervisors as $supervisorData) {
      $supervisor = User::firstOrCreate(
        ['email' => $supervisorData['email']],
        $supervisorData
      );

      // Assign supervisor role
      $supervisor->assignRole($supervisorRole);

      // Create supervisor-department assignment
      SupervisorDepartment::firstOrCreate(
        [
          'user_id' => $supervisor->id,
          'department' => $supervisorData['department'],
        ],
        [
          'can_evaluate' => true,
        ]
      );
    }

    $this->command->info('Supervisor department assignments seeded successfully!');
  }
}
