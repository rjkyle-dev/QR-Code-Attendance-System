import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, Building, Calendar, FileText, Star, User } from 'lucide-react';

interface Evaluation {
    id: number;
    employee_id: number;
    employee_name: string;
    employeeid: string;
    department: string;
    position: string;
    picture?: string;
    evaluation_year?: number;
    year?: number;
    evaluation_period?: number;
    evaluation_frequency?: string;
    rating_date: string;
    total_rating?: number;
    ratings?: string;

    // New evaluation format
    attendance?: {
        daysLate?: number;
        daysAbsent?: number;
        days_late?: number;
        days_absent?: number;
        rating: number;
        remarks?: string;
    };
    attitudes?: {
        supervisor_rating: number;
        supervisor_remarks?: string;
        coworker_rating: number;
        coworker_remarks?: string;
    };
    workAttitude?: {
        responsible: number;
        jobKnowledge?: number;
        job_knowledge?: number;
        cooperation: number;
        initiative: number;
        dependability: number;
        remarks?: string;
    };
    workFunctions?: Array<{
        function_name: string;
        work_quality: number;
        work_efficiency: number;
    }>;
    observations?: string;
    evaluator?: string;
}

interface EvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    evaluation: Evaluation;
    onSubmit?: () => void;
}

export default function ViewEvaluationModal({ isOpen, onClose, evaluation }: EvaluationModalProps) {
    if (!evaluation) return null;

    // Calculate rating info
    const getRatingInfo = (rating: number) => {
        if (rating >= 8) return { label: 'Very Satisfactory', color: 'text-green-600' };
        if (rating >= 5) return { label: 'Satisfactory', color: 'text-yellow-600' };
        return { label: 'Needs Improvement', color: 'text-red-600' };
    };

    const rating = evaluation.total_rating || parseFloat(evaluation.ratings || '0') || 0;
    const ratingInfo = getRatingInfo(rating);

    // Star Rating Component
    const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
        const sizeClasses = {
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
        };

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <Star key={star} className={`${sizeClasses[size]} ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-600">{rating}/10</span>
            </div>
        );
    };

    // Get evaluation period label
    const periodLabel = evaluation.evaluation_period === 1 ? 'Jan-Jun' : 'Jul-Dec';
    const evaluationFrequency = evaluation.evaluation_frequency || 'annual';

    // Always display the new evaluation format
    const isNewFormat = true;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[95vh] max-w-[900px] min-w-[800px] overflow-y-auto border-2 border-green-200 p-6 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-green-800">Employee Evaluation Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Top Card: Employee Profile and Contact Information */}
                    <Card className="border-2 border-green-200 bg-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {/* Left Column: Profile Icon and Name */}
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                                        {evaluation.picture ? (
                                            <img
                                                src={evaluation.picture}
                                                alt={evaluation.employee_name}
                                                className="h-20 w-20 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-12 w-12 text-green-600" />
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-green-800">{evaluation.employee_name}</h3>
                                        <div className="mt-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                            ID: {evaluation.employeeid}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Personal and Work Details */}
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    {/* Personal Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Department:</span>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {evaluation.department}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Position:</span>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {evaluation.position}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Period:</span>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {periodLabel} {evaluation.evaluation_year || evaluation.year}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Work Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Frequency:</span>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {evaluationFrequency === 'semi_annual' ? 'Semi-Annual' : 'Annual'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Rating Date:</span>
                                            <span className="text-sm font-medium text-gray-800">
                                                {new Date(evaluation.rating_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Overall Rating:</span>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {rating}/10
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Middle Card: Employment Information */}
                    <Card className="border-2 border-green-200 bg-white shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Employment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    <div>
                                        <span className="text-sm text-gray-600">Evaluation Period:</span>
                                        <div className="font-semibold text-gray-800">
                                            {periodLabel} {evaluation.evaluation_year || evaluation.year}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Star className="h-5 w-5 text-green-600" />
                                    <div>
                                        <span className="text-sm text-gray-600">Employee Rating:</span>
                                        <div className="text-2xl font-bold text-green-600">{rating}/10</div>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Display */}
                            <div className="mt-6 text-center">
                                <div className="mb-2 text-sm text-gray-600">Overall Performance Rating</div>
                                <div className="text-4xl font-bold text-green-600">{rating}/10</div>
                                <div className={`mt-2 text-lg font-semibold ${ratingInfo.color}`}>{ratingInfo.label}</div>
                                <div className="mt-4 flex justify-center">
                                    <StarRating rating={rating} size="lg" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Department Evaluation */}
                    <Card className="border-2 border-green-200 bg-white shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Department Evaluation - {evaluation.department}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {/* 1. Attendance */}
                                {evaluation.attendance && (
                                    <Card className="border border-green-200 bg-green-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                                                <Calendar className="h-5 w-5" />
                                                1. Attendance
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Days Late:</span>
                                                    <div className="text-lg font-semibold text-gray-800">
                                                        {evaluation.attendance.daysLate || evaluation.attendance.days_late}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Days Absent:</span>
                                                    <div className="text-lg font-semibold text-gray-800">
                                                        {evaluation.attendance.daysAbsent || evaluation.attendance.days_absent}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                                                    <div className="text-lg font-semibold text-green-600">{evaluation.attendance.rating}/10</div>
                                                </div>
                                            </div>
                                            {evaluation.attendance.remarks && (
                                                <div className="mt-3">
                                                    <span className="text-sm font-medium text-gray-700">Remarks:</span>
                                                    <div className="mt-1 rounded border border-gray-200 bg-white p-2 text-sm text-gray-700">
                                                        {evaluation.attendance.remarks}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* 2. Attitude Towards Supervisor */}
                                {evaluation.attitudes && (
                                    <Card className="border border-blue-200 bg-blue-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                                                <User className="h-5 w-5" />
                                                2. Attitude Towards Supervisor
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="mb-3">
                                                <span className="text-sm font-medium text-gray-700">Rating:</span>
                                                <div className="mt-2">
                                                    <StarRating rating={evaluation.attitudes.supervisor_rating} />
                                                </div>
                                            </div>
                                            {evaluation.attitudes.supervisor_remarks && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Remarks:</span>
                                                    <div className="mt-1 rounded border border-gray-200 bg-white p-2 text-sm text-gray-700">
                                                        {evaluation.attitudes.supervisor_remarks}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* 3. Attitude Towards Co-worker */}
                                {evaluation.attitudes && (
                                    <Card className="border border-purple-200 bg-purple-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
                                                <User className="h-5 w-5" />
                                                3. Attitude Towards Co-worker
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="mb-3">
                                                <span className="text-sm font-medium text-gray-700">Rating:</span>
                                                <div className="mt-2">
                                                    <StarRating rating={evaluation.attitudes.coworker_rating} />
                                                </div>
                                            </div>
                                            {evaluation.attitudes.coworker_remarks && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Remarks:</span>
                                                    <div className="mt-1 rounded border border-gray-200 bg-white p-2 text-sm text-gray-700">
                                                        {evaluation.attitudes.coworker_remarks}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* 4. Work Attitude/Performance */}
                                {evaluation.workAttitude && (
                                    <Card className="border border-orange-200 bg-orange-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
                                                <FileText className="h-5 w-5" />
                                                4. Work Attitude/Performance
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Responsible in Work Assignment:</span>
                                                        <div className="mt-1">
                                                            <StarRating rating={evaluation.workAttitude.responsible} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Job Knowledge:</span>
                                                        <div className="mt-1">
                                                            <StarRating
                                                                rating={
                                                                    evaluation.workAttitude.jobKnowledge ?? evaluation.workAttitude.job_knowledge ?? 0
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Cooperation:</span>
                                                        <div className="mt-1">
                                                            <StarRating rating={evaluation.workAttitude.cooperation} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Work Initiative:</span>
                                                        <div className="mt-1">
                                                            <StarRating rating={evaluation.workAttitude.initiative} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Dependability:</span>
                                                        <div className="mt-1">
                                                            <StarRating rating={evaluation.workAttitude.dependability} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {evaluation.workAttitude.remarks && (
                                                <div className="mt-4">
                                                    <span className="text-sm font-medium text-gray-700">Overall Work Attitude Remarks:</span>
                                                    <div className="mt-1 rounded border border-gray-200 bg-white p-2 text-sm text-gray-700">
                                                        {evaluation.workAttitude.remarks}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* 5. Work Functions - Department Specific */}
                                {evaluation.workFunctions && evaluation.workFunctions.length > 0 && (
                                    <Card className="border border-teal-200 bg-teal-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg text-teal-800">
                                                <FileText className="h-5 w-5" />
                                                5. Work Functions - {evaluation.department} Department
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-4">
                                                {evaluation.workFunctions.map((workFunction: any, index: number) => (
                                                    <Card key={index} className="border bg-white">
                                                        <CardHeader className="pb-2">
                                                            <CardTitle className="text-base font-medium text-gray-800">
                                                                {workFunction.function_name}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="pt-0">
                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-700">Work Quality:</span>
                                                                    <div className="mt-1">
                                                                        <StarRating rating={workFunction.work_quality || 0} />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-700">Work Efficiency:</span>
                                                                    <div className="mt-1">
                                                                        <StarRating rating={workFunction.work_efficiency || 0} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Observations/Comments */}
                                {evaluation.observations && (
                                    <Card className="border border-indigo-200 bg-indigo-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg text-indigo-800">
                                                <FileText className="h-5 w-5" />
                                                Observations / Comments
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="rounded border border-gray-200 bg-white p-3 text-gray-700">{evaluation.observations}</div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Evaluator Information */}
                                {evaluation.evaluator && (
                                    <Card className="border border-gray-200 bg-gray-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                                                <User className="h-5 w-5" />
                                                Evaluation Signatures
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Evaluated by:</span>
                                                    <div className="mt-1 font-semibold text-gray-800">{evaluation.evaluator}</div>
                                                </div>
                                                <Card className="border border-green-200 bg-green-50">
                                                    <CardContent className="p-3">
                                                        <div className="text-sm font-medium text-green-700">Approved by:</div>
                                                        <div className="font-semibold text-green-800">Carmela B. Pedregosa</div>
                                                        <div className="text-sm text-green-700">Manager</div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rating Legend */}
                    <Card className="border-2 border-green-200 bg-white shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Rating Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap justify-center gap-6 text-lg font-medium">
                                <span className="text-red-600">1-4 = Fail</span>
                                <span className="text-yellow-600">5-7 = Satisfactory</span>
                                <span className="text-green-600">8-9 = Very Satisfactory</span>
                                <span className="text-blue-600">10 = Excellent</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-2 border-gray-300 bg-white px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
