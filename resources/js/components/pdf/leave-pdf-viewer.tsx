import { PDFViewer, pdf } from '@react-pdf/renderer';
import LeavePDFTemplate from './leave-pdf-template';

type LeaveCore = {
    id: number | string;
    leave_start_date: string;
    leave_end_date: string;
    leave_type: string;
    leave_days: string | number;
    status?: string;
    leave_reason?: string;
    leave_date_reported?: string;
    leave_date_approved?: string | null;
    leave_comments?: string;
    picture?: string;
    department?: string;
    position?: string;
    employeeid?: string | number;
    employee_name?: string;
    supervisor_status?: string | null;
    hr_status?: string | null;
};

type LeavePDFViewerProps = {
    leave: LeaveCore;
    companyName?: string;
    logoPath?: string;
    width?: string | number;
    height?: string | number;
    showEmployeePhoto?: boolean;
    showFooter?: boolean;
    showHeader?: boolean;
};

/**
 * Inline PDF Viewer for Leave Document using react-pdf.
 * This component renders a PDF viewer that displays the leave document.
 */
export default function LeavePDFViewer({
    leave,
    companyName = 'CFARBEMCO',
    logoPath = '/Logo.png',
    width = '100%',
    height = 800,
    showEmployeePhoto = true,
    showFooter = true,
    showHeader = true,
}: LeavePDFViewerProps) {
    // Ensure image paths are absolute for react-pdf
    const toAbsoluteUrl = (url?: string) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${origin}${path}`;
    };

    const LeaveDocument = LeavePDFTemplate({
        leave: { ...leave, picture: leave.picture ? toAbsoluteUrl(leave.picture) : '' },
        companyName,
        logoPath: toAbsoluteUrl(logoPath),
        showEmployeePhoto,
        showFooter,
        showHeader,
    });

    return <PDFViewer style={{ width, height }}>{LeaveDocument()}</PDFViewer>;
}

/**
 * Helper: Generate a Blob of the leave PDF for download or opening in a new tab.
 * Returns { blob, filename }
 */
export async function generateLeavePdfBlob(
    leave: LeaveCore,
    opts?: {
        companyName?: string;
        logoPath?: string;
        showEmployeePhoto?: boolean;
        showFooter?: boolean;
        showHeader?: boolean;
    },
) {
    const toAbsoluteUrl = (url?: string) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${origin}${path}`;
    };

    const LeaveDocument = LeavePDFTemplate({
        leave: { ...leave, picture: leave.picture ? toAbsoluteUrl(leave.picture) : '' },
        companyName: opts?.companyName ?? 'CFARBEMCO',
        logoPath: toAbsoluteUrl(opts?.logoPath ?? '/Logo.png'),
        showEmployeePhoto: opts?.showEmployeePhoto ?? true,
        showFooter: opts?.showFooter ?? true,
        showHeader: opts?.showHeader ?? true,
    });

    const instance = pdf(LeaveDocument());
    const blob = await instance.toBlob();
    const filename = `leave-request-${leave.employeeid ?? 'employee'}-${new Date().toISOString().split('T')[0]}.pdf`;
    return { blob, filename };
}
