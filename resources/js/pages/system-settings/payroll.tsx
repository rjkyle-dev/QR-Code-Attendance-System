import { AppSidebar } from '@/components/app-sidebar';
import { BackButton } from '@/components/back-button';
import { Main } from '@/components/customize/main';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BanknoteIcon, RefreshCw, Save } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { PAYROLL_SETTINGS_DEFAULTS, getDefaultSetting, type PayrollSettingDefault } from '@/hooks/payroll-settings-defaults';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'System Settings',
        href: '/system-settings',
    },
    {
        title: 'Payroll Settings',
        href: '/system-settings/payroll',
    },
];

interface PayrollSetting {
    id: number;
    key: string;
    name: string;
    description: string | null;
    type: string;
    value: string | number | null;
    default_value: string | number | null;
}

interface Props {
    settings?: {
        [category: string]: PayrollSetting[];
    };
}

export default function PayrollSettings({ settings = {} }: Props) {
    const [localSettings, setLocalSettings] = useState<{ [key: number]: string | number }>({});
    const [processingCategories, setProcessingCategories] = useState<{ [category: string]: boolean }>({});
    const [activeTab, setActiveTab] = useState<string>('');

    // Merge database settings with TypeScript defaults
    // TypeScript defaults take priority for name, description, and default_value
    const mergedSettings = useMemo(() => {
        const merged: { [category: string]: PayrollSetting[] } = {};
        
        Object.entries(settings).forEach(([category, categorySettings]) => {
            merged[category] = categorySettings.map((dbSetting) => {
                // Get TypeScript default for this setting
                const tsDefault = getDefaultSetting(dbSetting.key);
                
                return {
                    ...dbSetting,
                    // Always use TypeScript default for name (source of truth)
                    name: tsDefault?.name ?? dbSetting.name ?? '',
                    // Always use TypeScript default for description (source of truth)
                    description: tsDefault?.description ?? dbSetting.description ?? null,
                    // Always use TypeScript default for default_value (source of truth)
                    default_value: tsDefault?.default_value ?? dbSetting.default_value ?? null,
                };
            });
        });
        
        return merged;
    }, [settings]);

    // Initialize local settings from merged settings and set default tab
    useEffect(() => {
        const initialSettings: { [key: number]: string | number } = {};
        Object.values(mergedSettings).forEach((categorySettings) => {
            categorySettings.forEach((setting) => {
                initialSettings[setting.id] = setting.value ?? setting.default_value ?? '';
            });
        });
        setLocalSettings(initialSettings);

        // Set default active tab to first category
        const categories = Object.keys(mergedSettings);
        if (categories.length > 0 && !activeTab) {
            setActiveTab(categories[0]);
        }
    }, [mergedSettings]);

    const handleSettingChange = (id: number, value: string | number) => {
        setLocalSettings((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = (category: string, e: React.FormEvent) => {
        e.preventDefault();

        // Get settings for this category only (use merged settings)
        const categorySettings = mergedSettings[category] || [];
        const settingsArray = categorySettings.map((setting) => {
            const currentValue = localSettings[setting.id];
            const originalValue = setting.value ?? setting.default_value ?? null;
            
            // Convert current value to string, handling empty strings
            const valueToSave = currentValue === undefined 
                ? (originalValue !== null ? String(originalValue) : null)
                : (currentValue === '' ? null : String(currentValue));

            return {
                id: setting.id,
                value: valueToSave,
            };
        });

        // Check if there are any actual changes (value only)
        const hasChanges = settingsArray.some((s) => {
            const originalSetting = categorySettings.find(st => st.id === s.id);
            const originalValue = originalSetting?.value ?? originalSetting?.default_value ?? null;
            const newValue = s.value;
            return String(originalValue) !== String(newValue);
        });

        if (!hasChanges) {
            toast.info('No changes to save.');
            return;
        }

        setProcessingCategories((prev) => ({ ...prev, [category]: true }));

        router.post('/system-settings/payroll/update', { settings: settingsArray }, {
            onSuccess: () => {
                toast.success(`${getCategoryLabel(category)} settings updated successfully!`);
                setProcessingCategories((prev) => ({ ...prev, [category]: false }));
                // Reload the page to get updated data from server
                router.reload({ only: ['settings'] });
            },
            onError: (errors) => {
                toast.error('Failed to update settings. Please check your input.');
                console.error('Errors:', errors);
                setProcessingCategories((prev) => ({ ...prev, [category]: false }));
            },
        });
    };

    const handleReset = (id: number) => {
        const setting = Object.values(mergedSettings)
            .flat()
            .find((s) => s.id === id);
        if (setting) {
            // Use TypeScript defaults (which are already merged in)
            const defaultValue = setting.default_value ?? '';
            handleSettingChange(id, defaultValue);
            
            // Automatically save to database
            const valueToSave = defaultValue === '' ? null : String(defaultValue);
            router.post('/system-settings/payroll/update', {
                settings: [{
                    id: setting.id,
                    value: valueToSave,
                }]
            }, {
                onSuccess: () => {
                    toast.success(`${setting.name} reset to default value.`);
                    router.reload({ only: ['settings'] });
                },
                onError: (errors) => {
                    toast.error('Failed to reset setting.');
                    console.error('Errors:', errors);
                },
            });
        }
    };

    const handleResetCategory = (category: string) => {
        const categorySettings = mergedSettings[category] || [];
        const resetSettings: { [key: number]: string | number } = {};
        const settingsArray = categorySettings.map((setting) => {
            // Use merged settings which already include TypeScript defaults
            const defaultValue = setting.default_value ?? '';
            resetSettings[setting.id] = defaultValue;
            
            return {
                id: setting.id,
                value: defaultValue === '' ? null : String(defaultValue),
            };
        });
        
        setLocalSettings((prev) => ({ ...prev, ...resetSettings }));
        
        // Automatically save to database
        router.post('/system-settings/payroll/update', {
            settings: settingsArray
        }, {
            onSuccess: () => {
                toast.success(`${getCategoryLabel(category)} settings reset to default values.`);
                router.reload({ only: ['settings'] });
            },
            onError: (errors) => {
                toast.error('Failed to reset settings.');
                console.error('Errors:', errors);
            },
        });
    };

    const handleResetAll = () => {
        const resetSettings: { [key: number]: string | number } = {};
        const settingsArray: Array<{ id: number; value: string | null }> = [];
        
        Object.values(mergedSettings).forEach((categorySettings) => {
            categorySettings.forEach((setting) => {
                // Use merged settings which already include TypeScript defaults
                const defaultValue = setting.default_value ?? '';
                resetSettings[setting.id] = defaultValue;
                
                settingsArray.push({
                    id: setting.id,
                    value: defaultValue === '' ? null : String(defaultValue),
                });
            });
        });
        
        setLocalSettings(resetSettings);
        
        // Automatically save to database using update endpoint
        router.post('/system-settings/payroll/update', {
            settings: settingsArray
        }, {
            onSuccess: () => {
                toast.success('All settings reset to default values.');
                router.reload({ only: ['settings'] });
            },
            onError: (errors) => {
                toast.error('Failed to reset all settings.');
                console.error('Errors:', errors);
            },
        });
    };

    const getCategoryLabel = (category: string): string => {
        const categoryLabels: { [key: string]: string } = {
            government_deductions: 'Government Deductions',
            work_schedule: 'Work Schedule',
            calculations: 'Calculations',
        };
        return categoryLabels[category] || category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const renderSettingInput = (setting: PayrollSetting) => {
        const value = localSettings[setting.id] ?? setting.value ?? setting.default_value ?? '';

        switch (setting.type) {
            case 'decimal':
                return (
                    <Input
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => handleSettingChange(setting.id, parseFloat(e.target.value) || 0)}
                        className="w-full"
                    />
                );
            case 'integer':
                return (
                    <Input
                        type="number"
                        step="1"
                        value={value}
                        onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value) || 0)}
                        className="w-full"
                    />
                );
            case 'time':
                return (
                    <Input
                        type="time"
                        value={value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="w-full"
                    />
                );
            case 'boolean':
                const isChecked = String(value) === '1' || Number(value) === 1 || (typeof value === 'boolean' && value);
                return (
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleSettingChange(setting.id, e.target.checked ? 1 : 0)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-muted-foreground">
                            {isChecked ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                );
            default:
                return (
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="w-full"
                    />
                );
        }
    };

    const categories = Object.keys(mergedSettings);

    return (
        <SidebarProvider>
            <Head title="Payroll Settings" />
            <Toaster position="top-right" richColors />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div className="flex items-center gap-4">
                                <BackButton href="/system-settings" />
                                <div>
                                    <div className="ms-2 flex items-center">
                                        <BanknoteIcon className="size-11" />
                                        <div className="ms-2">
                                            <h2 className="flex text-2xl font-bold tracking-tight">Payroll Settings</h2>
                                            <p className="text-muted-foreground">Customize payroll calculation values and rates</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleResetAll}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reset All
                                </Button>
                            </div>
                        </div>
                        <div className="m-3 no-scrollbar">
                            <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                <CardHeader>
                                    <CardTitle>Payroll Configuration</CardTitle>
                                    <CardDescription>Manage payroll calculation settings by category</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
                                            {categories.map((category) => (
                                                <TabsTrigger key={category} value={category}>
                                                    {getCategoryLabel(category)}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>

                                        {categories.map((category) => {
                                            const categorySettings = mergedSettings[category] || [];
                                            const isProcessing = processingCategories[category] || false;

                                            return (
                                                <TabsContent key={category} value={category} className="mt-6">
                                                    <form onSubmit={(e) => handleSubmit(category, e)}>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div>
                                                                    <h3 className="text-lg font-semibold">{getCategoryLabel(category)}</h3>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Configure {getCategoryLabel(category).toLowerCase()} settings
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleResetCategory(category)}
                                                                        disabled={isProcessing}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <RefreshCw className="h-4 w-4" />
                                                                        Reset
                                                                    </Button>
                                                                    <Button
                                                                        type="submit"
                                                                        disabled={isProcessing}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <Save className="h-4 w-4" />
                                                                        {isProcessing ? 'Saving...' : 'Save Changes'}
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="grid gap-6 md:grid-cols-2">
                                                                {categorySettings.map((setting) => {
                                                                    return (
                                                                        <div key={setting.id} className="space-y-2">
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <Label className="text-sm font-medium">
                                                                                    {setting.name}
                                                                                </Label>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => handleReset(setting.id)}
                                                                                    className="h-6 px-2 text-xs"
                                                                                    title="Reset to default"
                                                                                >
                                                                                    Reset
                                                                                </Button>
                                                                            </div>
                                                                            {setting.description && (
                                                                                <p className="text-xs text-muted-foreground" contentEditable={false}>
                                                                                    {setting.description}
                                                                                </p>
                                                                            )}
                                                                            {renderSettingInput(setting)}
                                                                            {setting.default_value !== null && (
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    Default: {setting.default_value}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </form>
                                                </TabsContent>
                                            );
                                        })}
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}

function SidebarHoverLogic({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const { handleMouseEnter, handleMouseLeave } = useSidebarHover();
    return (
        <>
            <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <AppSidebar onMouseLeave={handleMouseLeave} />
            {children}
        </>
    );
}
