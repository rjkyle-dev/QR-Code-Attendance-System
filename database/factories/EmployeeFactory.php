<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstname = $this->faker->firstName;
        $middlename = $this->faker->firstName;
        $lastname = $this->faker->lastName;

        return [
            'employeeid' => $this->faker->unique()->numerify('00###'),
            'firstname' => $firstname,
            'middlename' => $middlename,
            'lastname' => $lastname,
            'employee_name' => "{$firstname} {$middlename} {$lastname}",
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->numerify('09#########'),
            'department' => $this->faker->randomElement([
                'Management & Staff(Admin)',
                'Packing Plant',
                'Harvesting',
                'Pest & Decease',
                'Miscellaneous',
                'Coop Area',
                'Security Forces',
                'Engineering',
                'Utility'
            ]),
            'position' => $this->faker->randomElement([
                // Management & Staff positions
                'Manager',
                'Farm Superintendent',
                'HR',
                'Packing Plant Supervisor',
                'Harvesting Supervisor',
                'P&D Supervisor',
                'M&S Supervisor',
                'Accounting Supervisor',
                'Cashier',
                'Office Employees Main',
                'Packing Plant Assistant',
                'Packing Plant Maintenance',
                'Driver',
                'M&S Aide',
                'Security Supervisor',
                'Coop Area/Manage Coop Supervisor',
                'Probationary Office Staff',
                // Packing Plant positions
                'Regular Hired Workers',
                'Fruit Recorder',
                'Probitionary',
                'Seasonal',
                // Harvesting positions
                'Regular Hired Workers',
                'Probitionary',
                'Spare',
                // Pest & Decease positions
                'Regular Hired Workers',
                'Footbath Maintenance',
                'Probitionary PDC',
                'PDC Seasonal',
                // Coop Area positions
                'Regular Hired Workers',
                'Probitionary',
                // Miscellaneous positions
                'Utility/Janitorial',
                'Field Surveyor',
                'Field Surveyor/Spare',
                'Miscellaneous - Probitionary',
                'Sigatoka Deleafer',
                'Sigatoka Monitoring',
                // Security Forces positions
                'Security Guard: Agency-MINVITS',
                'Security Guard: SECURUS',
                'Spray Man (Main Gate)',
                // Engineering positions
                'N/A',
                // Utility positions
                'N/A'
            ]),
            'marital_status' => $this->faker->randomElement(['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Other']),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'work_status' => $this->faker->randomElement(['Regular', 'Add Crew', 'Probationary', 'Sessional']),
            'service_tenure' => $this->faker->date(),
            'date_of_birth' => $this->faker->date(),
            'picture' => null,
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            // Keep country consistent with project context
            'country' => 'Philippines',
            'zip_code' => $this->faker->postcode(),

        ];
    }

    // Add a named state for creating the requested specific employee
    public function rjkyle(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'email' => 'rjkylegepolongcalabrador@gmail.com',
                'employeeid' => '75595328',
                'employee_name' => 'RJ Kyle Gepolongca Labrador',
                'gender' => 'Male',
                'date_of_birth' => '2001-10-28',
                'firstname' => 'RJ Kyle',
                'middlename' => 'Gepolongca',
                'lastname' => 'Labrador',
                'phone' => '09123456789',
                'department' => 'Management & Staff(Admin)',
                'position' => 'Manager',
                'marital_status' => 'Single',
                'work_status' => 'Regular',
                'service_tenure' => '2021-01-01',
                'picture' => null,
                'address' => '123 Main St, Anytown, USA',
                'city' => 'Anytown',
                'state' => 'Anytown',
                'country' => 'Philippines',
                'zip_code' => '12345',


            ];
        });
    }
}
