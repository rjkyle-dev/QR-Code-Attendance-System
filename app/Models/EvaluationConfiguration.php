<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationConfiguration extends Model
{
  use HasFactory;

  protected $fillable = [
    'department',
    'evaluation_frequency',
  ];

  protected $casts = [
    'evaluation_frequency' => 'string',
  ];

  /**
   * Get the evaluation frequency for a specific department
   */
  public static function getFrequencyForDepartment(?string $department): string
  {
    // Return default if department is null or empty
    if (empty($department)) {
      return 'annual';
    }
    
    // Try exact match first
    $config = static::where('department', $department)->first();
    if ($config) {
      return $config->evaluation_frequency;
    }
    
    // Try case-insensitive match
    $config = static::whereRaw('LOWER(department) = ?', [strtolower(trim($department))])->first();
    if ($config) {
      return $config->evaluation_frequency;
    }
    
    // Try trimmed match
    $config = static::where('department', trim($department))->first();
    if ($config) {
      return $config->evaluation_frequency;
    }
    
    // Default to annual if no match found
    return 'annual';
  }

  /**
   * Check if a department uses semi-annual evaluations
   */
  public static function isSemiAnnual(string $department): bool
  {
    return static::getFrequencyForDepartment($department) === 'semi_annual';
  }

  /**
   * Check if a department uses annual evaluations
   */
  public static function isAnnual(string $department): bool
  {
    return static::getFrequencyForDepartment($department) === 'annual';
  }
}
