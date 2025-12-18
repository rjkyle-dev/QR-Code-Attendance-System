<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'type',
        'value',
        'default_value',
    ];

    /**
     * Get setting value cast to appropriate type
     */
    public function getValueAttribute($value)
    {
        if ($value === null) {
            return $this->default_value;
        }

        // Special handling for auto_generate_employee_id - always treat as boolean
        // even if type is incorrectly set to 'string'
        if ($this->key === 'auto_generate_employee_id') {
            $result = $this->convertToBoolean($value);
            \Log::info('SystemSetting::getValueAttribute - boolean conversion (forced)', [
                'key' => $this->key,
                'raw_value' => $value,
                'raw_type' => gettype($value),
                'setting_type' => $this->type,
                'converted_value' => $result,
                'converted_type' => gettype($result),
            ]);
            return $result;
        }

        $result = match($this->type) {
            'integer' => (int) $value,
            'boolean' => $this->convertToBoolean($value),
            default => $value,
        };

        // Debug logging for boolean values
        if ($this->type === 'boolean' && $this->key === 'auto_generate_employee_id') {
            \Log::info('SystemSetting::getValueAttribute - boolean conversion', [
                'key' => $this->key,
                'raw_value' => $value,
                'raw_type' => gettype($value),
                'converted_value' => $result,
                'converted_type' => gettype($result),
                'setting_type' => $this->type,
            ]);
        }

        return $result;
    }

    /**
     * Convert value to boolean explicitly
     */
    private function convertToBoolean($value): bool
    {
        // Handle string values explicitly
        if (is_string($value)) {
            $value = trim($value);
            // Explicitly check for '0', 'false', 'off', 'no', '' (empty string)
            if (in_array(strtolower($value), ['0', 'false', 'off', 'no', ''])) {
                return false;
            }
            // Check for '1', 'true', 'on', 'yes'
            if (in_array(strtolower($value), ['1', 'true', 'on', 'yes'])) {
                return true;
            }
        }
        
        // For other types, use standard boolean conversion
        return (bool) $value;
    }

    /**
     * Set setting value
     */
    public function setValueAttribute($value)
    {
        $this->attributes['value'] = $value === null ? null : (string) $value;
    }

    /**
     * Get setting by key
     */
    public static function getSetting(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }
        
        // Access the value through the model to trigger the accessor
        $value = $setting->value;
        
        // Debug logging for boolean settings
        if ($setting->type === 'boolean' && $key === 'auto_generate_employee_id') {
            \Log::info('SystemSetting::getSetting - boolean retrieval', [
                'key' => $key,
                'raw_value' => $setting->getAttributes()['value'] ?? 'not found',
                'processed_value' => $value,
                'value_type' => gettype($value),
                'setting_type' => $setting->type,
            ]);
        }
        
        return $value;
    }

    /**
     * Update setting by key (creates if doesn't exist)
     */
    public static function updateSetting(string $key, $value): bool
    {
        $setting = static::where('key', $key)->first();
        
        if ($setting) {
            // Fix the type if it's wrong (e.g., if it's 'string' but should be 'boolean')
            // This handles cases where the type was incorrectly set during initial creation
            if ($key === 'auto_generate_employee_id' && $setting->type !== 'boolean') {
                \Log::info('SystemSetting::updateSetting - fixing type', [
                    'key' => $key,
                    'old_type' => $setting->type,
                    'new_type' => 'boolean',
                ]);
                $setting->type = 'boolean';
            }
            
            \Log::info('SystemSetting::updateSetting - updating existing', [
                'key' => $key,
                'value' => $value,
                'value_type' => gettype($value),
                'setting_type' => $setting->type,
                'raw_value_before' => $setting->getAttributes()['value'] ?? 'not set',
            ]);
            
            // Directly set the raw value to avoid accessor issues
            $setting->setAttribute('value', $value);
            $setting->updated_at = now();
            
            $saved = $setting->save();
            
            // Verify what was actually saved by refreshing
            $setting->refresh();
            
            \Log::info('SystemSetting::updateSetting - after save', [
                'key' => $key,
                'saved' => $saved,
                'setting_type' => $setting->type,
                'raw_value_after' => $setting->getAttributes()['value'] ?? 'not set',
                'retrieved_value_via_accessor' => $setting->value,
                'retrieved_type' => gettype($setting->value),
            ]);
            
            return $saved;
        }
        
        // If setting doesn't exist, create it
        $type = is_bool($value) ? 'boolean' : (is_int($value) ? 'integer' : 'string');
        return static::create([
            'key' => $key,
            'name' => ucwords(str_replace('_', ' ', $key)),
            'type' => $type,
            'value' => $value,
            'default_value' => $value,
        ]) !== null;
    }
}

