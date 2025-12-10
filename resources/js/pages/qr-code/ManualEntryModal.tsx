import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Clock, Loader2, User, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ScanResult {
    success: boolean;
    message: string;
    attendance?: {
        id: number;
        employee_id: number;
        employeeid: string;
        employee_name: string;
        time_in?: string;
        time_out?: string;
        attendance_date: string;
        session: string;
        status: string;
        action: string;
    };
    current_session?: string;
}

interface ManualEntryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAttendanceRecorded?: () => void;
}

export function ManualEntryModal({ open, onOpenChange, onAttendanceRecorded }: ManualEntryModalProps) {
    const [employeeId, setEmployeeId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);

    useEffect(() => {
        if (open) {
            setScanResult(null);
            setEmployeeId('');
        }
    }, [open]);

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId.trim()) {
            toast.error('Please enter your Employee ID');
            return;
        }

        setIsSubmitting(true);
        setScanResult(null);

        try {
            const response = await axios.post('/api/qr-attendance/record-by-employeeid', {
                employeeid: employeeId.trim(),
            });

            const result: ScanResult = response.data;
            setScanResult(result);

            if (result.success) {
                toast.success(result.message || 'Attendance recorded successfully!');
                setEmployeeId('');
                onAttendanceRecorded?.();
                setTimeout(() => {
                    onOpenChange(false);
                    setScanResult(null);
                }, 2000);
            } else {
                toast.error(result.message || 'Failed to record attendance');
            }
        } catch (error: any) {
            console.error('Manual submission error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to record attendance. Please try again.';
            toast.error(errorMessage);

            setScanResult({
                success: false,
                message: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Manual Entry
                    </DialogTitle>
                    <DialogDescription>Enter your Employee ID to record attendance</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input
                                id="employeeId"
                                type="text"
                                placeholder="Enter your Employee ID (e.g., EMP10282001)"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                                className="text-lg"
                                disabled={isSubmitting}
                                autoFocus
                            />
                            <p className="text-sm text-muted-foreground">Enter your Employee ID to record attendance</p>
                        </div>

                        <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting || !employeeId.trim()}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Clock className="h-4 w-4" />
                                    Record Attendance
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Result Display */}
                    {scanResult && (
                        <Card
                            className={`w-full ${scanResult.success ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50'}`}
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    {scanResult.success ? (
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                    ) : (
                                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                                    )}
                                    <div className="flex-1">
                                        <p className={`font-semibold ${scanResult.success ? 'text-green-900' : 'text-red-900'}`}>
                                            {scanResult.message}
                                        </p>
                                        {scanResult.attendance && (
                                            <div className="mt-3 space-y-1 text-sm">
                                                <p className="font-medium">{scanResult.attendance.employee_name}</p>
                                                <p className="text-muted-foreground">
                                                    {scanResult.attendance.employeeid} • {scanResult.attendance.attendance_date}
                                                </p>
                                                {scanResult.attendance.time_in && (
                                                    <p className="text-muted-foreground">Time In: {scanResult.attendance.time_in}</p>
                                                )}
                                                {scanResult.attendance.time_out && (
                                                    <p className="text-muted-foreground">Time Out: {scanResult.attendance.time_out}</p>
                                                )}
                                                <p className="text-muted-foreground">
                                                    Session: {scanResult.attendance.session} • Status: {scanResult.attendance.status}
                                                </p>
                                            </div>
                                        )}
                                        {scanResult.current_session && !scanResult.success && (
                                            <div className="mt-2 flex items-start gap-2 rounded bg-blue-50 p-2">
                                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                                                <p className="text-xs text-blue-900">Current session: {scanResult.current_session}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Close Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={() => {
                                onOpenChange(false);
                            }}
                            variant="outline"
                            size="lg"
                            disabled={isSubmitting}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

