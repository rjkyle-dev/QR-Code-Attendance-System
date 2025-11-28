'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const description = 'An interactive area chart';

// Fallback data for testing
const fallbackData = [
    { date: '2025-08-15', present: 85, late: 12, absent: 3 },
    { date: '2025-08-16', present: 88, late: 10, absent: 2 },
    { date: '2025-08-17', present: 82, late: 15, absent: 3 },
    { date: '2025-08-18', present: 90, late: 8, absent: 2 },
    { date: '2025-08-19', present: 87, late: 11, absent: 2 },
    { date: '2025-08-20', present: 84, late: 13, absent: 3 },
    { date: '2025-08-21', present: 89, late: 9, absent: 2 },
    { date: '2025-08-22', present: 86, late: 12, absent: 2 },
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                <div className="font-medium">
                    {new Date(label).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                    })}
                </div>
                <div className="grid gap-1.5">
                    {payload.map((entry: any, index: number) => {
                        const colors = {
                            present: '#22c55e',
                            late: '#eab308',
                            absent: '#ef4444',
                        };
                        const labels = {
                            present: 'Present',
                            late: 'Late',
                            absent: 'Absent',
                        };

                        return (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="h-2.5 w-2.5 rounded-[2px]"
                                    style={{ backgroundColor: colors[entry.dataKey as keyof typeof colors] }}
                                />
                                <span className="text-muted-foreground">{labels[entry.dataKey as keyof typeof labels]}</span>
                                <span className="font-mono font-medium text-foreground tabular-nums">{entry.value}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

// Custom legend component
const CustomLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null;

    const colors = {
        present: '#22c55e',
        late: '#eab308',
        absent: '#ef4444',
    };
    const labels = {
        present: 'Present',
        late: 'Late',
        absent: 'Absent',
    };

    return (
        <div className="flex items-center justify-center gap-4 pt-3">
            {payload.map((entry: any) => (
                <div key={entry.value} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: colors[entry.value as keyof typeof colors] }} />
                    {labels[entry.value as keyof typeof labels]}
                </div>
            ))}
        </div>
    );
};

export function ChartAreaInteractive() {
    const [timeRange, setTimeRange] = React.useState('90d');
    const [data, setData] = React.useState<{ date: string; present: number; late: number; absent: number }[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                setLoading(true);
                setError(null);

                // Use the correct API endpoint
                const res = await fetch('/api/attendance/all', { signal: controller.signal });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const items: Array<{
                    attendanceDate: string;
                    attendanceStatus: string;
                }> = await res.json();

                console.log('Raw attendance data:', items); // Debug log

                // Group by date and count Present/Late/Absent
                const map = new Map<string, { present: number; late: number; absent: number }>();
                for (const it of items) {
                    const dateKey = new Date(it.attendanceDate).toISOString().slice(0, 10);
                    if (!map.has(dateKey)) map.set(dateKey, { present: 0, late: 0, absent: 0 });
                    const entry = map.get(dateKey)!;
                    const status = (it.attendanceStatus || '').toLowerCase();
                    // Handle different status formats from database
                    if (status === 'present' || status === 'attendance complete' || status === 'complete') {
                        entry.present += 1;
                    } else if (status === 'late') {
                        entry.late += 1;
                    } else if (status === 'absent') {
                        entry.absent += 1;
                    }
                }

                console.log('Grouped data:', Array.from(map.entries())); // Debug log

                // Create a continuous series between min and max date within ~120 days window
                const dates = Array.from(map.keys()).sort();
                const today = new Date();
                const earliest = dates.length > 0 ? new Date(dates[0]) : new Date(today);
                const start = new Date(Math.max(earliest.getTime(), new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000).getTime()));
                const series: { date: string; present: number; late: number; absent: number }[] = [];

                for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
                    const key = d.toISOString().slice(0, 10);
                    const counts = map.get(key) ?? { present: 0, late: 0, absent: 0 };
                    series.push({ date: key, ...counts });
                }

                console.log('Final chart data:', series); // Debug log

                // If we have data, use it; otherwise set empty to show "No data"
                if (series.length > 0 && series.some((item) => item.present > 0 || item.late > 0 || item.absent > 0)) {
                    setData(series);
                } else {
                    console.log('No attendance data found, showing empty state');
                    setData([]);
                }
            } catch (err) {
                // Only log errors that aren't intentional aborts
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Error loading attendance data:', err);
                    setError(err.message);
                }
                // Do not use fallback data; let UI show empty/error state
                setData([]);
            } finally {
                setLoading(false);
            }
        }

        load();
        return () => controller.abort();
    }, []);

    const filteredData = React.useMemo(() => {
        const referenceDate = new Date();
        let daysToSubtract = 90;
        if (timeRange === '30d') daysToSubtract = 30;
        else if (timeRange === '7d') daysToSubtract = 7;
        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract + 1);
        return data.filter((item) => new Date(item.date) >= startDate);
    }, [data, timeRange]);

    console.log('Filtered data for chart:', filteredData); // Debug log

    if (loading) {
        return (
            <Card className="pt-0">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>Attendance - Interactive</CardTitle>
                        <CardDescription>Loading attendance data...</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="flex h-[250px] items-center justify-center">
                        <div className="text-muted-foreground">Loading...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="pt-0">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>Attendance - Interactive</CardTitle>
                        <CardDescription>Error loading data</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="flex h-[250px] items-center justify-center">
                        <div className="text-destructive">Error: {error}</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (filteredData.length === 0) {
        return (
            <Card className="pt-0">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>Attendance - Interactive</CardTitle>
                        <CardDescription>No data available</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="flex h-[250px] items-center justify-center">
                        <div className="text-muted-foreground">No attendance data found</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Attendance - Interactive</CardTitle>
                    <CardDescription>Showing Present, Late, and Absent</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex" aria-label="Select a value">
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">
                            Last 3 months
                        </SelectItem>
                        <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                        </SelectItem>
                        <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredData}>
                            <defs>
                                <linearGradient id="fillPresent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillLate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillAbsent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    });
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area dataKey="present" type="natural" fill="url(#fillPresent)" stroke="#22c55e" stackId="a" />
                            <Area dataKey="late" type="natural" fill="url(#fillLate)" stroke="#eab308" stackId="a" />
                            <Area dataKey="absent" type="natural" fill="url(#fillAbsent)" stroke="#ef4444" stackId="a" />
                            <Legend content={<CustomLegend />} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
