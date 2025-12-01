import { Check, Fingerprint } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface FingerprintCaptureProps {
    onFingerprintCaptured: (data: any) => void;
    employeeId?: string; // Employee ID (for Regular/Probationary)
    employeeDatabaseId?: number | string; // Database ID (for Add Crew)
    workStatus?: string; // Work status to determine if EmployeeID is required
    onStartCapture?: () => void; // Optional callback when capture starts
    employeeFingerprints?: any[]; // Add this prop to check existing fingerprints
}

const FingerprintCapture: React.FC<FingerprintCaptureProps> = ({
    onFingerprintCaptured,
    employeeId,
    employeeDatabaseId,
    workStatus,
    onStartCapture,
    employeeFingerprints = [],
}) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [fingerprintData, setFingerprintData] = useState<any | null>(null);
    const ws = useRef<WebSocket | null>(null);

    // Function to check if employee has fingerprints
    const hasFingerprints = () => {
        return employeeFingerprints && employeeFingerprints.length > 0;
    };

    // Function to get background color based on fingerprint status
    const getBackgroundColor = () => {
        if (hasFingerprints()) {
            return 'bg-green-100 border-green-300 hover:bg-green-200';
        } else {
            return 'bg-red-100 border-red-300 hover:bg-red-200';
        }
    };

    // Function to get text color based on fingerprint status
    const getTextColor = () => {
        if (hasFingerprints()) {
            return 'text-green-800';
        } else {
            return 'text-red-800';
        }
    };

    // Function to get icon color based on fingerprint status
    const getIconColor = () => {
        if (hasFingerprints()) {
            return 'text-green-600';
        } else {
            return 'text-red-600';
        }
    };

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8080');
        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'fingerprint_data') {
                    setFingerprintData(data);
                    onFingerprintCaptured(data); // Pass up to parent
                    setIsCapturing(false);
                }
            } catch (e) {
                // Ignore parse errors
            }
        };
        return () => {
            ws.current?.close();
        };
    }, [onFingerprintCaptured]);

    // Check if capture is allowed
    // All employees (including Add Crew) now have an employeeid
    const hasEmployeeId = employeeId && employeeId.trim() !== '';
    const isCaptureAllowed = hasEmployeeId;

    const handleCapture = () => {
        // All employees require employeeId (Add Crew now has auto-generated ID)
        if (!isCaptureAllowed) {
            alert('Please save employee info first before capturing fingerprint.');
            return;
        }

        if (typeof onStartCapture === 'function') {
            onStartCapture();
        }
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            // Send employeeid for all employees (Add Crew now has auto-generated ID)
            const message: any = {
                type: 'start_registration',
                employeeid: employeeId,
            };

            ws.current.send(JSON.stringify(message));
            setIsCapturing(true);
        }
        // Do not show any alert or error if WebSocket is not open; just do nothing.
    };

    return (
        <div className="space-y-4">
            {/* Integrated Fingerprint Capture Area with Status */}
            <div
                className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                    isCaptureAllowed ? getBackgroundColor() : 'cursor-not-allowed border-gray-300 bg-gray-50'
                }`}
                onClick={isCaptureAllowed ? handleCapture : undefined}
            >
                <div className="text-center">
                    {fingerprintData ? (
                        // New fingerprint just captured
                        <div className="space-y-3">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">Fingerprint Captured!</p>
                                <img
                                    src={`data:image/png;base64,${fingerprintData.fingerprint_image}`}
                                    alt="New Fingerprint"
                                    className="mx-auto my-2 h-32 w-32 border object-contain"
                                />
                                <p className="text-xs text-green-600">
                                    Captured at: {new Date(fingerprintData.fingerprint_captured_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ) : isCapturing ? (
                        // Currently capturing
                        <div className="space-y-3">
                            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-green-100">
                                <Fingerprint className="animate-user-pulse h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">Capturing Fingerprint...</p>
                                <p className="text-sm text-green-600">Please place finger on sensor</p>
                            </div>
                        </div>
                    ) : hasFingerprints() ? (
                        // Has existing fingerprints - show them
                        <div className="space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Fingerprint className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className={`font-medium ${getTextColor()}`}>Fingerprint Registered</p>
                                <p className="mb-3 text-sm text-green-600">Fingerprint already registered</p>

                                {/* Display existing fingerprint images */}
                                <div className="flex flex-wrap justify-center gap-3">
                                    {employeeFingerprints.map((fp: any, idx: number) => (
                                        <div key={fp.id || idx} className="text-center">
                                            <img
                                                src={fp.fingerprint_image ? `data:image/png;base64,${fp.fingerprint_image}` : '/Logo.png'}
                                                alt={`Fingerprint ${idx + 1}`}
                                                className="mx-auto h-40 w-40 rounded border-2 border-green-400 object-contain shadow-sm"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/Logo.png';
                                                }}
                                            />
                                            {/* <p className="mt-1 text-xs text-green-700">
                                                {fp.finger_name
                                                    ? fp.finger_name.charAt(0).toUpperCase() + fp.finger_name.slice(1)
                                                    : `Finger ${idx + 1}`}
                                            </p> */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // No fingerprints registered
                        <div className="space-y-3">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <Fingerprint className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                                <p className={`font-medium ${getTextColor()}`}>
                                    {isCaptureAllowed ? 'No Fingerprints Registered' : 'Save Employee First'}
                                </p>
                                <p className="text-sm text-red-600">
                                    {isCaptureAllowed ? 'Click to capture first fingerprint' : 'Please save employee info first'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FingerprintCapture;
