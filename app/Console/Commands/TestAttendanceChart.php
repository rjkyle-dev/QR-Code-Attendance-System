<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;

class TestAttendanceChart extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'test:attendance-chart';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Test the attendance data for the area chart';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $this->info('=== Testing Attendance Chart Data ===');
    $this->newLine();

    // Check total records
    $totalRecords = Attendance::count();
    $this->info("Total attendance records: {$totalRecords}");

    if ($totalRecords === 0) {
      $this->error('No attendance records found! Run: php artisan seed:attendance');
      return 1;
    }

    // Check by status
    $presentCount = Attendance::where('attendance_status', 'Present')->count();
    $lateCount = Attendance::where('attendance_status', 'Late')->count();
    $absentCount = Attendance::where('attendance_status', 'Absent')->count();

    $this->info("Present: {$presentCount}");
    $this->info("Late: {$lateCount}");
    $this->info("Absent: {$absentCount}");
    $this->newLine();

    // Check date ranges
    $this->info('=== Data by Date Range ===');

    $last7Days = Attendance::where('attendance_date', '>=', Carbon::now()->subDays(7)->format('Y-m-d'))->count();
    $last30Days = Attendance::where('attendance_date', '>=', Carbon::now()->subDays(30)->format('Y-m-d'))->count();
    $last90Days = Attendance::where('attendance_date', '>=', Carbon::now()->subDays(90)->format('Y-m-d'))->count();

    $this->info("Last 7 days: {$last7Days} records");
    $this->info("Last 30 days: {$last30Days} records");
    $this->info("Last 90 days: {$last90Days} records");
    $this->newLine();

    // Show sample data for chart testing
    $this->info('=== Sample Data for Chart Testing ===');

    $sampleData = Attendance::select('attendance_date', 'attendance_status')
      ->where('attendance_date', '>=', Carbon::now()->subDays(7)->format('Y-m-d'))
      ->orderBy('attendance_date')
      ->limit(20)
      ->get()
      ->groupBy('attendance_date');

    foreach ($sampleData as $date => $records) {
      $present = $records->where('attendance_status', 'Present')->count();
      $late = $records->where('attendance_status', 'Late')->count();
      $absent = $records->where('attendance_status', 'Absent')->count();

      $this->line("{$date}: Present={$present}, Late={$late}, Absent={$absent}");
    }

    $this->newLine();
    $this->info('=== Chart Data Format ===');
    $this->info('The chart expects data in this format:');
    $this->info('{ date: "2024-01-15", present: 5, late: 2, absent: 1 }');

    // Show actual data format
    $chartData = $this->getChartData();
    $this->info('Sample chart data:');
    foreach (array_slice($chartData, 0, 5) as $data) {
      $this->line("  {$data['date']}: present={$data['present']}, late={$data['late']}, absent={$data['absent']}");
    }

    $this->newLine();
    $this->info('✅ Attendance chart data is ready for testing!');

    return 0;
  }

  /**
   * Get data in the format expected by the chart
   */
  private function getChartData()
  {
    $attendanceData = Attendance::select('attendance_date', 'attendance_status')
      ->where('attendance_date', '>=', Carbon::now()->subDays(30)->format('Y-m-d'))
      ->get();

    $groupedData = [];

    foreach ($attendanceData as $record) {
      // Convert Carbon object to string format
      $date = $record->attendance_date instanceof Carbon
        ? $record->attendance_date->format('Y-m-d')
        : (string) $record->attendance_date;

      if (!isset($groupedData[$date])) {
        $groupedData[$date] = ['present' => 0, 'late' => 0, 'absent' => 0];
      }

      $status = strtolower($record->attendance_status);
      if (in_array($status, ['present', 'late', 'absent'])) {
        $groupedData[$date][$status]++;
      }
    }

    // Convert to array format
    $chartData = [];
    foreach ($groupedData as $date => $counts) {
      $chartData[] = [
        'date' => $date,
        'present' => $counts['present'],
        'late' => $counts['late'],
        'absent' => $counts['absent']
      ];
    }

    return $chartData;
  }
}
