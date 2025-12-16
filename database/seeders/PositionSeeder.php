<?php

namespace Database\Seeders;

use App\Models\Position;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            // Accounting positions
            ['name' => 'Accounting Supervisor', 'department' => 'Accounting', 'description' => 'Supervises accounting operations'],
            ['name' => 'Cashier', 'department' => 'Accounting', 'description' => 'Handles cash transactions'],
            
            // Finance positions
            ['name' => 'Finance Supervisor', 'department' => 'Finance', 'description' => 'Supervises finance operations'],
            ['name' => 'Finance Officer', 'department' => 'Finance', 'description' => 'Manages financial activities'],
            ['name' => 'Finance Assistant', 'department' => 'Finance', 'description' => 'Assists with finance tasks'],
            ['name' => 'Probationary', 'department' => 'Finance', 'description' => 'Probationary position'],
            
            // Human Resources positions
            ['name' => 'Human Resources Supervisor', 'department' => 'Human Resources', 'description' => 'Supervises HR operations'],
            ['name' => 'Human Resources Officer', 'department' => 'Human Resources', 'description' => 'Manages HR activities'],
            ['name' => 'Human Resources Assistant', 'department' => 'Human Resources', 'description' => 'Assists with HR tasks'],
            ['name' => 'Probationary', 'department' => 'Human Resources', 'description' => 'Probationary position'],
            
            // Audit positions
            ['name' => 'Audit Supervisor', 'department' => 'Audit', 'description' => 'Supervises audit operations'],
            ['name' => 'Audit Officer', 'department' => 'Audit', 'description' => 'Conducts audits'],
            ['name' => 'Audit Assistant', 'department' => 'Audit', 'description' => 'Assists with audit tasks'],
            
            // Para Legal positions
            ['name' => 'Legal Supervisor', 'department' => 'Para Legal', 'description' => 'Supervises legal operations'],
            ['name' => 'Legal Officer', 'department' => 'Para Legal', 'description' => 'Handles legal matters'],
            ['name' => 'Legal Assistant', 'department' => 'Para Legal', 'description' => 'Assists with legal tasks'],
        ];

        foreach ($positions as $position) {
            Position::firstOrCreate(
                [
                    'name' => $position['name'],
                    'department' => $position['department'],
                ],
                $position
            );
        }
    }
}
