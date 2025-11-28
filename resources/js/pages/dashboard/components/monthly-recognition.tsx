import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Star, Trophy } from 'lucide-react';

interface RecognitionEmployee {
    id: number;
    name: string;
    department: string;
    position: string;
    picture?: string;
    employeeid: string;
    initials: string;
    evaluation_rating: number;
    evaluation_date: string;
    evaluation_period: string;
    evaluation_year: number;
    recognition_score: number;
}

interface Props {
    employees?: RecognitionEmployee[];
    isSupervisor?: boolean;
}

export function MonthlyRecognition({ employees = [], isSupervisor = false }: Props) {
    if (!employees || employees.length === 0) {
        return (
            <div className="py-4 text-center text-muted-foreground">
                <Trophy className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm font-medium">No employees eligible for recognition</p>
                <p className="text-xs">Employees need evaluation ratings of 8.0+ to qualify</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {employees.map((employee, index) => (
                <Card key={employee.id} className="border-l-4 border-l-green-500 transition-shadow hover:shadow-md">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                                    {employee.picture ? (
                                        <AvatarImage src={employee.picture} alt={employee.name} />
                                    ) : (
                                        <AvatarFallback className="text-sm font-semibold sm:text-lg">{employee.initials}</AvatarFallback>
                                    )}
                                </Avatar>
                                {/* Recognition rank badge */}
                                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                                    {index === 0 && (
                                        <Badge className="bg-yellow-500 px-1.5 py-0.5 text-xs text-white sm:px-2 sm:py-1">
                                            <Star className="mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3" />
                                            1st
                                        </Badge>
                                    )}
                                    {index === 1 && (
                                        <Badge className="bg-gray-400 px-1.5 py-0.5 text-xs text-white sm:px-2 sm:py-1">
                                            <Star className="mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3" />
                                            2nd
                                        </Badge>
                                    )}
                                    {index === 2 && (
                                        <Badge className="bg-orange-500 px-1.5 py-0.5 text-xs text-white sm:px-2 sm:py-1">
                                            <Star className="mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3" />
                                            3rd
                                        </Badge>
                                    )}
                                    {index >= 3 && (
                                        <Badge className="bg-blue-500 px-1.5 py-0.5 text-xs text-white sm:px-2 sm:py-1">#{index + 1}</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="mb-1.5 flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="truncate text-sm font-semibold">{employee.name}</h4>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {employee.position} • {employee.department}
                                        </p>
                                    </div>
                                    <div className="ml-2 text-right">
                                        <p className="text-xs font-medium text-muted-foreground">{employee.employeeid}</p>
                                        <Badge variant="secondary" className="text-xs">
                                            {typeof employee.recognition_score === 'number'
                                                ? employee.recognition_score.toFixed(1)
                                                : Number(employee.recognition_score || 0).toFixed(1)}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Performance metrics */}
                                <div className="grid grid-cols-3 gap-1 text-xs">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-600" />
                                        <span className="font-medium text-yellow-700">{employee.evaluation_rating}/10</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-blue-600" />
                                        <span className="font-medium text-blue-700">{employee.evaluation_period}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-purple-600" />
                                        <span className="font-medium text-purple-700">{employee.evaluation_year}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
