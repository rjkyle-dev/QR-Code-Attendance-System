<?php

namespace Database\Seeders;

use App\Models\EvaluationConfiguration;
use App\Models\Employee;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EvaluationConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all unique departments from employees
        $departments = Employee::distinct()->pluck('department')->filter()->toArray();
        
        // Define default evaluation frequencies for common departments
        $defaultFrequencies = [
            // Generic departments
            'Production' => 'semi_annual',
            'Quality Control' => 'semi_annual',
            'Maintenance' => 'semi_annual',
            'Administration' => 'annual',
            'Human Resources' => 'annual',
            'Finance' => 'annual',
            'IT' => 'semi_annual',
            'Sales' => 'semi_annual',
            'Marketing' => 'semi_annual',
            'Research & Development' => 'semi_annual',
            
            // Your specific departments (without "Department" suffix)
            'Harvest' => 'annual',
            'Monthly' => 'semi_annual',
            'Engineering' => 'semi_annual',
            'PDC' => 'semi_annual',
            'Coop Area' => 'annual',
            'Packing' => 'annual',
        ];
        
        foreach ($departments as $department) {
            // Use default frequency if available, otherwise random
            $frequency = $defaultFrequencies[$department] ?? 
                        (rand(1, 10) <= 7 ? 'semi_annual' : 'annual');
            
            EvaluationConfiguration::updateOrCreate(
                ['department' => $department],
                ['evaluation_frequency' => $frequency]
            );
        }
        
        $this->command->info('Evaluation configurations seeded successfully!');
        $this->command->info('Departments configured: ' . count($departments));
    }
} 