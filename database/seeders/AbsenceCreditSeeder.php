<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AbsenceCredit;
use App\Models\Employee;
use Carbon\Carbon;

class AbsenceCreditSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $employees = Employee::all();
    $currentYear = Carbon::now()->year;

    foreach ($employees as $employee) {
      // Create absence credits for current year
      AbsenceCredit::firstOrCreate(
        [
          'employee_id' => $employee->id,
          'year' => $currentYear,
        ],
        [
          'total_credits' => 12,
          'used_credits' => 0,
          'remaining_credits' => 12,
          'is_active' => true,
        ]
      );

      // Create absence credits for previous year if employee was created before this year
      if ($employee->created_at->year < $currentYear) {
        AbsenceCredit::firstOrCreate(
          [
            'employee_id' => $employee->id,
            'year' => $currentYear - 1,
          ],
          [
            'total_credits' => 12,
            'used_credits' => 0,
            'remaining_credits' => 12,
            'is_active' => false, // Previous year is not active
          ]
        );
      }
    }

    $this->command->info('Absence credits seeded successfully for ' . $employees->count() . ' employees.');
  }
}
