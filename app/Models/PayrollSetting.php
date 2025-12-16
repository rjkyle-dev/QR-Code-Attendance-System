<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'type',
        'value',
        'default_value',
        'category',
    ];

    /**
     * Get setting value cast to appropriate type
     */
    public function getValueAttribute($value)
    {
        if ($value === null) {
            return $this->default_value;
        }

        return match($this->type) {
            'decimal' => (float) $value,
            'integer' => (int) $value,
            'boolean' => (bool) $value,
            default => $value,
        };
    }

    /**
     * Set setting value
     */
    public function setValueAttribute($value)
    {
        $this->attributes['value'] = $value === null ? null : (string) $value;
    }

    /**
     * Get all settings as key-value array
     */
    public static function getAllSettings(): array
    {
        return static::all()->pluck('value', 'key')->toArray();
    }

    /**
     * Get setting by key
     */
    public static function getSetting(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Update setting by key
     */
    public static function updateSetting(string $key, $value): bool
    {
        return static::where('key', $key)->update(['value' => $value, 'updated_at' => now()]);
    }
}
