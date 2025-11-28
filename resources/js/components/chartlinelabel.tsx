'use client';

import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export const description = 'A line chart showing employee absence trends over time';

const chartConfig = {
    absences: {
        label: 'Absences',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

interface ChartLineLabelProps {
    data: Array<{
        month: string;
        year: number;
        absences: number;
        percentage: number;
        date: string;
    }>;
}

export function ChartLineLabel({ data }: ChartLineLabelProps) {
    const [monthRange, setMonthRange] = useState<6 | 12>(6);

    // Filter data based on selected month range
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Get the last N months based on selection
        const filteredData = data.slice(-monthRange);
        return filteredData;
    }, [data, monthRange]);

    // Calculate trend
    const calculateTrend = () => {
        if (chartData.length < 2) return { direction: 'neutral', percentage: 0 };

        const currentMonth = chartData[chartData.length - 1];
        const previousMonth = chartData[chartData.length - 2];

        if (!currentMonth || !previousMonth) return { direction: 'neutral', percentage: 0 };

        const change = currentMonth.absences - previousMonth.absences;
        const percentage = previousMonth.absences > 0 ? Math.round((change / previousMonth.absences) * 100) : 0;

        return {
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
            percentage: Math.abs(percentage),
        };
    };

    const trend = calculateTrend();

    const getTrendIcon = () => {
        switch (trend.direction) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-red-500" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-green-500" />;
            default:
                return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTrendText = () => {
        switch (trend.direction) {
            case 'up':
                return `Absences increased by ${trend.percentage}% this month`;
            case 'down':
                return `Absences decreased by ${trend.percentage}% this month`;
            default:
                return 'Absence rate remained stable this month';
        }
    };

    const getTrendColor = () => {
        switch (trend.direction) {
            case 'up':
                return 'text-red-600';
            case 'down':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    // If no data, show message
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Employee Absence Trends</CardTitle>
                    <CardDescription>No absence data available for the selected period</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center text-muted-foreground">
                        <p>No absence records found for the selected time period.</p>
                        <p className="text-sm">Data will appear here once absence requests are approved.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Employee Absence Trends</CardTitle>
                        <CardDescription>
                            {monthRange === 6 ? 'Last 6 months' : 'Last 12 months'} absence patterns
                            {chartData.length > 0 && (
                                <span className="ml-1 text-muted-foreground">
                                    ({chartData[0]?.year} - {chartData[chartData.length - 1]?.year})
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant={monthRange === 6 ? 'default' : 'outline'} size="sm" onClick={() => setMonthRange(6)}>
                            6 Months
                        </Button>
                        <Button variant={monthRange === 12 ? 'default' : 'outline'} size="sm" onClick={() => setMonthRange(12)}>
                            12 Months
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                top: 20,
                                left: 12,
                                right: 12,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                label={{ value: 'Number of Absences', angle: -90, position: 'insideLeft' }}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                            <Line
                                dataKey="absences"
                                type="natural"
                                stroke="var(--chart-1)"
                                strokeWidth={3}
                                dot={{
                                    fill: 'var(--chart-1)',
                                    strokeWidth: 2,
                                    r: 4,
                                }}
                                activeDot={{
                                    r: 6,
                                    stroke: 'var(--chart-1)',
                                    strokeWidth: 2,
                                }}
                            >
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={11}
                                    formatter={(value: number) => value}
                                />
                            </Line>
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className={`flex gap-2 leading-none font-medium ${getTrendColor()}`}>
                    {getTrendText()} {getTrendIcon()}
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing absence trends for {monthRange === 6 ? 'the last 6 months' : 'the last 12 months'}
                </div>
                <div className="mt-2 grid w-full grid-cols-2 gap-4 text-xs">
                    <div className="rounded bg-muted p-2 text-center">
                        <div className="font-semibold">Current Month</div>
                        <div className="text-lg font-bold text-foreground">{chartData[chartData.length - 1]?.absences || 0}</div>
                        <div className="text-muted-foreground">{chartData[chartData.length - 1]?.percentage || 0}% of workforce</div>
                    </div>
                    <div className="rounded bg-muted p-2 text-center">
                        <div className="font-semibold">Average</div>
                        <div className="text-lg font-bold text-foreground">
                            {Math.round(chartData.reduce((sum, item) => sum + item.absences, 0) / chartData.length)}
                        </div>
                        <div className="text-muted-foreground">per month</div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
