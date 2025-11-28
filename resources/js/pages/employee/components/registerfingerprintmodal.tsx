import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import React, { useEffect, useState } from 'react';
import FingerprintCapture from './fingerprintcapture';

interface RegisterFingerprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: {
        employeeid?: string;
        employee_name: string;
        id?: string | number;
        work_status?: string;
    } | null;
}

const FINGER_OPTIONS = [
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
];

const RegisterFingerprintModal: React.FC<RegisterFingerprintModalProps> = ({ isOpen, onClose, employee }) => {
    const [saving, setSaving] = useState(false);
    const [capturedData, setCapturedData] = useState<any | null>(null);
    const [selectedFinger, setSelectedFinger] = useState<string>('');
    const [wsFingerprintData, setWsFingerprintData] = useState<any | null>(null);

    const handleFingerprintCaptured = (data: any) => {
        setCapturedData(data);
    };

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'fingerprint_data') {
                    setWsFingerprintData(data);
                }
            } catch {}
        };
        return () => ws.close();
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Register Fingerprint</DialogTitle>
                </DialogHeader>
                {employee && (
                    <div className="mb-4">
                        <div className="font-semibold">{employee.employee_name}</div>
                        {employee.employeeid ? (
                            <div className="text-sm text-gray-500">Employee ID: {employee.employeeid}</div>
                        ) : (
                            <div className="text-sm text-gray-500">Employee Database ID: #{employee.id}</div>
                        )}
                    </div>
                )}
                <div className="mb-4">
                    <label className="mb-2 block font-medium">
                        Finger Name <span className="text-xs text-gray-400">(optional)</span>
                    </label>
                    <RadioGroup value={selectedFinger} onValueChange={setSelectedFinger} className="flex gap-4">
                        {FINGER_OPTIONS.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem id={`finger-radio-${option.value}`} value={option.value} />
                                <label htmlFor={`finger-radio-${option.value}`} className="cursor-pointer select-none">
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                {/* Fingerprint Registration  */}
                <FingerprintCapture
                    onFingerprintCaptured={handleFingerprintCaptured}
                    employeeId={employee?.employeeid}
                    employeeDatabaseId={employee?.id}
                    workStatus={employee?.work_status}
                />
                {wsFingerprintData && (
                    <div className="mt-4 text-center">
                        <div className="mb-2 font-medium text-green-800">Fingerprint Preview:</div>
                        <img
                            src={`data:image/png;base64,${wsFingerprintData.fingerprint_image}`}
                            alt="Fingerprint Preview"
                            className="mx-auto h-32 w-32 border object-contain"
                        />
                        <div className="mt-2 text-xs text-green-600">
                            Captured at:{' '}
                            {wsFingerprintData.fingerprint_captured_at ? new Date(wsFingerprintData.fingerprint_captured_at).toLocaleString() : ''}
                        </div>
                        {/* Optionally display employee info from wsFingerprintData if present */}
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onClose} className="bg-main text-black hover:bg-green-300">
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RegisterFingerprintModal;
