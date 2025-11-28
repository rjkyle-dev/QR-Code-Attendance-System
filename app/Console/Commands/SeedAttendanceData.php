<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\AttendanceSeeder;

class SeedAttendanceData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:attendance {--days=90 : Number of days to generate data for} {--employees=10 : Number of employees to create if none exist}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed the database with attendance data for testing the area chart';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Seeding attendance data...');
        
        // Check if we have employees
        $employeeCount = \App\Models\Employee::count();
        if ($employeeCount === 0) {
            $this->warn('No employees found. Creating test employees...');
            $employeeCount = $this->option('employees');
            \App\Models\Employee::factory()->count($employeeCount)->create();
            $this->info("Created {$employeeCount} test employees");
        } else {
            $this->info("Found {$employeeCount} existing employees");
        }

        // Run the attendance seeder
        $seeder = new AttendanceSeeder();
        $seeder->run();

        $this->info('Attendance data seeded successfully!');
        $this->info('');
        $this->info('You can now test the attendance area chart with real data.');
        $this->info('The chart will show Present (green), Late (yellow), and Absent (red) data.');
        
        return 0;
    }
} 