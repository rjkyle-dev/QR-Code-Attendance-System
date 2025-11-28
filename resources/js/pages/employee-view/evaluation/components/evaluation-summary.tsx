import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Star } from 'lucide-react';

type Metric = {
    name: string;
    score: number; // 0-100
};

interface EmployeeEvaluationSummaryProps {
    employeeName: string;
    employeeId: string;
    overallRating: number; // 0-5
    lastEvaluatedAt?: string;
    metrics?: Metric[];
}

export function EmployeeEvaluationSummary({
    employeeName,
    employeeId,
    overallRating,
    lastEvaluatedAt,
    metrics = [
        { name: 'Work Function', score: 86 },
        { name: 'Work Attitude', score: 91 },
        { name: 'Attendance', score: 88 },
    ],
}: EmployeeEvaluationSummaryProps) {
    const fullStars = Math.floor(overallRating);
    const halfStar = overallRating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">Employee Evaluation</CardTitle>
                        <div className="mt-1 text-sm text-muted-foreground">Specific evaluation for the employee</div>
                    </div>
                    <Badge variant="outline" className="rounded-md">
                        ID: {employeeId}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="col-span-1 space-y-3">
                        <div>
                            <div className="text-sm text-muted-foreground">Employee</div>
                            <div className="text-base font-semibold">{employeeName}</div>
                        </div>
                        <Separator className="my-2" />
                        <div>
                            <div className="text-sm text-muted-foreground">Overall Rating</div>
                            <div className="mt-1 flex items-end gap-2">
                                {/* Display numeric rating on a 10-point scale to match list view */}
                                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{(overallRating * 2).toFixed(1)}</div>
                                <div className="flex items-center">
                                    {Array.from({ length: fullStars }).map((_, i) => (
                                        <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    {halfStar && <Star key="half" className="h-4 w-4 text-yellow-400" />}
                                    {Array.from({ length: emptyStars }).map((_, i) => (
                                        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
                                    ))}
                                </div>
                            </div>
                            {lastEvaluatedAt && <div className="mt-1 text-xs text-muted-foreground">Last evaluated: {lastEvaluatedAt}</div>}
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {metrics.map((metric) => (
                                <div key={metric.name} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">{metric.name}</div>
                                        <div className="text-sm text-muted-foreground">{metric.score}%</div>
                                    </div>
                                    <Progress value={metric.score} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default EmployeeEvaluationSummary;
