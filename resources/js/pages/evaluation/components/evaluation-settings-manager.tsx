import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Edit, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { evaluationSettings, getDefaultDepartmentSettings, type DepartmentEvaluationSettings } from '../types/evaluation-settings';

interface EvaluationSettingsManagerProps {
    isAdmin: boolean;
}

export function EvaluationSettingsManager({ isAdmin }: EvaluationSettingsManagerProps) {
    const [settings, setSettings] = useState<Record<string, DepartmentEvaluationSettings>>(evaluationSettings);
    const [editingDepartment, setEditingDepartment] = useState<string | null>(null);
    const [editingSettings, setEditingSettings] = useState<DepartmentEvaluationSettings | null>(null);

    if (!isAdmin) {
        return (
            <Alert>
                <AlertDescription>
                    Only administrators can manage evaluation settings. Contact your system administrator to make changes.
                </AlertDescription>
            </Alert>
        );
    }

    const handleEdit = (department: string) => {
        const deptSettings = settings[department] || getDefaultDepartmentSettings(department);
        setEditingDepartment(department);
        setEditingSettings({ ...deptSettings });
    };

    const handleSave = (department: string) => {
        if (!editingSettings) return;

        setSettings((prev) => ({
            ...prev,
            [department]: editingSettings,
        }));

        setEditingDepartment(null);
        setEditingSettings(null);
        toast.success(`Settings updated for ${department}`);
    };

    const handleCancel = () => {
        setEditingDepartment(null);
        setEditingSettings(null);
    };

    const handleAddWorkFunction = (department: string) => {
        if (!editingSettings) return;

        setEditingSettings((prev) =>
            prev
                ? {
                      ...prev,
                      workFunctions: [...prev.workFunctions, 'New Work Function'],
                  }
                : null,
        );
    };

    const handleRemoveWorkFunction = (department: string, index: number) => {
        if (!editingSettings) return;

        setEditingSettings((prev) =>
            prev
                ? {
                      ...prev,
                      workFunctions: prev.workFunctions.filter((_, i) => i !== index),
                  }
                : null,
        );
    };

    const handleUpdateWorkFunction = (department: string, index: number, value: string) => {
        if (!editingSettings) return;

        setEditingSettings((prev) =>
            prev
                ? {
                      ...prev,
                      workFunctions: prev.workFunctions.map((func, i) => (i === index ? value : func)),
                  }
                : null,
        );
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'operations':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'functions':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'maintenance':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'specialized':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Evaluation Settings Management</h3>
                    <p className="text-sm text-gray-600">Customize department-specific evaluation criteria and titles</p>
                </div>
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                    Super Admin
                </Badge>
            </div>

            <Tabs defaultValue="departments" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="departments">Department Settings</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>

                <TabsContent value="departments" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {Object.entries(settings).map(([department, deptSettings]) => (
                            <Card key={department} className="border-l-4 border-l-blue-500">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-blue-600" />
                                            <CardTitle className="text-base">{department}</CardTitle>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge className={getCategoryColor(deptSettings.category)}>{deptSettings.category}</Badge>
                                            {editingDepartment === department ? (
                                                <div className="flex gap-1">
                                                    <Button size="sm" onClick={() => handleSave(department)} className="h-6 px-2">
                                                        <Save className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 px-2">
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(department)} className="h-6 px-2">
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {editingDepartment === department && editingSettings ? (
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Section Title</Label>
                                                <Input
                                                    value={editingSettings.title}
                                                    onChange={(e) => setEditingSettings((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                                                    placeholder="e.g., Work Functions, Work Operations"
                                                />
                                            </div>
                                            <div>
                                                <Label>Subtitle</Label>
                                                <Input
                                                    value={editingSettings.subtitle}
                                                    onChange={(e) =>
                                                        setEditingSettings((prev) => (prev ? { ...prev, subtitle: e.target.value } : null))
                                                    }
                                                    placeholder="e.g., Monthly Department"
                                                />
                                            </div>
                                            <div>
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={editingSettings.description}
                                                    onChange={(e) =>
                                                        setEditingSettings((prev) => (prev ? { ...prev, description: e.target.value } : null))
                                                    }
                                                    placeholder="Description of what this section evaluates"
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <Label>Category</Label>
                                                <Select
                                                    value={editingSettings.category}
                                                    onValueChange={(value: DepartmentEvaluationSettings['category']) =>
                                                        setEditingSettings((prev) => (prev ? { ...prev, category: value } : null))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="operations">Operations</SelectItem>
                                                        <SelectItem value="functions">Functions</SelectItem>
                                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                                        <SelectItem value="specialized">Specialized</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <Label>Work Functions</Label>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleAddWorkFunction(department)}
                                                        className="h-6 px-2"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {editingSettings.workFunctions.map((func, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <Input
                                                                value={func}
                                                                onChange={(e) => handleUpdateWorkFunction(department, index, e.target.value)}
                                                                placeholder="Work function description"
                                                            />
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRemoveWorkFunction(department, index)}
                                                                className="h-6 px-2 text-red-600"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Title:</span>
                                                <div className="text-sm text-gray-800">{deptSettings.title}</div>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Subtitle:</span>
                                                <div className="text-sm text-gray-800">{deptSettings.subtitle}</div>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Description:</span>
                                                <div className="text-sm text-gray-800">{deptSettings.description}</div>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Work Functions:</span>
                                                <div className="mt-1 space-y-1">
                                                    {deptSettings.workFunctions.map((func, index) => (
                                                        <div key={index} className="text-xs text-gray-600">
                                                            • {func}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="categories" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Information</CardTitle>
                            <CardDescription>Understanding the different evaluation categories</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <h4 className="font-semibold text-blue-800">Operations</h4>
                                    <p className="text-sm text-blue-700">Production, harvesting, packaging, and field operations</p>
                                </div>
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <h4 className="font-semibold text-green-800">Functions</h4>
                                    <p className="text-sm text-green-700">Administrative, clerical, and procedural tasks</p>
                                </div>
                                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                                    <h4 className="font-semibold text-orange-800">Maintenance</h4>
                                    <p className="text-sm text-orange-700">Equipment repair, maintenance, and technical support</p>
                                </div>
                                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                                    <h4 className="font-semibold text-purple-800">Specialized</h4>
                                    <p className="text-sm text-purple-700">Unique or specialized department functions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
