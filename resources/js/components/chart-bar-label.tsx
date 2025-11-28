'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const description = 'A bar chart with a label';

interface ChartBarLabelProps {
    chartData: { month?: string; period?: string; count: number }[];
    mode?: 'month' | 'period'; // 'month' for monthly, 'period' for 6-month period
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded bg-white p-2 shadow">
                <p className="font-semibold">{label}</p>
                <p>{payload[0].value} leave requests</p>
            </div>
        );
    }
    return null;
};

export function ChartBarLabel({ chartData, mode = 'month' }: ChartBarLabelProps) {
    // Determine which key to use for the x-axis
    const xKey = mode === 'period' ? 'period' : 'month';
    const title = mode === 'period' ? 'Leave Requests (6-Month Periods)' : 'Leave Requests Per Month in Current Year';
    const description = mode === 'period' ? 'Total leave requests for each 6-month period' : 'Monthly leave request count';

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }} barCategoryGap={30}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey={xKey} tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis label={{ value: 'Leave Requests', angle: -90, position: 'insideLeft', offset: 10 }} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="count"
                                fill="#06D6A0" // Custom color
                                radius={[8, 8, 0, 0]}
                                isAnimationActive={true}
                                barSize={60} // Adjust bar width here
                            >
                                <LabelList dataKey="count" position="top" style={{ fill: '#06D6A0', fontWeight: 600 }} fontSize={14} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">{description}</div>
                <div className="leading-none text-muted-foreground">
                    {mode === 'period' ? 'Showing total leave requests for each 6-month period' : 'Showing total leave requests for each month'}
                </div>
            </CardFooter>
        </Card>
    );
}
