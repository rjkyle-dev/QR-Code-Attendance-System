import { useFingerprintWebSocket } from '@/hooks/useFingerprintWebSocket';
import { useState } from 'react';
import { toast } from 'sonner'; // or your notification system

const FingerprintRealtimeListener = () => {
    const [fingerprint, setFingerprint] = useState<any | null>(null);
    const [laravelResult, setLaravelResult] = useState<any | null>(null);

    useFingerprintWebSocket(
        (data) => {
            // This is called when C# sends fingerprint data
            setFingerprint(data);
            // Optionally show a modal or notification
            toast.info('Fingerprint data received!');
        },
        (result) => {
            // This is called when Laravel responds (via Node.js)
            setLaravelResult(result);
            if (result && result.status === 'success') {
                toast.success('Attendance recorded!');
            } else if (result && result.status === 'not_matched') {
                toast.error('No match found!');
            } else {
                toast.info('Received response from server.');
            }
        },
    );

    return (
        <div>
            {fingerprint && (
                <div className="my-2 rounded border bg-green-50 p-4">
                    <h2 className="font-bold text-green-700">Fingerprint Data</h2>
                    <p>Employee ID: {fingerprint.employee_id}</p>
                    <p>Captured At: {fingerprint.fingerprint_captured_at}</p>
                    <img
                        src={`data:image/png;base64,${fingerprint.fingerprint_image}`}
                        alt="Fingerprint"
                        className="my-2 h-32 w-32 border object-contain"
                    />
                </div>
            )}
            {laravelResult && laravelResult.data && laravelResult.data.employee && laravelResult.data.employee.fingerprint_image && (
                <div className="my-2 rounded border bg-blue-50 p-4">
                    <h2 className="font-bold text-blue-700">Fingerprint (from Employee Record)</h2>
                    <img
                        src={`data:image/png;base64,${laravelResult.data.employee.fingerprint_image}`}
                        alt="Fingerprint"
                        className="my-2 h-32 w-32 border object-contain"
                    />
                </div>
            )}
            {laravelResult && (
                <div className="my-2 rounded border bg-blue-50 p-4">
                    <h2 className="font-bold text-blue-700">Laravel Response</h2>
                    <pre className="text-xs">{JSON.stringify(laravelResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default FingerprintRealtimeListener;
