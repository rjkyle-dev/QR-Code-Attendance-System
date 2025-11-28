<?php

namespace Database\Seeders;

use App\Models\Absence;
use App\Models\Employee;
use Illuminate\Database\Seeder;

class AbsenceSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Only get employees that have a department (not null)
    $employees = Employee::whereNotNull('department')->get();

    // If there are no employees with departments, create some
    if ($employees->count() === 0) {
      $employees = Employee::factory()->count(10)->create();
      // Filter again to ensure we only use employees with departments
      $employees = Employee::whereNotNull('department')->get();
    }

    // Ensure we have employees with departments before proceeding
    if ($employees->count() === 0) {
      $this->command->warn('No employees with departments found. Skipping absence seeding.');
      return;
    }

    // Create 30 absences total: 10 approved, 10 rejected, 10 pending
    Absence::factory()
      ->count(10)
      ->approved()
      ->make()
      ->each(function ($absence) use ($employees) {
        $employee = $employees->random();
        $absence->employee_id = $employee->id;
        $absence->full_name = $employee->employee_name;
        $absence->employee_id_number = $employee->employeeid;
        $absence->department = $employee->department ?? 'Miscellaneous';
        $absence->position = $employee->position ?? 'Regular Hired Workers';
        $absence->save();
      });

    // Create 10 rejected absences
    Absence::factory()
      ->count(10)
      ->rejected()
      ->make()
      ->each(function ($absence) use ($employees) {
        $employee = $employees->random();
        $absence->employee_id = $employee->id;
        $absence->full_name = $employee->employee_name;
        $absence->employee_id_number = $employee->employeeid;
        $absence->department = $employee->department ?? 'Miscellaneous';
        $absence->position = $employee->position ?? 'Regular Hired Workers';
        $absence->save();
      });

    // Create 10 pending absences
    Absence::factory()
      ->count(10)
      ->pending()
      ->make()
      ->each(function ($absence) use ($employees) {
        $employee = $employees->random();
        $absence->employee_id = $employee->id;
        $absence->full_name = $employee->employee_name;
        $absence->employee_id_number = $employee->employeeid;
        $absence->department = $employee->department ?? 'Miscellaneous';
        $absence->position = $employee->position ?? 'Regular Hired Workers';
        $absence->save();
      });
  }
}
