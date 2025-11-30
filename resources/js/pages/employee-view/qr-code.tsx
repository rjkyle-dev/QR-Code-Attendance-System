import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Clock, Download, Info, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/employee-view',
    },
    {
        title: 'My QR Code',
        href: '/employee-view/qr-code',
    },
];

interface Employee {
    id: number;
    employeeid: string;
    employee_name: string;
    firstname: string;
    lastname: string;
    department: string;
    position: string;
    picture?: string;
}

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
}

interface Props {
    employee: Employee;
}

export default function QrCodePage({ employee }: Props) {
    const [qrData, setQrData] = useState<QRCodeData | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Generate initial QR code
    useEffect(() => {
        generateQrCode();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!qrData) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expiresAt = new Date(qrData.expires_at).getTime();
            const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

            setTimeRemaining(remaining);

            // Auto-refresh when 5 seconds remaining
            if (remaining <= 5 && remaining > 0 && !isRefreshing) {
                setIsRefreshing(true);
                generateQrCode(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [qrData, isRefreshing]);

    const generateQrCode = async (silent = false) => {
        try {
            if (!silent) {
                setIsGenerating(true);
            }

            const response = await axios.get('/api/qr-code/generate');
            const data = response.data;

            if (data.success) {
                setQrData(data);
                setTimeRemaining(data.expires_in);
                if (!silent) {
                    toast.success('QR Code generated successfully');
                }
                setIsRefreshing(false);
            } else {
                toast.error(data.message || 'Failed to generate QR code');
            }
        } catch (error: any) {
            console.error('QR code generation error:', error);
            toast.error(
                error.response?.data?.message || 'Failed to generate QR code. Please try again.'
            );
            setIsRefreshing(false);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRefresh = () => {
        generateQrCode();
    };

    const handleDownload = () => {
        if (!qrData) return;

        // Create a canvas element to render QR code
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create a temporary container
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        document.body.appendChild(container);

        // Render QR code to SVG then convert to image
        const svgElement = document.querySelector('#qr-code-svg') as SVGSVGElement;
        if (!svgElement) {
            toast.error('QR code not found');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const downloadUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = `qr-code-${employee.employeeid}-${Date.now()}.png`;
                    link.click();
                    URL.revokeObjectURL(downloadUrl);
                    URL.revokeObjectURL(url);
                    toast.success('QR Code downloaded');
                }
            });
            document.body.removeChild(container);
        };
        img.src = url;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My QR Code - Attendance" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="mx-auto w-full max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span>My QR Code for Attendance</span>
                            </CardTitle>
                            <CardDescription>
                                Show this QR code at the attendance station to clock in or out
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center gap-6">
                                {/* QR Code Display */}
                                {qrData && (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="rounded-lg border-4 border-primary bg-white p-4 shadow-lg">
                                            <QRCodeSVG
                                                id="qr-code-svg"
                                                value={JSON.stringify(qrData.qr_data)}
                                                size={256}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        </div>

                                        {/* Timer */}
                                        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-semibold text-primary">
                                                Expires in: {formatTime(timeRemaining)}
                                            </span>
                                        </div>

                                        {/* Employee Info */}
                                        <div className="text-center">
                                            <p className="text-lg font-semibold">{employee.employee_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {employee.employeeid} • {employee.department}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Loading State */}
                                {isGenerating && !qrData && (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-64 w-64 animate-pulse rounded-lg bg-muted"></div>
                                        <p className="text-sm text-muted-foreground">
                                            Generating QR code...
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleRefresh}
                                        disabled={isGenerating}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <RefreshCw
                                            className={`h-4 w-4 ${isGenerating || isRefreshing ? 'animate-spin' : ''}`}
                                        />
                                        Refresh QR Code
                                    </Button>
                                    {qrData && (
                                        <Button onClick={handleDownload} variant="outline" className="gap-2">
                                            <Download className="h-4 w-4" />
                                            Download
                                        </Button>
                                    )}
                                </div>

                                {/* Instructions */}
                                <Card className="w-full border-blue-200 bg-blue-50/50">
                                    <CardContent className="pt-6">
                                        <div className="flex gap-3">
                                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="space-y-2 text-sm text-blue-900">
                                                <p className="font-semibold">How to use:</p>
                                                <ul className="list-disc list-inside space-y-1 ml-2">
                                                    <li>Show this QR code at the attendance station</li>
                                                    <li>The QR code refreshes automatically every 60 seconds</li>
                                                    <li>Each QR code can only be used once</li>
                                                    <li>Make sure you're within the attendance session hours</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

