<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Leave;
use App\Models\Employee;

class LeaveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = Employee::all();

        // If there are no employees, create some
        if ($employees->count() === 0) {
            $employees = Employee::factory()->count(0)->create();
        }

        // Create 30 leaves, each assigned to a random existing employee
        Leave::factory()->count(30)->make()->each(function ($leave) use ($employees) {
            $leave->employee_id = $employees->random()->id;
            $leave->save();
        });
    }
}
