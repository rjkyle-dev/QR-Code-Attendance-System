<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EvaluationConfiguration>
 */
class EvaluationConfigurationFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'department' => $this->faker->unique()->randomElement([
        'Production',
        'Quality Control',
        'Maintenance',
        'Administration',
        'Human Resources',
        'Finance',
        'IT',
        'Sales',
        'Marketing',
        'Research & Development'
      ]),
      'evaluation_frequency' => $this->faker->randomElement(['semi_annual', 'annual']),
    ];
  }
}
