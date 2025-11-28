<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
  public function run()
  {
    $targetCount = 200;
    $totalCreated = 0;

    // Get all employees (or create some if none exist)
    $employees = Employee::all();

    if ($employees->count() === 0) {
      $employees = Employee::factory()->count(20)->create();
    }

    // Generate exactly 200 attendance records
    $startDate = Carbon::parse('2025-11-01');
    $endDate = Carbon::now();

    while ($totalCreated < $targetCount) {
      // Pick a random employee
      $employee = $employees->random();

      // Pick a random date within the range
      $randomDays = rand(0, $startDate->diffInDays($endDate));
      $randomDate = $startDate->copy()->addDays($randomDays);

      // Skip weekends
      if ($randomDate->dayOfWeek === 0 || $randomDate->dayOfWeek === 6) {
        continue;
      }

      // Check if attendance already exists for this employee and date
      $existing = Attendance::where('employee_id', $employee->id)
        ->where('attendance_date', $randomDate->format('Y-m-d'))
        ->first();

      if (!$existing) {
        $session = $this->getRandomSession();
        Attendance::create([
          'employee_id' => $employee->id,
          'time_in' => $this->generateTimeIn($session),
          'time_out' => $this->generateTimeOut($session),
          'break_time' => $this->generateBreakTime($session),
          'attendance_status' => $this->generateAttendanceStatus(),
          'actual_attendance_status' => null,
          'attendance_date' => $randomDate->format('Y-m-d'),
          'session' => $session,
        ]);
        $totalCreated++;
      }

      // Safety check to prevent infinite loop
      if ($totalCreated >= $targetCount) {
        break;
      }
    }

    $this->output("\nTotal attendance records created: {$totalCreated}");
    $this->displayStatistics();
  }

  /**
   * Create employees for a specific department
   */
  private function createEmployeesForDepartment($department, $count, $positions)
  {
    $employees = Employee::where('department', $department)
      ->where('work_status', '!=', 'Add Crew')
      ->get();

    if ($employees->count() < $count) {
      $needed = $count - $employees->count();
      $this->output("Creating {$needed} employees for {$department}...");

      $newEmployees = collect();
      for ($i = 0; $i < $needed; $i++) {
        $newEmployees->push(Employee::factory()->create([
          'department' => $department,
          'position' => $positions[array_rand($positions)],
          'work_status' => collect(['Regular', 'Probationary'])->random(),
        ]));
      }
      $employees = $employees->merge($newEmployees);
    }

    return $employees->take($count);
  }

  /**
   * Create Add Crew employees
   */
  private function createAddCrewEmployees($count)
  {
    $employees = Employee::where('work_status', 'Add Crew')->get();

    if ($employees->count() < $count) {
      $needed = $count - $employees->count();
      $this->output("Creating {$needed} Add Crew employees...");

      $newEmployees = collect();
      for ($i = 0; $i < $needed; $i++) {
        // Generate Add Crew employee ID
        $employeeId = 'AC' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

        // Check if ID already exists
        while (Employee::where('employeeid', $employeeId)->exists()) {
          $employeeId = 'AC' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        }

        $faker = \Faker\Factory::create();
        $firstname = $faker->firstName;
        $middlename = $faker->firstName;
        $lastname = $faker->lastName;

        $newEmployees->push(Employee::factory()->create([
          'employeeid' => $employeeId,
          'firstname' => $firstname,
          'middlename' => $middlename,
          'lastname' => $lastname,
          'employee_name' => "{$firstname} {$middlename} {$lastname}",
          'work_status' => 'Add Crew',
          'department' => null, // Add Crew can have null department
          'position' => null, // Add Crew can have null position
        ]));
      }
      $employees = $employees->merge($newEmployees);
    }

    return $employees->take($count);
  }

  /**
   * Generate attendance data for a date range
   */
  private function generateAttendanceData($startDate, $endDate, $employeeIds)
  {
    $totalCreated = 0;
    $currentDate = $startDate->copy();

    while ($currentDate <= $endDate) {
      // Skip weekends
      if ($currentDate->dayOfWeek !== 0 && $currentDate->dayOfWeek !== 6) {
        foreach ($employeeIds as $employeeId) {
          // Check if attendance already exists
          $existingAttendance = Attendance::where('employee_id', $employeeId)
            ->where('attendance_date', $currentDate->format('Y-m-d'))
            ->first();

          if (!$existingAttendance) {
            $this->createAttendanceRecord($employeeId, $currentDate);
            $totalCreated++;
          }
        }
      }

      $currentDate->addDay();
    }

    return $totalCreated;
  }

  /**
   * Generate additional random attendance records
   */
  private function generateAdditionalRecords($employeeIds)
  {
    $additionalCreated = 0;

    for ($i = 0; $i < 200; $i++) {
      $employeeId = $employeeIds[array_rand($employeeIds)];
      $randomDate = Carbon::now()->subDays(rand(1, 10))->format('Y-m-d');

      // Check if attendance already exists
      $existingAttendance = Attendance::where('employee_id', $employeeId)
        ->where('attendance_date', $randomDate)
        ->first();

      if (!$existingAttendance) {
        Attendance::factory()->create([
          'employee_id' => $employeeId,
          'attendance_date' => $randomDate,
        ]);
        $additionalCreated++;
      }
    }

    return $additionalCreated;
  }

  /**
   * Create a single attendance record
   * DISABLED: This method no longer creates attendance records
   */
  private function createAttendanceRecord($employeeId, $date)
  {
    // Attendance record creation is disabled
    return;
  }

  /**
   * Get random session
   */
  private function getRandomSession()
  {
    $sessions = ['morning', 'afternoon', 'night'];
    return $sessions[array_rand($sessions)];
  }

  /**
   * Generate time in based on session
   */
  private function generateTimeIn($session)
  {
    $times = [
      'morning' => [

        '07:00:00',

        '08:00:00',

      ],
      'afternoon' => [

        '13:00:00',

        '14:00:00',

      ],
      'night' => [
        '18:00:00',

        '19:00:00',

      ]
    ];

    return $times[$session][array_rand($times[$session])];
  }

  /**
   * Generate time out based on session
   */
  private function generateTimeOut($session)
  {
    $times = [
      'morning' => [
        '14:00:00',


        '15:00:00',

      ],
      'afternoon' => [
        '18:00:00',

        '19:00:00',

      ],
      'night' => [

        '07:00:00',

        '08:00:00'
      ]
    ];

    return $times[$session][array_rand($times[$session])];
  }

  /**
   * Generate break time based on session
   */
  private function generateBreakTime($session)
  {
    $times = [
      'morning' => ['10:00:00', '10:15:00', '10:30:00'],
      'afternoon' => ['15:00:00', '15:15:00', '15:30:00'],
      'night' => ['22:00:00', '22:15:00', '22:30:00']
    ];

    return $times[$session][array_rand($times[$session])];
  }

  /**
   * Generate attendance status with realistic distribution
   * 70% Present, 20% Late, 10% Absent
   */
  private function generateAttendanceStatus()
  {
    $random = rand(1, 100);

    if ($random <= 70) {
      return 'Present';
    } elseif ($random <= 90) {
      return 'Late';
    } else {
      return 'Absent';
    }
  }

  /**
   * Display attendance statistics
   */
  private function displayStatistics()
  {
    $totalRecords = Attendance::count();
    $presentCount = Attendance::where('attendance_status', 'Present')->count();
    $lateCount = Attendance::where('attendance_status', 'Late')->count();
    $absentCount = Attendance::where('attendance_status', 'Absent')->count();

    $this->output("\n=== Attendance Statistics ===");
    $this->output("Total Records: {$totalRecords}");
    $this->output("Present: {$presentCount} (" . round(($presentCount / $totalRecords) * 100, 1) . "%)");
    $this->output("Late: {$lateCount} (" . round(($lateCount / $totalRecords) * 100, 1) . "%)");
    $this->output("Absent: {$absentCount} (" . round(($absentCount / $totalRecords) * 100, 1) . "%)");

    // Show data by date range
    $last7Days = Attendance::where('attendance_date', '>=', Carbon::now()->subDays(7)->format('Y-m-d'))->count();
    $last30Days = Attendance::where('attendance_date', '>=', Carbon::now()->subDays(30)->format('Y-m-d'))->count();
    $last90Days = Attendance::where('attendance_date', '>=', Carbon::now()->subDays(90)->format('Y-m-d'))->count();

    $this->output("\n=== Records by Date Range ===");
    $this->output("Last 7 days: {$last7Days}");
    $this->output("Last 30 days: {$last30Days}");
    $this->output("Last 90 days: {$last90Days}");

    // Show unique dates
    $uniqueDates = Attendance::distinct('attendance_date')->count('attendance_date');
    $this->output("Unique dates with data: {$uniqueDates}");

    // Show session distribution
    $morningCount = Attendance::where('session', 'morning')->count();
    $afternoonCount = Attendance::where('session', 'afternoon')->count();
    $nightCount = Attendance::where('session', 'night')->count();

    $this->output("\n=== Session Distribution ===");
    $this->output("Morning: {$morningCount} (" . round(($morningCount / $totalRecords) * 100, 1) . "%)");
    $this->output("Afternoon: {$afternoonCount} (" . round(($afternoonCount / $totalRecords) * 100, 1) . "%)");
    $this->output("Night: {$nightCount} (" . round(($nightCount / $totalRecords) * 100, 1) . "%)");
  }

  /**
   * Safe output method that works both in seeder and command contexts
   */
  private function output($message)
  {
    if (isset($this->command) && $this->command) {
      $this->command->info($message);
    } else {
      // Fallback for when called directly as seeder
      echo $message . "\n";
    }
  }
}
