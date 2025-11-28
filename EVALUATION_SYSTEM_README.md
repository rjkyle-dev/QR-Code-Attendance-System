# Evaluation System - Semi-Annual & Annual Implementation

## Overview

The evaluation system has been updated from quarterly evaluations to support both **semi-annual** (twice per year) and **annual** (once per year) evaluation frequencies.

## Key Changes

### 1. Database Structure

- **New Table**: `evaluation_configurations` - stores department evaluation frequency settings
- **Updated Table**: `evaluations` - replaced `quarter` field with `period` field
- **Period System**:
    - Period 1: January-June (months 1-6)
    - Period 2: July-December (months 7-12)

### 2. Models

- **EvaluationConfiguration**: Manages department evaluation frequencies
- **Evaluation**: Updated with period logic and helper methods

### 3. Controllers

- **EvaluationController**: Updated to use new period system
- **API EvaluationController**: Updated to include period information

### 4. Frontend

- **TypeScript Types**: Updated to include period and frequency fields
- **View Modal**: Enhanced to show period and frequency information

## How It Works

### Evaluation Frequencies

- **Semi-Annual**: Evaluations every 6 months (Jan-Jun, Jul-Dec)
- **Annual**: Evaluations once per year (Jan-Dec)

### Period Calculation

```php
// Period 1: January-June (months 1-6)
// Period 2: July-December (months 7-12)
public static function calculatePeriod(\Carbon\Carbon $date): int
{
    $month = $date->month;
    return $month <= 6 ? 1 : 2;
}
```

### Department Configuration

Each department can have its own evaluation frequency:

```php
// Example configurations
'Production' => 'semi_annual',      // Evaluated twice per year
'Administration' => 'annual',        // Evaluated once per year
```

## Usage

### 1. Set Department Evaluation Frequency

```php
// Create or update department configuration
EvaluationConfiguration::updateOrCreate(
    ['department' => 'Production'],
    ['evaluation_frequency' => 'semi_annual']
);
```

### 2. Check if Employee Can Be Evaluated

```php
// Check eligibility based on department frequency
$canEvaluate = Evaluation::canEvaluateEmployee($employeeId, $department);
```

### 3. Create Evaluation

```php
$evaluation = Evaluation::create([
    'employee_id' => $employeeId,
    'period' => Evaluation::calculatePeriod(now()),
    'year' => now()->year,
    // ... other fields
]);
```

## Testing

### Run Migrations

```bash
php artisan migrate
```

### Seed Data

```bash
php artisan db:seed --class=EvaluationConfigurationSeeder
php artisan db:seed --class=EvaluationSeeder
```

### Test System

```bash
php artisan evaluation:test
```

## Migration from Quarterly System

### What Happens to Existing Data

- Existing evaluations with `quarter` field will need to be migrated
- The `quarter` field is replaced with `period` field
- New evaluations use the period system

### Migration Strategy

1. Run the new migrations
2. Update existing evaluations to map quarters to periods:
    - Q1 (Jan-Mar) → Period 1 (Jan-Jun)
    - Q2 (Apr-Jun) → Period 1 (Jan-Jun)
    - Q3 (Jul-Sep) → Period 2 (Jul-Dec)
    - Q4 (Oct-Dec) → Period 2 (Jul-Dec)

## Benefits

1. **Flexibility**: Different departments can have different evaluation frequencies
2. **Clarity**: Clear period labels (Jan-Jun, Jul-Dec)
3. **Efficiency**: Reduces evaluation overhead for departments that don't need frequent evaluations
4. **Scalability**: Easy to add new evaluation frequencies in the future

## Future Enhancements

1. **Custom Periods**: Allow departments to define custom evaluation periods
2. **Notification System**: Alert managers when evaluations are due
3. **Reporting**: Enhanced reporting based on evaluation periods
4. **Bulk Operations**: Bulk evaluation creation for multiple employees

## Troubleshooting

### Common Issues

1. **Period Calculation**: Ensure month is between 1-12
2. **Department Configuration**: Verify department exists in evaluation_configurations table
3. **Duplicate Evaluations**: Check period and year constraints

### Debug Commands

```bash
# Check evaluation configurations
php artisan tinker
>>> App\Models\EvaluationConfiguration::all();

# Check current period
>>> App\Models\Evaluation::calculatePeriod(now());
```
