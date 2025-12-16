<?php

namespace App\Http\Controllers;

use App\Models\PayrollSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PayrollSettingsController extends Controller
{
    /**
     * Display the payroll settings page
     */
    public function index(): Response
    {
        // Auto-seed settings if they don't exist
        if (PayrollSetting::count() === 0) {
            $this->seedPayrollSettings();
        }

        $settings = PayrollSetting::orderBy('category')
            ->orderBy('name')
            ->get()
            ->groupBy('category');

        $groupedSettings = [];
        foreach ($settings as $category => $items) {
            $groupedSettings[$category] = $items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'key' => $item->key,
                    'name' => $item->name,
                    'description' => $item->description,
                    'type' => $item->type,
                    'value' => $item->value,
                    'default_value' => $item->default_value,
                ];
            });
        }

        return Inertia::render('system-settings/payroll', [
            'settings' => $groupedSettings,
        ]);
    }

    /**
     * Update payroll settings
     */
    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.id' => 'required|exists:payroll_settings,id',
            'settings.*.value' => 'nullable',
            'settings.*.name' => 'nullable|string|max:255',
        ]);

        $updatedCount = 0;
        foreach ($request->settings as $settingData) {
            $value = $settingData['value'] ?? null;
            // Convert empty string to null
            if ($value === '') {
                $value = null;
            }
            
            $name = $settingData['name'] ?? null;
            
            $updateData = ['updated_at' => now()];
            if (isset($settingData['value'])) {
                $updateData['value'] = $value;
            }
            if (isset($settingData['name']) && $name !== null) {
                $updateData['name'] = $name;
            }
            
            $updated = PayrollSetting::where('id', $settingData['id'])
                ->update($updateData);
            
            if ($updated) {
                $updatedCount++;
            }
        }

        if ($updatedCount === 0) {
            return redirect()->back()->withErrors(['error' => 'No settings were updated.']);
        }

        return redirect()->back()->with('success', "Successfully updated {$updatedCount} setting(s).");
    }

    /**
     * Reset setting to default value
     */
    public function reset(Request $request, $id)
    {
        $setting = PayrollSetting::findOrFail($id);
        $setting->value = $setting->default_value;
        $setting->save();

        return redirect()->back()->with('success', 'Setting reset to default value.');
    }

    /**
     * Reset all settings to defaults
     */
    public function resetAll()
    {
        PayrollSetting::query()->update([
            'value' => DB::raw('default_value'),
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'All settings reset to default values.');
    }

    /**
     * Seed payroll settings if they don't exist
     */
    private function seedPayrollSettings(): void
    {
        // Default settings - matching resources/js/hooks/payroll-settings-defaults.ts
        $defaultSettings = [
            // Government Deductions - SSS
            [
                'key' => 'sss_rate',
                'name' => 'SSS Rate',
                'description' => 'SSS contribution rate (e.g., 0.11 for 11%)',
                'type' => 'decimal',
                'value' => '0.11',
                'default_value' => '0.11',
                'category' => 'government_deductions',
            ],
            [
                'key' => 'sss_max_contribution',
                'name' => 'SSS Maximum Contribution',
                'description' => 'Maximum SSS contribution amount',
                'type' => 'decimal',
                'value' => '2475',
                'default_value' => '2475',
                'category' => 'government_deductions',
            ],
            [
                'key' => 'sss_low_threshold',
                'name' => 'SSS Low Threshold',
                'description' => 'Gross pay threshold for low SSS rate',
                'type' => 'decimal',
                'value' => '1000',
                'default_value' => '1000',
                'category' => 'government_deductions',
            ],
            [
                'key' => 'sss_high_threshold',
                'name' => 'SSS High Threshold',
                'description' => 'Gross pay threshold for high SSS rate',
                'type' => 'decimal',
                'value' => '30000',
                'default_value' => '30000',
                'category' => 'government_deductions',
            ],

            // Government Deductions - Pag-IBIG
            [
                'key' => 'pag_ibig_low_rate',
                'name' => 'Pag-IBIG Low Rate',
                'description' => 'Pag-IBIG rate for gross pay <= 1500 (e.g., 0.01 for 1%)',
                'type' => 'decimal',
                'value' => '0.01',
                'default_value' => '0.01',
                'category' => 'government_deductions',
            ],
            [
                'key' => 'pag_ibig_high_rate',
                'name' => 'Pag-IBIG High Rate',
                'description' => 'Pag-IBIG rate for gross pay > 1500 (e.g., 0.02 for 2%)',
                'type' => 'decimal',
                'value' => '0.02',
                'default_value' => '0.02',
                'category' => 'government_deductions',
            ],
            [
                'key' => 'pag_ibig_threshold',
                'name' => 'Pag-IBIG Threshold',
                'description' => 'Gross pay threshold for Pag-IBIG rate change',
                'type' => 'decimal',
                'value' => '1500',
                'default_value' => '1500',
                'category' => 'government_deductions',
            ],

            // Government Deductions - PhilHealth
            [
                'key' => 'philhealth_low_amount',
                'name' => 'PhilHealth Low Amount',
                'description' => 'Fixed PhilHealth amount for gross pay <= 10000',
                'type' => 'decimal',
                'value' => '150',
                'default_value' => '150',
                'category' => 'government_deductions',
            ],
            [
                'key' => 'philhealth_rate',
                'name' => 'PhilHealth Rate',
                'description' => 'PhilHealth rate for gross pay > 10000 (e.g., 0.03 for 3%)',
                'type' => 'decimal',
                'value' => '0.03',
                'default_value' => '0.03',
                'category' => 'government_deductions',
            ],
            [
                'key' => 'philhealth_low_threshold',
                'name' => 'PhilHealth Low Threshold',
                'description' => 'Gross pay threshold for low PhilHealth amount',
                'type' => 'decimal',
                'value' => '10000',
                'default_value' => '10000',
                'category' => 'government_deductions',
            ],
            [
                'key' => 'philhealth_high_threshold',
                'name' => 'PhilHealth High Threshold',
                'description' => 'Gross pay threshold for maximum PhilHealth',
                'type' => 'decimal',
                'value' => '70000',
                'default_value' => '70000',
                'category' => 'government_deductions',
            ],
            [
                'key' => 'philhealth_max_contribution',
                'name' => 'PhilHealth Maximum Contribution',
                'description' => 'Maximum PhilHealth contribution amount',
                'type' => 'decimal',
                'value' => '2100',
                'default_value' => '2100',
                'category' => 'government_deductions',
            ],

            // Work Schedule
            [
                'key' => 'standard_work_hours',
                'name' => 'Standard Work Hours',
                'description' => 'Standard work hours per day',
                'type' => 'decimal',
                'value' => '8',
                'default_value' => '8',
                'category' => 'work_schedule',
            ],
            [
                'key' => 'standard_time_in',
                'name' => 'Standard Time In',
                'description' => 'Standard time in (HH:mm format)',
                'type' => 'time',
                'value' => '08:00',
                'default_value' => '08:00',
                'category' => 'work_schedule',
            ],
            [
                'key' => 'work_days_per_month',
                'name' => 'Work Days Per Month',
                'description' => 'Average work days per month',
                'type' => 'decimal',
                'value' => '22',
                'default_value' => '22',
                'category' => 'work_schedule',
            ],
            [
                'key' => 'days_per_cutoff',
                'name' => 'Days Per Cutoff',
                'description' => 'Days per payroll cutoff period',
                'type' => 'decimal',
                'value' => '15',
                'default_value' => '15',
                'category' => 'work_schedule',
            ],

            // Night Shift
            [
                'key' => 'night_shift_start_hour',
                'name' => 'Night Shift Start Hour',
                'description' => 'Night shift start hour (24-hour format, e.g., 22 for 10 PM)',
                'type' => 'integer',
                'value' => '22',
                'default_value' => '22',
                'category' => 'work_schedule',
            ],
            [
                'key' => 'night_shift_end_hour',
                'name' => 'Night Shift End Hour',
                'description' => 'Night shift end hour (24-hour format, e.g., 6 for 6 AM)',
                'type' => 'integer',
                'value' => '6',
                'default_value' => '6',
                'category' => 'work_schedule',
            ],
        ];

        foreach ($defaultSettings as $setting) {
            PayrollSetting::create(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
