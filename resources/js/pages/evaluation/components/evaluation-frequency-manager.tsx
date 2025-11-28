import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { Building2, Calendar, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DepartmentFrequency {
    department: string;
    evaluation_frequency: 'semi_annual' | 'annual';
    employee_count: number;
}

interface Props {
    isAdmin: boolean;
    frequencies: DepartmentFrequency[];
}

export function EvaluationFrequencyManager({ isAdmin, frequencies }: Props) {
    const [updating, setUpdating] = useState<string | null>(null);

    const updateFrequency = async (department: string, frequency: 'semi_annual' | 'annual') => {
        if (!isAdmin) {
            toast.error('Only administrators can update evaluation frequencies');
            return;
        }

        setUpdating(department);

        // Use Inertia router instead of axios
        router.put(
            `/evaluation/frequencies/${department}`,
            {
                evaluation_frequency: frequency,
            },
            {
                onSuccess: () => {
                    toast.success(`Updated ${department} to ${frequency} evaluations`);
                },
                onError: (errors) => {
                    console.error('Failed to update frequency:', errors);
                    toast.error('Failed to update evaluation frequency');
                },
                onFinish: () => {
                    setUpdating(null);
                },
            },
        );
    };

    const getFrequencyIcon = (frequency: string) => {
        return frequency === 'semi_annual' ? <Clock className="h-4 w-4" /> : <Calendar className="h-4 w-4" />;
    };

    const getFrequencyColor = (frequency: string) => {
        return frequency === 'semi_annual' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200';
    };

    const getFrequencyDescription = (frequency: string) => {
        return frequency === 'semi_annual' ? 'Evaluations every 6 months (Jan-Jun, Jul-Dec)' : 'Evaluation once per year (Jan-Dec)';
    };

    if (!isAdmin) {
        return (
            <Alert>
                <AlertDescription>
                    Only administrators can manage evaluation frequencies. Contact your system administrator to make changes.
                </AlertDescription>
            </Alert>
        );
    }

    if (!frequencies || frequencies.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">No evaluation frequencies found</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Evaluation Frequency Management</h3>
                    <p className="text-sm text-gray-600">Configure how often each department conducts employee evaluations</p>
                </div>
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                    Super Admin
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {frequencies.map((freq) => (
                    <Card key={freq.department} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    <CardTitle className="text-base">{freq.department}</CardTitle>
                                </div>
                                <Badge className={getFrequencyColor(freq.evaluation_frequency)}>
                                    {getFrequencyIcon(freq.evaluation_frequency)}
                                    <span className="ml-1">{freq.evaluation_frequency === 'semi_annual' ? 'Semi-Annual' : 'Annual'}</span>
                                </Badge>
                            </div>
                            <CardDescription className="text-sm">{getFrequencyDescription(freq.evaluation_frequency)}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span>{freq.employee_count} employees</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Evaluation Frequency:</label>
                                <Select
                                    value={freq.evaluation_frequency}
                                    onValueChange={(value: 'semi_annual' | 'annual') => updateFrequency(freq.department, value)}
                                    disabled={updating === freq.department}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="semi_annual">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Semi-Annual (Every 6 months)
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="annual">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Annual (Once per year)
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {updating === freq.department && <div className="mt-2 text-xs text-blue-600">Updating...</div>}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
