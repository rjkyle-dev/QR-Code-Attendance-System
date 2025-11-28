import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Calendar, ClipboardCheck, Clock, Download, FileText, RefreshCw, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface QuickActionsProps {
    totalToday?: number;
    onRefresh?: () => void;
    refreshing?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ totalToday = 0, onRefresh, refreshing = false }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isExporting, setIsExporting] = useState(false);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleExportToday = () => {
        setIsExporting(true);
        // Simulate export - replace with actual export logic
        setTimeout(() => {
            toast.success("Today's attendance exported successfully!");
            setIsExporting(false);
        }, 1500);
    };

    const handleExportAll = () => {
        setIsExporting(true);
        // Simulate export - replace with actual export logic
        setTimeout(() => {
            toast.success('All attendance data exported successfully!');
            setIsExporting(false);
        }, 1500);
    };

    const handleViewReports = () => {
        router.visit('/reports/attendance');
    };

    return (
        <Card className="border-main bg-gradient-to-br from-green-50 via-white to-emerald-50 shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <Clock className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>Manage attendance operations efficiently</CardDescription>
                    </div>
                    <Badge variant="outline" className="border-green-300 bg-green-100 px-3 py-1 text-green-700">
                        <Users className="mr-1 h-3 w-3" />
                        {totalToday} Today
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Live Date & Time Display */}
                <div className="rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-500 p-2">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Current Date & Time</p>
                                <p className="text-lg font-bold text-green-800">{formatDate(currentTime)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-green-600" />
                                <span className="font-mono text-2xl font-bold text-green-700">{formatTime(currentTime)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {/* Refresh Button */}
                    {/* <Button
                        variant="outline"
                        className="hover-lift h-auto flex-col gap-2 border-green-300 bg-white py-4 transition-all hover:border-green-500 hover:bg-green-50"
                        onClick={onRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-5 w-5 text-green-600 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="text-xs font-medium text-gray-700">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                    </Button> */}

                    {/* Export Today */}
                    {/* <Button
                        variant="outline"
                        className="hover-lift h-auto flex-col gap-2 border-blue-300 bg-white py-4 transition-all hover:border-blue-500 hover:bg-blue-50"
                        onClick={handleExportToday}
                        disabled={isExporting}
                    >
                        <Download className="h-5 w-5 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">{isExporting ? 'Exporting...' : 'Export Today'}</span>
                    </Button> */}

                    {/* Export All */}
                    {/* <Button
                        variant="outline"
                        className="hover-lift h-auto flex-col gap-2 border-purple-300 bg-white py-4 transition-all hover:border-purple-500 hover:bg-purple-50"
                        onClick={handleExportAll}
                        disabled={isExporting}
                    >
                        <FileText className="h-5 w-5 text-purple-600" />
                        <span className="text-xs font-medium text-gray-700">Export All</span>
                    </Button> */}

                    {/* View Reports */}
                    {/* <Button
                        variant="outline"
                        className="hover-lift h-auto flex-col gap-2 border-amber-300 bg-white py-4 transition-all hover:border-amber-500 hover:bg-amber-50"
                        onClick={handleViewReports}
                    >
                        <FileText className="h-5 w-5 text-amber-600" />
                        <span className="text-xs font-medium text-gray-700">View Reports</span>
                    </Button> */}

                   

                    {/* Daily Checking PP Crew */}
                    <Button
                        variant="outline"
                        className="hover-lift h-auto flex-col gap-2 border-emerald-300 bg-white py-4 transition-all hover:border-emerald-500 hover:bg-emerald-50"
                        onClick={() => router.visit('/attendance/daily-checking')}
                    >
                        <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                        <span className="text-xs font-medium text-gray-700">PP Crew Check</span>
                    </Button>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-2">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-green-800">System Status: Active</span>
                    </div>
                    <span className="text-xs text-green-600">Last updated: {formatTime(currentTime)}</span>
                </div>
            </CardContent>
        </Card>
    );
};
