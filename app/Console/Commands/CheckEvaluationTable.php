<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CheckEvaluationTable extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'evaluation:check-table';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Check the evaluations table structure';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $this->info('Checking evaluations table structure...');
    $this->newLine();

    if (!Schema::hasTable('evaluations')) {
      $this->error('Evaluations table does not exist!');
      return 1;
    }

    $this->info('✅ Evaluations table exists');
    $this->newLine();

    // Get table columns
    $columns = Schema::getColumnListing('evaluations');

    $this->info('Table columns:');
    foreach ($columns as $column) {
      $this->line("  - {$column}");
    }

    $this->newLine();

    // Check if required columns exist
    $requiredColumns = [
      'employee_id',
      'department',
      'evaluation_frequency',
      'evaluator',
      'observations',
      'total_rating',
      'evaluation_year',
      'evaluation_period',
      'rating_date',
    ];

    $this->info('Checking required columns:');
    foreach ($requiredColumns as $column) {
      if (in_array($column, $columns)) {
        $this->info("  ✅ {$column}");
      } else {
        $this->error("  ❌ {$column} - MISSING");
      }
    }

    $this->newLine();

    // Check current data
    $count = DB::table('evaluations')->count();
    $this->info("Current evaluations count: {$count}");

    if ($count > 0) {
      $sample = DB::table('evaluations')->first();
      $this->info('Sample evaluation data:');
      foreach ((array) $sample as $key => $value) {
        $this->line("  {$key}: {$value}");
      }
    }

    return 0;
  }
}
