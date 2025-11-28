<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstname = fake()->firstName();
        $lastname = fake()->lastName();
        $middlename = fake()->optional(0.3)->firstName(); // 30% chance of having middle name

        return [
            'firstname' => $firstname,
            'middlename' => $middlename,
            'lastname' => $lastname,
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'), // Default password
            'remember_token' => Str::random(10),
            'department' => fake()->randomElement([
                'Management & Staff(Admin)',
                'Packing Plant',
                'Harvesting',
                'Pest & Decease',
                'Miscellaneous',
                'Coop Area',
                'Security Forces',
                'Engineering',
                'Utility'
            ]),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create a user with specific role
     */
    public function withRole(string $roleName): static
    {
        return $this->afterCreating(function (User $user) use ($roleName) {
            $user->assignRole($roleName);
        });
    }

    /**
     * Create an admin user
     */
    public function admin(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'firstname' => 'Super',
                'lastname' => 'Admin',
                'email' => 'superadmin@example.com',
                'department' => 'Management & Staff(Admin)',
            ];
        })->withRole('Super Admin');
    }

    /**
     * Create a regular user
     */
    public function regular(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'firstname' => 'Regular',
                'lastname' => 'User',
                'email' => 'user@example.com',
                'department' => fake()->randomElement([
                    'Packing Plant',
                    'Harvesting',
                    'Pest & Decease',
                    'Miscellaneous',
                    'Coop Area',
                    'Security Forces',
                    'Engineering',
                    'Utility'
                ]),
            ];
        })->withRole('Employee');
    }
}
