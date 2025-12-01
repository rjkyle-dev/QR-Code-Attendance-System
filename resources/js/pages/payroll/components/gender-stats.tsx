import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCountUp } from '@/hooks/use-count-up';
import { UserCheck, Users, UserX } from 'lucide-react';
import { Employees } from '../types/employees';

interface GenderStatsProps {
    employees: Employees[];
}

export function GenderStats({ employees }: GenderStatsProps) {
    // Calculate gender statistics
    const totalEmployees = employees.length;
    const maleCount = employees.filter((emp) => emp.gender?.toLowerCase() === 'male').length;
    const femaleCount = employees.filter((emp) => emp.gender?.toLowerCase() === 'female').length;
    const otherCount = totalEmployees - maleCount - femaleCount;

    // Use count up animation for the numbers
    const totalCount = useCountUp(totalEmployees, 1000);
    const maleCountAnimated = useCountUp(maleCount, 1000);
    const femaleCountAnimated = useCountUp(femaleCount, 1000);
    const otherCountAnimated = useCountUp(otherCount, 1000);

    // Calculate percentages
    const malePercentage = totalEmployees > 0 ? ((maleCount / totalEmployees) * 100).toFixed(1) : '0';
    const femalePercentage = totalEmployees > 0 ? ((femaleCount / totalEmployees) * 100).toFixed(1) : '0';
    const otherPercentage = totalEmployees > 0 ? ((otherCount / totalEmployees) * 100).toFixed(1) : '0';

    return (
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-3 @xl/main:grid-cols-4 @5xl/main:grid-cols-4">
            {/* Total Employees Card */}
            <Card className="border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Users className="size-6 text-blue-600" />
                        </div>
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                            Total
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-blue-700">Total Employees</CardDescription>
                    <CardTitle className="text-3xl font-bold text-blue-800 tabular-nums @[250px]/card:text-4xl">
                        {totalCount.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="text-sm text-blue-600">
                        <div className="flex items-center gap-2">
                            <Users className="size-4" />
                            Complete workforce count
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Male Employees Card */}
            <Card className="border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-green-100 p-2">
                            <UserCheck className="size-6 text-green-600" />
                        </div>
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                            Male
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-green-700">Male Employees</CardDescription>
                    <CardTitle className="text-3xl font-bold text-green-800 tabular-nums @[250px]/card:text-4xl">
                        {maleCountAnimated.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="text-sm text-green-600">
                        <div className="flex items-center gap-2">
                            <UserCheck className="size-4" />
                            {malePercentage}% of total workforce
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Female Employees Card */}
            <Card className="border-l-4 border-pink-500 bg-gradient-to-br from-pink-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-pink-100 p-2">
                            <UserCheck className="size-6 text-pink-600" />
                        </div>
                        <Badge variant="outline" className="border-pink-200 bg-pink-50 text-pink-700">
                            Female
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-pink-700">Female Employees</CardDescription>
                    <CardTitle className="text-3xl font-bold text-pink-800 tabular-nums @[250px]/card:text-4xl">
                        {femaleCountAnimated.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="text-sm text-pink-600">
                        <div className="flex items-center gap-2">
                            <UserCheck className="size-4" />
                            {femalePercentage}% of total workforce
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Other/Unspecified Card */}
            <Card className="border-l-4 border-gray-500 bg-gradient-to-br from-gray-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-gray-100 p-2">
                            <UserX className="size-6 text-gray-600" />
                        </div>
                        <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">
                            Other
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-gray-700">Other/Unspecified</CardDescription>
                    <CardTitle className="text-3xl font-bold text-gray-800 tabular-nums @[250px]/card:text-4xl">
                        {otherCountAnimated.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <UserX className="size-4" />
                            {otherPercentage}% of total workforce
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
