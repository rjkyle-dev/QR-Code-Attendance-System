import { Button } from '@/components/ui/button';
import { Camera, Check, Fingerprint } from 'lucide-react';
import React from 'react';

interface FingerprintCaptureProps {
    onStartCapture: () => void; 
    captured: boolean;
    disabled?: boolean;
}

const FingerprintCapture: React.FC<FingerprintCaptureProps> = ({ onStartCapture, captured, disabled }) => {
    return (
        <div className="space-y-4">
            <div
                className={`flex items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-8 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                onClick={disabled ? undefined : onStartCapture}
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
                    onClick={onStartCapture}
                    disabled={disabled}
                    className="bg-main text-black transition duration-200 ease-in hover:bg-green-300"
                >
                    <Camera className="mr-2 h-4 w-4" />
                    {captured ? 'Recapture' : 'Capture Fingerprint'}
                </Button>
            </div>
        </div>
    );
};

export default FingerprintCapture;
