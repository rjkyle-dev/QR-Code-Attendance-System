<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class AttendanceFactory extends Factory
{
  protected $model = Attendance::class;

  public function definition()
  {
    $session = $this->faker->randomElement(['morning', 'afternoon', 'night']);

    return [
      'employee_id' => Employee::factory(),
      'time_in' => $this->generateTimeIn($session),
      'time_out' => $this->generateTimeOut($session),
      'break_time' => $this->generateBreakTime($session),
      'attendance_status' => $this->generateAttendanceStatus(),
      'actual_attendance_status' => null,
      'attendance_date' => $this->faker->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
      'session' => $session,
    ];
  }

  /**
   * Generate time in based on session with realistic patterns
   */
  private function generateTimeIn($session)
  {
    $times = [
      'morning' => [
        '06:00:00',
        '06:15:00',
        '06:30:00',
        '06:45:00',
        '07:00:00',
        '07:15:00',
        '07:30:00',
        '07:45:00',
        '08:00:00',
        '08:15:00',
        '08:30:00'
      ],
      'afternoon' => [
        '12:00:00',
        '12:15:00',
        '12:30:00',
        '12:45:00',
        '13:00:00',
        '13:15:00',
        '13:30:00',
        '13:45:00',
        '14:00:00',
        '14:15:00'
      ],
      'night' => [
        '18:00:00',
        '18:15:00',
        '18:30:00',
        '18:45:00',
        '19:00:00',
        '19:15:00',
        '19:30:00',
        '19:45:00',
        '20:00:00',
        '20:15:00'
      ]
    ];

    return $this->faker->randomElement($times[$session] ?? ['08:00:00']);
  }

  /**
   * Generate time out based on session
   */
  private function generateTimeOut($session)
  {
    $times = [
      'morning' => [
        '14:00:00',
        '14:15:00',
        '14:30:00',
        '14:45:00',
        '15:00:00',
        '15:15:00',
        '15:30:00',
        '15:45:00',
        '16:00:00'
      ],
      'afternoon' => [
        '18:00:00',
        '18:15:00',
        '18:30:00',
        '18:45:00',
        '19:00:00',
        '19:15:00',
        '19:30:00',
        '19:45:00',
        '20:00:00'
      ],
      'night' => [
        '06:00:00',
        '06:15:00',
        '06:30:00',
        '06:45:00',
        '07:00:00',
        '07:15:00',
        '07:30:00',
        '07:45:00',
        '08:00:00'
      ]
    ];

    return $this->faker->randomElement($times[$session] ?? ['17:00:00']);
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

    return $this->faker->randomElement($times[$session] ?? ['12:00:00']);
  }

  /**
   * Generate attendance status with realistic distribution
   * 70% Present, 20% Late, 10% Absent
   */
  private function generateAttendanceStatus()
  {
    $random = $this->faker->numberBetween(1, 100);

    if ($random <= 70) {
      return 'Present';
    } elseif ($random <= 90) {
      return 'Late';
    } else {
      return 'Absent';
    }
  }

  /**
   * Create attendance for a specific date range with realistic patterns
   */
  public function forDateRange($startDate, $endDate, $employeeIds = null)
  {
    if (!$employeeIds) {
      $employeeIds = Employee::pluck('id')->toArray();
    }

    $attendances = [];
    $currentDate = Carbon::parse($startDate);
    $endDate = Carbon::parse($endDate);

    while ($currentDate <= $endDate) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      if ($currentDate->dayOfWeek !== 0 && $currentDate->dayOfWeek !== 6) {
        foreach ($employeeIds as $employeeId) {
          $session = $this->faker->randomElement(['morning', 'afternoon', 'night']);

          $attendances[] = [
            'employee_id' => $employeeId,
            'time_in' => $this->generateTimeIn($session),
            'time_out' => $this->generateTimeOut($session),
            'break_time' => $this->generateBreakTime($session),
            'attendance_status' => $this->generateAttendanceStatus(),
            'attendance_date' => $currentDate->format('Y-m-d'),
            'session' => $session,
            'created_at' => $currentDate->toDateTimeString(),
            'updated_at' => $currentDate->toDateTimeString(),
          ];
        }
      }

      $currentDate->addDay();
    }

    return $attendances;
  }

  /**
   * Create attendance for a specific employee
   */
  public function forEmployee($employeeId)
  {
    return $this->state(function (array $attributes) use ($employeeId) {
      return [
        'employee_id' => $employeeId,
      ];
    });
  }

  /**
   * Create attendance for a specific date
   */
  public function forDate($date)
  {
    return $this->state(function (array $attributes) use ($date) {
      return [
        'attendance_date' => Carbon::parse($date)->format('Y-m-d'),
      ];
    });
  }

  /**
   * Create attendance for a specific session
   */
  public function forSession($session)
  {
    return $this->state(function (array $attributes) use ($session) {
      return [
        'session' => $session,
        'time_in' => $this->generateTimeIn($session),
        'time_out' => $this->generateTimeOut($session),
        'break_time' => $this->generateBreakTime($session),
      ];
    });
  }

  /**
   * Create attendance with specific status
   */
  public function withStatus($status)
  {
    return $this->state(function (array $attributes) use ($status) {
      return [
        'attendance_status' => $status,
      ];
    });
  }

  /**
   * Create morning shift attendance
   */
  public function morning()
  {
    return $this->forSession('morning');
  }

  /**
   * Create afternoon shift attendance
   */
  public function afternoon()
  {
    return $this->forSession('afternoon');
  }

  /**
   * Create night shift attendance
   */
  public function night()
  {
    return $this->forSession('night');
  }

  /**
   * Create present attendance
   */
  public function present()
  {
    return $this->withStatus('Present');
  }

  /**
   * Create late attendance
   */
  public function late()
  {
    return $this->withStatus('Late');
  }

  /**
   * Create absent attendance
   */
  public function absent()
  {
    return $this->withStatus('Absent');
  }
}
