<?php

namespace App\Console\Commands;

use App\Models\Employee;
use Illuminate\Console\Command;

class GenerateEmployeePins extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'employees:generate-pins';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate PINs for all existing employees';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating PINs for existing employees...');

        $employees = Employee::whereNull('pin')->orWhere('pin', '')->get();

        if ($employees->isEmpty()) {
            $this->info('All employees already have PINs generated.');
            return 0;
        }

        $bar = $this->output->createProgressBar($employees->count());
        $bar->start();

        foreach ($employees as $employee) {
            $employee->pin = $employee->generatePin();
            $employee->save();
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Successfully generated PINs for ' . $employees->count() . ' employees.');

        return 0;
    }
}
