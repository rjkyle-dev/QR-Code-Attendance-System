import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import ResumeToWorkPDF from './resume-to-work-pdf';

interface ResumeToWorkPDFData {
    id: string;
    employee_name: string;
    employee_id: string;
    employee_id_number?: string;
    department: string;
    position: string;
    return_date: string;
    previous_absence_reference: string;
    comments: string;
    status: 'pending' | 'processed';
    processed_by?: string | null;
    processed_at?: string | null;
    supervisor_notified?: boolean;
    supervisor_notified_at?: string | null;
    created_at: string;
    hr_officer_name?: string | null;
    supervisor_name?: string | null;
}

interface PDFViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfData: ResumeToWorkPDFData | null;
}

export default function PDFViewerModal({ isOpen, onClose, pdfData }: PDFViewerModalProps) {
    if (!isOpen || !pdfData) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative h-[90vh] w-[70%] overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-900">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 dark:bg-gray-900">
                    <h2 className="text-lg font-semibold">Resume to Work PDF Preview</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <XIcon className="h-4 w-4" />
                    </Button>
                </div>
                <div className="h-[calc(90vh-80px)] w-full overflow-auto bg-gray-100">
                    <style>
                        {`
                        .react-pdf__Page {
                            margin: 0 !important;
                            padding: 0 !important;
                            max-width: 100% !important;
                        }
                        .react-pdf__Page__canvas {
                            margin: 0 !important;
                            display: block !important;
                            max-width: 100% !important;
                            width: 100% !important;
                            height: auto !important;
                        }
                        .react-pdf__Document {
                            display: flex !important;
                            flex-direction: column !important;
                            align-items: stretch !important;
                            width: 100% !important;
                        }
                        .react-pdf__Page__textContent {
                            width: 100% !important;
                        }
                    `}
                    </style>
                    <ResumeToWorkPDF request={pdfData} />
                </div>
            </div>
        </div>
    );
}
