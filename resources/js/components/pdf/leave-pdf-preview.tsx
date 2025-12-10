import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';

interface Leave {
    id: string;
    leave_start_date: string;
    employee_name: string;
    leave_type: string;
    leave_end_date: string;
    leave_days: string;
    status: string;
    leave_reason: string;
    leave_date_reported: string;
    leave_date_approved: string;
    leave_comments: string;
    picture: string;
    department: string;
    position: string;
    employeeid: string;
}

import LeavePDFTemplate from './leave-pdf-template';

interface LeavePDFPreviewProps {
    leave: Leave;
}

export default function LeavePDFPreview({ leave }: LeavePDFPreviewProps) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const toAbsoluteUrl = (url?: string) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${origin}${path}`;
    };

    const safeLeave = {
        ...leave,
        picture: toAbsoluteUrl(leave.picture),
    };

    const LeaveDocument = LeavePDFTemplate({
        leave: safeLeave,
        companyName: 'CFARBEMCO',
        logoPath: toAbsoluteUrl('/AGOC.png'),
    });

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Leave - CFARBEMCO</h2>
                <p className="text-sm text-gray-600">Preview your leave request document</p>
            </div>

            <div className="h-[600px] w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                <PDFViewer width="100%" height="100%" style={{ borderRadius: '8px' }}>
                    <LeaveDocument />
                </PDFViewer>
            </div>

            <div className="mt-6 flex justify-center">
                <PDFDownloadLink
                    document={<LeaveDocument />}
                    fileName={`leave-request-${leave.employeeid || 'employee'}-${new Date().toISOString().split('T')[0]}.pdf`}
                >
                    {({ blob, url, loading, error }) => (
                        <button
                            disabled={loading}
                            className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-white transition duration-300 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Download PDF
                                </>
                            )}
                        </button>
                    )}
                </PDFDownloadLink>
            </div>
        </div>
    );
}
