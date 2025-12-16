<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Accounting',
                'description' => 'Accounting department',
            ],
            [
                'name' => 'Finance',
                'description' => 'Finance department',
            ],
            [
                'name' => 'Audit',
                'description' => 'Audit department',
            ],
            [
                'name' => 'Human Resources',
                'description' => 'Human Resources department',
            ],
            [
                'name' => 'Para Legal',
                'description' => 'Para Legal department',
            ],
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate(
                ['name' => $department['name']],
                $department
            );
        }
    }
}
