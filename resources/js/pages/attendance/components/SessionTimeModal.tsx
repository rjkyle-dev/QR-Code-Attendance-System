import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Session = {
    id: number;
    session_name: string;
    time_in_start: string;
    time_in_end: string;
    time_out_start: string;
    time_out_end: string;
    late_time?: string;
    double_scan_window?: number;
};

interface Props {
    open: boolean;
    onClose: () => void;
    mode?: 'create' | 'update';
    onSuccess?: () => void;
    sessions: Session[];
}

type FormValues = {
    session_name: string;
    time_in_start: string;
    time_in_end: string;
    time_out_start: string;
    time_out_end: string;
    late_time?: string;
    double_scan_window?: number;
};

export const SessionTimeModal: React.FC<Props> = ({ open, onClose, mode = 'create', onSuccess, sessions }) => {
    const { data, setData, post, put, processing, errors } = useForm<FormValues>({
        session_name: 'company',
        time_in_start: '',
        time_in_end: '',
        time_out_start: '',
        time_out_end: '',
        late_time: '',
        double_scan_window: undefined,
    });

    const [timeInStart, setTimeInStart] = useState<string>('');
    const [timeInEnd, setTimeInEnd] = useState<string>('');
    const [timeOutStart, setTimeOutStart] = useState<string>('');
    const [timeOutEnd, setTimeOutEnd] = useState<string>('');
    const [lateTime, setLateTime] = useState<string>('');
    const [doubleScan, setDoubleScan] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (mode === 'update') {
            const session = sessions[0];
            if (session) {
                // Set time values directly (input type="time" expects HH:MM format)
                setTimeInStart(session.time_in_start || '');
                setTimeInEnd(session.time_in_end || '');
                setTimeOutStart(session.time_out_start || '');
                setTimeOutEnd(session.time_out_end || '');
                setLateTime(session.late_time || '');
                setDoubleScan(session.double_scan_window != null ? String(session.double_scan_window) : '');
                setData({
                    session_name: session.session_name || 'company',
                    time_in_start: session.time_in_start,
                    time_in_end: session.time_in_end,
                    time_out_start: session.time_out_start,
                    time_out_end: session.time_out_end,
                    late_time: session.late_time || '',
                    double_scan_window: session.double_scan_window,
                });
            }
        } else if (mode === 'create') {
            setTimeInStart('');
            setTimeInEnd('');
            setTimeOutStart('');
            setTimeOutEnd('');
            setLateTime('');
            setDoubleScan('');
            setData({
                session_name: 'company',
                time_in_start: '',
                time_in_end: '',
                time_out_start: '',
                time_out_end: '',
                late_time: '',
                double_scan_window: undefined,
            });
        }
    }, [sessions, mode, setData]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use the separate start and end times directly
        const dsNum = doubleScan === '' ? undefined : Math.max(1, Math.min(60, parseInt(doubleScan)));

        const payload = {
            session_name: data.session_name || 'company',
            time_in_start: timeInStart || '',
            time_in_end: timeInEnd || '',
            time_out_start: timeOutStart || '',
            time_out_end: timeOutEnd || '',
            late_time: lateTime || undefined,
            double_scan_window: dsNum,
        };

        setSubmitting(true);
        if (mode === 'update') {
            const target = sessions[0];
            if (target) {
                router.put(route('attendance-session.update', { id: target.id }), payload as any, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Session times updated!');
                        onSuccess?.();
                        onClose();
                    },
                    onError: (errors) => {
                        console.error('Update session error:', errors);
                        toast.error('Failed to update session times.');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                setSubmitting(false);
                toast.error('No existing session to update.');
            }
        } else if (mode === 'create') {
            router.post(route('attendance-session.store'), payload as any, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Session times created!');
                    onSuccess?.();
                    onClose();
                },
                onError: (errors) => {
                    console.error('Create session error:', errors);
                    toast.error('Failed to create session times.');
                },
                onFinish: () => setSubmitting(false),
            });
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === 'update' ? 'Change Set Time' : 'Set Session Times'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Time In</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Label className="text-xs">
                                    Start Time:
                                    <div className="mt-1">
                                        <Input type="time" value={timeInStart} onChange={(e) => setTimeInStart(e.target.value)} required />
                                    </div>
                                </Label>
                                <Label className="text-xs">
                                    End Time:
                                    <div className="mt-1">
                                        <Input type="time" value={timeInEnd} onChange={(e) => setTimeInEnd(e.target.value)} required />
                                    </div>
                                </Label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Time Out</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Label className="text-xs">
                                    Start Time:
                                    <div className="mt-1">
                                        <Input type="time" value={timeOutStart} onChange={(e) => setTimeOutStart(e.target.value)} required />
                                    </div>
                                </Label>
                                <Label className="text-xs">
                                    End Time:
                                    <div className="mt-1">
                                        <Input type="time" value={timeOutEnd} onChange={(e) => setTimeOutEnd(e.target.value)} required />
                                    </div>
                                </Label>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Label>
                            Late Time (optional):
                            <div className="mt-1">
                                <Input type="time" value={lateTime} onChange={(e) => setLateTime(e.target.value)} />
                            </div>
                        </Label>
                        <Label>
                            Double Scan Window (minutes):
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="10"
                                value={doubleScan}
                                onChange={(e) => {
                                    const onlyDigits = e.target.value.replace(/\D+/g, '');
                                    setDoubleScan(onlyDigits);
                                }}
                            />
                        </Label>
                    </div>
                    <DialogFooter className="mt-2 flex justify-end space-x-2">
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button variant="main" type="submit" disabled={processing || submitting}>
                            {processing ? 'Saving...' : mode === 'update' ? 'Update' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
