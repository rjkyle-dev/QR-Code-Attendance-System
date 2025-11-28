import { Button } from '@/components/ui/button';
import { Camera, Check, Fingerprint } from 'lucide-react';
import React, { useState } from 'react';

interface FingerprintCaptureProps {
    onCapture: (fingerprintData: string) => void;
    captured: boolean;
}

const FingerprintCapture: React.FC<FingerprintCaptureProps> = ({ onCapture, captured }) => {
    const [isCapturing, setIsCapturing] = useState(false);

    const handleCapture = () => {
        setIsCapturing(true);
        // Simulate fingerprint capture process
        setTimeout(() => {
            const mockFingerprintData = `fingerprint_${Date.now()}`;
            onCapture(mockFingerprintData);
            setIsCapturing(false);
        }, 2000);
    };

    return (
        <div className="space-y-4">
            <div
                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-8"
                onClick={handleCapture}
            >
                <div className="text-center">
                    {captured ? (
                        <div className="space-y-3">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">Fingerprint Captured</p>
                                <p className="text-sm text-green-600">Ready for verification</p>
                            </div>
                        </div>
                    ) : isCapturing ? (
                        <div className="space-y-3">
                            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-green-100">
                                <Fingerprint className="animate-user-pulse h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">Capturing Fingerprint...</p>
                                <p className="text-sm text-green-600">Please place finger on sensor</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Fingerprint className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-600">No Fingerprint Captured</p>
                                <p className="text-sm text-gray-500">Click to capture fingerprint</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <Button
                    onClick={handleCapture}
                    disabled={isCapturing}
                    className="bg-main text-black transition duration-200 ease-in hover:bg-green-300"
                >
                    <Camera className="mr-2 h-4 w-4" />
                    {captured ? 'Recapture' : isCapturing ? 'Capturing...' : 'Capture Fingerprint'}
                </Button>
            </div>
        </div>
    );
};

export default FingerprintCapture;
