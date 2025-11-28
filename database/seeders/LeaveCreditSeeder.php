<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\LeaveCredit;
use App\Models\Employee;
use Carbon\Carbon;

class LeaveCreditSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $employees = Employee::all();
    $currentYear = Carbon::now()->year;

    foreach ($employees as $employee) {
      // Create leave credits for current year
      LeaveCredit::firstOrCreate(
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

      // Create leave credits for previous year if employee was created before this year
      if ($employee->created_at->year < $currentYear) {
        LeaveCredit::firstOrCreate(
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

    $this->command->info('Leave credits seeded successfully for ' . $employees->count() . ' employees.');
  }
}
