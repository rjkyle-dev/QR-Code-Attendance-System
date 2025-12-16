/**
 * Default Payroll Settings Configuration
 * These are the initial default values for payroll settings
 */

export interface PayrollSettingDefault {
    key: string;
    name: string;
    description: string | null;
    type: 'decimal' | 'integer' | 'string' | 'time' | 'boolean';
    value: string | number;
    default_value: string | number;
    category: 'government_deductions' | 'work_schedule' | 'calculations';
}

export const PAYROLL_SETTINGS_DEFAULTS: PayrollSettingDefault[] = [
    // Government Deductions - SSS
    {
        key: 'sss_rate',
        name: 'SSS Rate',
        description: 'SSS contribution rate (e.g., 0.11 for 11%)',
        type: 'decimal',
        value: 0.11,
        default_value: 0.11,
        category: 'government_deductions',
    },
    {
        key: 'sss_max_contribution',
        name: 'SSS Maximum Contribution',
        description: 'Maximum SSS contribution amount',
        type: 'decimal',
        value: 2475,
        default_value: 2475,
        category: 'government_deductions',
    },
    {
        key: 'sss_low_threshold',
        name: 'SSS Low Threshold',
        description: 'Gross pay threshold for low SSS rate',
        type: 'decimal',
        value: 1000,
        default_value: 1000,
        category: 'government_deductions',
    },
    {
        key: 'sss_high_threshold',
        name: 'SSS High Threshold',
        description: 'Gross pay threshold for high SSS rate',
        type: 'decimal',
        value: 30000,
        default_value: 30000,
        category: 'government_deductions',
    },

    // Government Deductions - Pag-IBIG
    {
        key: 'pag_ibig_low_rate',
        name: 'Pag-IBIG Low Rate',
        description: 'Pag-IBIG rate for gross pay <= 1500 (e.g., 0.01 for 1%)',
        type: 'decimal',
        value: 0.01,
        default_value: 0.01,
        category: 'government_deductions',
    },
    {
        key: 'pag_ibig_high_rate',
        name: 'Pag-IBIG High Rate',
        description: 'Pag-IBIG high rate for gross pay > 1500 (e.g., 0.02 for 2%)',
        type: 'decimal',
        value: 0.02,
        default_value: 0.02,
        category: 'government_deductions',
    },
    {
        key: 'pag_ibig_threshold',
        name: 'Pag-IBIG Threshold',
        description: 'Gross pay threshold for Pag-IBIG rate change',
        type: 'decimal',
        value: 1500,
        default_value: 1500,
        category: 'government_deductions',
    },

    // Government Deductions - PhilHealth
    {
        key: 'philhealth_low_amount',
        name: 'PhilHealth Low Amount',
        description: 'Fixed PhilHealth amount for gross pay <= 10000',
        type: 'decimal',
        value: 150,
        default_value: 150,
        category: 'government_deductions',
    },
    {
        key: 'philhealth_rate',
        name: 'PhilHealth Rate',
        description: 'PhilHealth rate for gross pay > 10000 (e.g., 0.03 for 3%)',
        type: 'decimal',
        value: 0.03,
        default_value: 0.03,
        category: 'government_deductions',
    },
    {
        key: 'philhealth_low_threshold',
        name: 'PhilHealth Low Threshold',
        description: 'Gross pay threshold for low PhilHealth amount',
        type: 'decimal',
        value: 10000,
        default_value: 10000,
        category: 'government_deductions',
    },
    {
        key: 'philhealth_high_threshold',
        name: 'PhilHealth High Threshold',
        description: 'Gross pay threshold for maximum PhilHealth',
        type: 'decimal',
        value: 70000,
        default_value: 70000,
        category: 'government_deductions',
    },
    {
        key: 'philhealth_max_contribution',
        name: 'PhilHealth Maximum Contribution',
        description: 'Maximum PhilHealth contribution amount',
        type: 'decimal',
        value: 2100,
        default_value: 2100,
        category: 'government_deductions',
    },

    // Work Schedule
    {
        key: 'standard_work_hours',
        name: 'Standard Work Hours',
        description: 'Standard work hours per day',
        type: 'decimal',
        value: 8,
        default_value: 8,
        category: 'work_schedule',
    },
    {
        key: 'standard_time_in',
        name: 'Standard Time In',
        description: 'Standard time in (HH:mm format)',
        type: 'time',
        value: '08:00',
        default_value: '08:00',
        category: 'work_schedule',
    },
    {
        key: 'work_days_per_month',
        name: 'Work Days Per Month',
        description: 'Average work days per month',
        type: 'decimal',
        value: 22,
        default_value: 22,
        category: 'work_schedule',
    },
    {
        key: 'days_per_cutoff',
        name: 'Days Per Cutoff',
        description: 'Days per payroll cutoff period',
        type: 'decimal',
        value: 15,
        default_value: 15,
        category: 'work_schedule',
    },

    // Night Shift
    {
        key: 'night_shift_start_hour',
        name: 'Night Shift Start Hour',
        description: 'Night shift start hour (24-hour format, e.g., 22 for 10 PM)',
        type: 'integer',
        value: 22,
        default_value: 22,
        category: 'work_schedule',
    },
    {
        key: 'night_shift_end_hour',
        name: 'Night Shift End Hour',
        description: 'Night shift end hour (24-hour format, e.g., 6 for 6 AM)',
        type: 'integer',
        value: 6,
        default_value: 6,
        category: 'work_schedule',
    },
];

/**
 * Get default setting by key
 */
export function getDefaultSetting(key: string): PayrollSettingDefault | undefined {
    return PAYROLL_SETTINGS_DEFAULTS.find((setting) => setting.key === key);
}

/**
 * Get all defaults by category
 */
export function getDefaultsByCategory(category: string): PayrollSettingDefault[] {
    return PAYROLL_SETTINGS_DEFAULTS.filter((setting) => setting.category === category);
}

