import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import FingerprintCapture from './fingerprintcapture';

dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

type AttendanceStatus = 'waiting' | 'matched' | 'not_matched' | 'late' | 'manual';

interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function formatTimeAMPM(time: string) {
    return time ? dayjs(time, 'HH:mm').format('hh:mm A') : '';
}

const AddAttendanceModal = ({ isOpen, onClose }: AttendanceModalProps) => {
    // Attendance time settings (as strings for <input type="time" />)
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [lateTime, setLateTime] = useState('');
    const [session, setSession] = useState('morning');

    // Helper to check if current time is within the window
    function isWithinAttendanceWindow() {
        if (!startTime || !endTime) return false;

        const now = dayjs();
        const start = dayjs(startTime, 'HH:mm');
        const end = dayjs(endTime, 'HH:mm');

        const nowMinutes = now.hour() * 60 + now.minute();
        const startMinutes = start.hour() * 60 + start.minute();
        const endMinutes = end.hour() * 60 + end.minute();

        // --- DEBUG LOGS ---
        console.log('--- Time Check ---');
        console.log(`Current Time: ${now.format('HH:mm')} (${nowMinutes})`);
        console.log(`Start Time:   ${start.format('HH:mm')} (${startMinutes})`);
        console.log(`End Time:     ${end.format('HH:mm')} (${endMinutes})`);

        let result;
        if (endMinutes < startMinutes) {
            // Overnight case
            result = nowMinutes >= startMinutes || nowMinutes <= endMinutes;
            console.log(`Overnight Check Result: ${result}`);
        } else {
            // Same day case
            result = nowMinutes >= startMinutes && nowMinutes <= endMinutes;
            console.log(`Same Day Check Result: ${result}`);
        }
        console.log('--------------------');
        return result;
    }
    const canCapture = isWithinAttendanceWindow();

    // Live current time
    const [currentTime, setCurrentTime] = useState(dayjs().format('hh:mm A'));
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs().format('hh:mm A'));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Attendance state
    const [status, setStatus] = useState<AttendanceStatus>('idle');
    const [wsEmployeeInfo, setWsEmployeeInfo] = useState<any | null>(null);
    const [manualId, setManualId] = useState('');
    const [showManual, setShowManual] = useState(false);
    const [fingerprintData, setFingerprintData] = useState<any | null>(null);
    // Remove employeeIdToVerify state

    // Inertia form for attendance
    const { data, setData, post, processing, reset } = useForm({
        employeeid: '',
        timeIn: '',
        attendanceStatus: '',
        attendanceDate: '',
        session: 'morning',
    });

    // WebSocket setup
    const ws = useRef<WebSocket | null>(null);

    // useEffect(() => {
    //     ws.current = new WebSocket('ws://localhost:8080');
    //     ws.current.onopen = () => console.log('WebSocket connected');
    //     ws.current.onclose = () => console.log('WebSocket disconnected');
    //     ws.current.onerror = (e) => console.error('WebSocket error', e);

    //     ws.current.onmessage = (event) => {
    //         try {
    //             const msg = JSON.parse(event.data);
    //             if (msg.type === 'fingerprint_identification_data' || msg.type === 'fingerprint_verification_data') {
    //                 setFingerprintData(msg); // contains fingerprint_image, fingerprint_captured_at, etc.
    //                 setWsEmployeeInfo(msg); // contains employeeid, employee_name, etc.
    //                 if (msg.employeeid) {
    //                     setStatus('idle'); // <-- Reset status after match
    //                     toast.success('Employee identified: ' + (msg.employee_name || msg.employeeid));
    //                     setTimeout(() => {
    //                         saveAttendance(msg.employeeid, 'matched');
    //                     }, 1000);
    //                 } else {
    //                     setStatus('idle'); // <-- Reset status after error
    //                     setWsEmployeeInfo(null);
    //                     toast.error('No matching employee found.');
    //                     setShowManual(true);
    //                 }
    //             }
    //         } catch (err) {
    //             // Ignore non-JSON or irrelevant messages
    //         }
    //     };

    //     return () => {
    //         ws.current?.close();
    //     };
    // }, []);

    // Auto close modal at the end time
   
    useEffect(() => {
        if (!endTime) return;
        const now = new Date();
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const end = new Date(now);
        end.setHours(endHour, endMinute, 0, 0);
        const closeDelay = end.getTime() - now.getTime();
        let closeTimer: NodeJS.Timeout | null = null;
        if (closeDelay > 0) {
            closeTimer = setTimeout(() => {
                onClose();
            }, closeDelay);
        }
        return () => {
            if (closeTimer) clearTimeout(closeTimer);
        };
    }, [endTime, onClose]);

    // Save attendance via Inertia
    const saveAttendance = (employeeid: string, matchType: 'matched' | 'manual') => {
        const now = new Date();
        let attendanceStatus = 'Present';
        // If lateTime is set and now > lateTime, mark as Late
        if (lateTime) {
            const [lateHour, lateMinute] = lateTime.split(':').map(Number);
            const late = new Date(now);
            late.setHours(lateHour, lateMinute, 0, 0);
            if (now > late) attendanceStatus = 'Late';
        }
        setData('employeeid', employeeid);
        setData('timeIn', dayjs(now).format('HH:mm:ss'));
        setData('attendanceStatus', attendanceStatus);
        setData('attendanceDate', dayjs(now).format('YYYY-MM-DD'));
        setData('session', session); // Pass session
        post(route('attendance.store'), {
            onSuccess: () => {
                toast.success('Attendance recorded!');
                setStatus('waiting');
                setWsEmployeeInfo(null);
                setFingerprintData(null);
                setManualId('');
                setShowManual(false);
            },
            onError: () => {
                toast.error('Failed to save attendance.');
            },
            preserveScroll: true,
        });
    };

    // Manual attendance fallback
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualId) return;
        saveAttendance(manualId, 'manual');
    };

    // This is the function to trigger the C# device for IDENTIFICATION
    const handleStartCapture = () => {
        if (!canCapture || !ws.current || ws.current.readyState !== 1) return;
        ws.current.send(JSON.stringify({ type: 'start_identification' }));
        setStatus('waiting');
        toast.info('Waiting for fingerprint identification...');
        setShowManual(false);
    };

    // UI for time inputs
    const renderTimeInput = (label: string, value: string, setValue: (v: string) => void) => (
        <div>
            <Label>{label}</Label>
            <Input type="time" value={value} onChange={(e) => setValue(e.target.value)} className="w-40" step={60} />
            {value && (
                <div className="mt-1 text-xs text-gray-600">
                    Selected: <span className="font-semibold">{formatTimeAMPM(value)}</span>
                </div>
            )}
        </div>
    );

    // --- DEBUG LOG ---
    // console.log(`Button Disabled? -> !canCapture: ${!canCapture}, status === 'waiting': ${status === 'waiting'}`);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-h-[90vh] min-w-2xl overflow-y-auto border-2 border-main shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-green-800">Attendance</DialogTitle>
                </DialogHeader>
                <div className="mb-4 flex justify-center">
                    <span className="rounded bg-green-100 px-4 py-2 text-lg font-bold text-green-800 shadow">Current Time: {currentTime}</span>
                </div>
                <form className="space-y-4" onSubmit={handleManualSubmit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {renderTimeInput('Start Time', startTime, setStartTime)}
                        {renderTimeInput('End Time', endTime, setEndTime)}
                        {renderTimeInput('Late Time (optional)', lateTime, setLateTime)}
                        <div>
                            <Label>Session</Label>
                            <select
                                className="w-full rounded border px-2 py-1"
                                value={session}
                                onChange={e => { setSession(e.target.value); setData('session', e.target.value); }}
                                required
                            >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                            </select>
                        </div>
                    </div>
                    <div className="my-4">
                        <Label>Fingerprint Verification</Label>
                        <FingerprintCapture
                            onStartCapture={handleStartCapture}
                            captured={status === 'matched'}
                            disabled={!canCapture || status === 'waiting'}
                        />
                        {!canCapture && (
                            <div className="mt-2 text-sm text-yellow-600">
                                Fingerprint capture is only allowed between {formatTimeAMPM(startTime)} and {formatTimeAMPM(endTime)}.
                            </div>
                        )}
                        {status === 'not_matched' && <div className="mt-2 text-red-600">Fingerprint not verified.</div>}
                    </div>
                    {wsEmployeeInfo && wsEmployeeInfo.employeeid && (
                        <div className="mb-4 flex items-center gap-4 rounded border p-4 shadow">
                            <img src={wsEmployeeInfo.picture || 'Logo.png'} alt="Profile" className="h-16 w-16 rounded-full border object-cover" />
                            <div>
                                <div className="font-bold">{wsEmployeeInfo.employee_name}</div>
                                <div className="text-sm text-gray-600">
                                    {wsEmployeeInfo.department} - {wsEmployeeInfo.position}
                                </div>
                                <div className="text-xs text-gray-500">{wsEmployeeInfo.employeeid}</div>
                            </div>
                        </div>
                    )}
                    {fingerprintData && fingerprintData.fingerprint_image && (
                        <div className="mb-4 flex flex-col items-center">
                            <img
                                src={`data:image/png;base64,${fingerprintData.fingerprint_image}`}
                                alt="Fingerprint"
                                className="h-32 w-32 border object-contain"
                            />
                            <div className="mt-2 text-xs text-green-600">
                                Captured at:{' '}
                                {fingerprintData.fingerprint_captured_at ? new Date(fingerprintData.fingerprint_captured_at).toLocaleString() : ''}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddAttendanceModal;
