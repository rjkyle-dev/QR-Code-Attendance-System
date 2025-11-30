import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { Clock, Download, Loader2, QrCode, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface QRCodeData {
    token: string;
    expires_at: string;
    expires_in: number;
    qr_data: {
        employee_id: number;
        employeeid: string;
        token: string;
        expires_at: string;
        signature: string;
    };
    employee?: {
        id: number;
        employeeid: string;
        employee_name: string;
        firstname: string;
        lastname: string;
        department: string;
        position: string;
    };
}

interface EmployeeQrCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: {
        id: number;
        employeeid?: string;
        firstname: string;
        lastname: string;
        department?: string;
        position?: string;
        work_status?: string;
    } | null;
}

export default function EmployeeQrCodeModal({ isOpen, onClose, employee }: EmployeeQrCodeModalProps) {
    const [qrData, setQrData] = useState<QRCodeData | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Generate QR code when modal opens and employee is available
    useEffect(() => {
        if (isOpen && employee?.id) {
            generateQrCode();
        } else {
            // Reset state when modal closes
            setQrData(null);
            setTimeRemaining(0);
        }
    }, [isOpen, employee?.id]);

    // Countdown timer
    useEffect(() => {
        if (!qrData) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expiresAt = new Date(qrData.expires_at).getTime();
            const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

            setTimeRemaining(remaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [qrData]);

    const generateQrCode = async () => {
        if (!employee?.id) {
            toast.error('Employee information is required');
            return;
        }

        try {
            setIsGenerating(true);
            setIsRefreshing(false);

            const response = await axios.post('/api/qr-code/generate-for-employee', {
                employee_id: employee.id,
                expires_in: 300, // 5 minutes for admin-generated QR codes
            });

            const data = response.data;

            if (data.success) {
                setQrData(data);
                setTimeRemaining(data.expires_in);
                toast.success('QR Code generated successfully');
            } else {
                toast.error(data.message || 'Failed to generate QR code');
            }
        } catch (error: any) {
            console.error('QR code generation error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate QR code. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRefresh = () => {
        generateQrCode();
    };

    const handleDownload = () => {
        if (!qrData) return;

        try {
            // Find the QR code SVG element
            const svgElement = document.querySelector(`#qr-code-svg-${employee?.id}`) as SVGSVGElement;
            if (!svgElement) {
                toast.error('QR code not found');
                return;
            }

            // Convert SVG to image
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const downloadUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = `qr-code-${employee?.employeeid || employee?.id}-${Date.now()}.png`;
                        link.click();
                        URL.revokeObjectURL(downloadUrl);
                        URL.revokeObjectURL(url);
                        toast.success('QR Code downloaded');
                    }
                });
            };
            img.src = url;
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download QR code');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!employee) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] min-w-lg overflow-y-auto border-2 border-cfar-500 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-800">
                        <QrCode className="h-5 w-5" />
                        Employee QR Code
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Employee Info */}
                    <div className="rounded-lg bg-green-50 p-4">
                        <div className="font-semibold text-green-800">
                            {employee.employeeid ? (
                                <>
                                    Employee ID: {employee.employeeid}
                                    {employee.work_status === 'Add Crew' && ' (Auto-generated)'}
                                </>
                            ) : (
                                <>Employee: #{employee.id}</>
                            )}
                        </div>
                        <div className="mt-1 text-sm text-green-700">
                            {employee.firstname} {employee.lastname}
                        </div>
                        {employee.department && (
                            <div className="mt-1 text-xs text-green-600">
                                {employee.department}
                                {employee.position && ` • ${employee.position}`}
                            </div>
                        )}
                    </div>

                    {/* QR Code Display */}
                    {qrData && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="rounded-lg border-4 border-primary bg-white p-4 shadow-lg">
                                <QRCodeSVG
                                    id={`qr-code-svg-${employee.id}`}
                                    value={JSON.stringify(qrData.qr_data)}
                                    size={256}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            {/* Timer */}
                            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-primary">Expires in: {formatTime(timeRemaining)}</span>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isGenerating && !qrData && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Generating QR code...</p>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                        <div className="space-y-2 text-sm text-blue-900">
                            <p className="font-semibold">Instructions:</p>
                            <ul className="ml-2 list-inside list-disc space-y-1">
                                <li>Employee can show this QR code at attendance stations</li>
                                <li>QR code is valid for 5 minutes</li>
                                <li>Each QR code can only be used once</li>
                                <li>Employee can generate new QR codes from their portal</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" type="button" onClick={onClose}>
                        Close
                    </Button>
                    {qrData && (
                        <>
                            <Button variant="outline" type="button" onClick={handleRefresh} disabled={isGenerating} className="gap-2">
                                <RefreshCw className={`h-4 w-4 ${isGenerating || isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button variant="outline" type="button" onClick={handleDownload} className="gap-2">
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </>
                    )}
                    <Button
                        type="button"
                        variant="main"
                        onClick={() => {
                            onClose();
                            toast.success('QR Code saved successfully!');
                        }}
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
