<?php

namespace App\Console\Commands;

use App\Models\Employee;
use Illuminate\Console\Command;

class TestRecognitionAwards extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'recognition:test';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Test the recognition awards system based on evaluation ratings';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $this->info('Recognition Awards System has been removed along with the evaluation system.');
    $this->warn('This command is no longer functional as evaluations have been removed from the system.');
    return 0;
  }
}
