import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import LeavePDFTemplate from './leave-pdf-template';

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

// Example of custom styles for different PDF layouts
const customStyles = {
    // Modern Blue Theme
    modernBlue: {
        page: {
            backgroundColor: '#f8fafc',
            padding: '40px 60px',
        },
        header: {
            backgroundColor: '#1e40af',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
        },
        companyName: {
            color: 'white',
            fontSize: '28px',
        },
        documentTitle: {
            color: '#e2e8f0',
            fontSize: '14px',
        },
        employeeSection: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
        },
        sectionTitle: {
            color: '#1e40af',
            fontSize: '16px',
            borderBottom: '2px solid #1e40af',
            paddingBottom: '8px',
        },
        detailText: {
            fontSize: '13px',
            color: '#374151',
        },
        statusBadge: {
            borderRadius: '20px',
            padding: '6px 12px',
        },
    },

    // Corporate Green Theme
    corporateGreen: {
        page: {
            backgroundColor: '#f0fdf4',
            padding: '35px 50px',
        },
        header: {
            backgroundColor: '#059669',
            color: 'white',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '25px',
        },
        companyName: {
            color: 'white',
            fontSize: '26px',
        },
        documentTitle: {
            color: '#d1fae5',
            fontSize: '13px',
        },
        employeeSection: {
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        sectionTitle: {
            color: '#059669',
            fontSize: '18px',
            borderBottom: '3px solid #059669',
            paddingBottom: '10px',
        },
        detailText: {
            fontSize: '14px',
            color: '#1f2937',
        },
        statusBadge: {
            borderRadius: '25px',
            padding: '8px 16px',
            fontWeight: 'bold',
        },
    },

    // Minimalist Theme
    minimalist: {
        page: {
            backgroundColor: 'white',
            padding: '50px 60px',
        },
        header: {
            borderBottom: '2px solid #000',
            paddingBottom: '20px',
            marginBottom: '40px',
        },
        companyName: {
            color: '#000',
            fontSize: '32px',
            fontWeight: 'bold',
        },
        documentTitle: {
            color: '#666',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
        },
        employeeSection: {
            border: '1px solid #ddd',
            padding: '30px',
            marginBottom: '30px',
        },
        sectionTitle: {
            color: '#000',
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '20px',
        },
        detailText: {
            fontSize: '14px',
            color: '#333',
            lineHeight: '1.6',
        },
        statusBadge: {
            border: '1px solid #000',
            backgroundColor: 'transparent',
            color: '#000',
            padding: '4px 8px',
        },
    },
};

export default function LeavePDFCustomExample({ leave }: { leave: Leave }) {
    // You can choose which theme to use
    const selectedTheme = 'modernBlue'; // or 'corporateGreen' or 'minimalist'

    const LeaveDocument = LeavePDFTemplate({
        leave,
        companyName: 'CFARBEMCO',
        logoPath: '/Logo.png',
        customStyles: customStyles[selectedTheme as keyof typeof customStyles],
        showEmployeePhoto: true,
        showFooter: true,
        showHeader: true,
    });

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Leave - CFARBEMCO</h2>
                <p className="text-sm text-gray-600">Custom themed PDF preview</p>
                <div className="mt-4 flex justify-center gap-2">
                    <span className="text-xs text-gray-500">Theme: {selectedTheme}</span>
                </div>
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
