import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Star } from 'lucide-react';
import {
    getAllWorkFunctions,
    getDefaultDepartmentSettings,
    getDepartmentSettings,
    getStructuredWorkFunctions,
    getWorkFunctionDescription,
    getWorkFunctionName,
    hasWorkFunctionDescription,
} from '../types/evaluation-settings';

interface WorkFunctionsSectionProps {
    selectedDepartment: string;
    evaluationData: {
        workFunctions: {
            [key: string]: {
                workQuality: number;
                workEfficiency: number;
            };
        };
    };
    setEvaluationData: (updater: any) => void;
    isFormReadOnly: boolean;
}

const StarRating = ({
    rating,
    onRatingChange,
    size = 'md',
    disabled = false,
}: {
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRatingChange(star)}
                    className={`transition-colors hover:scale-110 focus:outline-none ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                    disabled={disabled}
                >
                    <Star className={`${sizeClasses[size]} ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
            ))}
            <span className="ml-2 text-sm font-medium text-gray-600">{rating}/10</span>
        </div>
    );
};

export function WorkFunctionsSection({ selectedDepartment, evaluationData, setEvaluationData, isFormReadOnly }: WorkFunctionsSectionProps) {
    if (!selectedDepartment) return null;

    const departmentSettings = getDepartmentSettings(selectedDepartment) || getDefaultDepartmentSettings(selectedDepartment);
    const structuredWorkFunctions = getStructuredWorkFunctions(selectedDepartment);
    const allWorkFunctions = getAllWorkFunctions(selectedDepartment);

    return (
        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {departmentSettings.sectionNumber || 5}. {departmentSettings.title} - {departmentSettings.subtitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {/* Department Description */}
                <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-4">
                    <p className="text-sm text-teal-700">{departmentSettings.description}</p>
                </div>

                {structuredWorkFunctions ? (
                    // Render structured format with sections
                    <div className="space-y-8">
                        {structuredWorkFunctions.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="space-y-4">
                                <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">{section.title}</h3>
                                <div className="space-y-4">
                                    {section.items.map((workFunctionItem: any, index: number) => {
                                        const workFunctionName = getWorkFunctionName(workFunctionItem);
                                        const workFunctionDescription = getWorkFunctionDescription(workFunctionItem);
                                        const hasDescription = hasWorkFunctionDescription(workFunctionItem);

                                        return (
                                            <div key={index} className="rounded-lg border bg-gray-50 p-4">
                                                <h4 className="mb-2 font-medium text-gray-800">{workFunctionName}</h4>
                                                {hasDescription && <p className="mb-4 text-sm text-gray-600 italic">{workFunctionDescription}</p>}
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">Work Quality (1-10)</label>
                                                        <StarRating
                                                            rating={evaluationData.workFunctions[workFunctionName]?.workQuality || 0}
                                                            onRatingChange={(rating) =>
                                                                setEvaluationData((prev: any) => ({
                                                                    ...prev,
                                                                    workFunctions: {
                                                                        ...prev.workFunctions,
                                                                        [workFunctionName]: {
                                                                            ...prev.workFunctions[workFunctionName],
                                                                            workQuality: rating,
                                                                        },
                                                                    },
                                                                }))
                                                            }
                                                            disabled={isFormReadOnly}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">Work Efficiency (1-10)</label>
                                                        <StarRating
                                                            rating={evaluationData.workFunctions[workFunctionName]?.workEfficiency || 0}
                                                            onRatingChange={(rating) =>
                                                                setEvaluationData((prev: any) => {
                                                                    return {
                                                                        ...prev,
                                                                        workFunctions: {
                                                                            ...prev.workFunctions,
                                                                            [workFunctionName]: {
                                                                                ...prev.workFunctions[workFunctionName],
                                                                                workEfficiency: rating,
                                                                            },
                                                                        },
                                                                    };
                                                                })
                                                            }
                                                            disabled={isFormReadOnly}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Render simple array format
                    <div className="space-y-6">
                        {allWorkFunctions.map((workFunction: string, index: number) => (
                            <div key={index} className="rounded-lg border bg-gray-50 p-4">
                                <h4 className="mb-4 font-medium text-gray-800">{workFunction}</h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Work Quality (1-10)</label>
                                        <StarRating
                                            rating={evaluationData.workFunctions[workFunction]?.workQuality || 0}
                                            onRatingChange={(rating) =>
                                                setEvaluationData((prev: any) => ({
                                                    ...prev,
                                                    workFunctions: {
                                                        ...prev.workFunctions,
                                                        [workFunction]: {
                                                            ...prev.workFunctions[workFunction],
                                                            workQuality: rating,
                                                        },
                                                    },
                                                }))
                                            }
                                            disabled={isFormReadOnly}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Work Efficiency (1-10)</label>
                                        <StarRating
                                            rating={evaluationData.workFunctions[workFunction]?.workEfficiency || 0}
                                            onRatingChange={(rating) =>
                                                setEvaluationData((prev: any) => {
                                                    return {
                                                        ...prev,
                                                        workFunctions: {
                                                            ...prev.workFunctions,
                                                            [workFunction]: {
                                                                ...prev.workFunctions[workFunction],
                                                                workEfficiency: rating,
                                                            },
                                                        },
                                                    };
                                                })
                                            }
                                            disabled={isFormReadOnly}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
