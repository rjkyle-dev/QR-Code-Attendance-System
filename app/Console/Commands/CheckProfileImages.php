<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CheckProfileImages extends Command
{
    protected $signature = 'check:profile-images';
    protected $description = 'Check users with profile images';

    public function handle()
    {
        $users = User::whereNotNull('profile_image')->get();
        
        $this->info("Found {$users->count()} users with profile images:");
        
        foreach ($users as $user) {
            $this->line("ID: {$user->id}, Name: {$user->firstname} {$user->lastname}, Image: {$user->profile_image}");
        }
        
        if ($users->count() === 0) {
            $this->warn("No users with profile images found. This might be why you're seeing default images.");
        }
        
        return 0;
    }
} 