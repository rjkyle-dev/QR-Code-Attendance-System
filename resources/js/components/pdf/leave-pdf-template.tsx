import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './leave-style';

interface LeavePDFTemplateProps {
    leave: any;
    companyName?: string;
    logoPath?: string;
    customStyles?: any;
    showEmployeePhoto?: boolean;
    showFooter?: boolean;
    showHeader?: boolean;
}

export function LeavePDFTemplate({
    leave,
    companyName = 'CFARBEMCO',
    logoPath = '/AGOC.png',
    customStyles = {},
    showEmployeePhoto = true,
    showFooter = true,
    showHeader = true,
}: LeavePDFTemplateProps) {
    function formatDate(date: string) {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function statusColor(status: string) {
        switch ((status || '').toLowerCase()) {
            case 'approved':
                return '#d4edda';
            case 'pending':
                return '#fff3cd';
            case 'rejected':
                return '#f8d7da';
            case 'cancelled':
                return '#f8d7da';
            default:
                return '#e2e3e5';
        }
    }

    function statusTextColor(status: string) {
        switch ((status || '').toLowerCase()) {
            case 'approved':
                return '#155724';
            case 'pending':
                return '#856404';
            case 'rejected':
                return '#721c24';
            case 'cancelled':
                return '#721c24';
            default:
                return '#383d41';
        }
    }

    const LeaveDocument = () => (
        <Document>
            <Page size="A4" style={{ ...styles.page, ...(customStyles.page || {}) }}>
                {showHeader && (
                    <View
                        style={{
                            ...styles.header,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            ...(customStyles.header || {}),
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image src={logoPath} style={{ width: 60, height: 60, marginRight: 16, ...(customStyles.logo || {}) }} />
                            <View>
                                <Text style={[styles.title, styles.textBold, customStyles.companyName]}>{companyName}</Text>
                                <Text style={customStyles.documentTitle}>Leave Request Document</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 10, color: '#888', ...(customStyles.generatedDate || {}) }}>
                                Generated: {formatDate(new Date().toISOString())}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Employee Info */}
                <View style={{ flexDirection: 'row', marginBottom: 16, ...(customStyles.employeeSection || {}) }}>
                    {showEmployeePhoto && leave.picture ? (
                        <Image
                            src={leave.picture}
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                borderWidth: 2,
                                borderColor: '#eee',
                                marginRight: 16,
                                ...(customStyles.employeePhoto || {}),
                            }}
                        />
                    ) : null}
                    <View style={{ flexDirection: 'column', justifyContent: 'center', ...(customStyles.employeeInfo || {}) }}>
                        <Text style={{ fontSize: 12, ...(customStyles.employeeText || {}) }}>
                            <Text style={styles.textBold}>Employee Name:</Text> {leave.employee_name}
                        </Text>
                        <Text style={{ fontSize: 12, ...(customStyles.employeeText || {}) }}>
                            <Text style={styles.textBold}>Employee ID:</Text> {leave.employeeid}
                        </Text>
                        <Text style={{ fontSize: 12, ...(customStyles.employeeText || {}) }}>
                            <Text style={styles.textBold}>Department:</Text> {leave.department}
                        </Text>
                        <Text style={{ fontSize: 12, ...(customStyles.employeeText || {}) }}>
                            <Text style={styles.textBold}>Position:</Text> {leave.position}
                        </Text>
                    </View>
                </View>

                {/* Leave Details */}
                <View style={{ marginBottom: 16, ...(customStyles.leaveDetailsSection || {}) }}>
                    <Text style={[styles.textBold, { fontSize: 14, marginBottom: 6 }, customStyles.sectionTitle]}>Leave Details</Text>
                    <View style={{ flexDirection: 'row', ...(customStyles.leaveDetailsGrid || {}) }}>
                        <View style={{ flexDirection: 'column', ...(customStyles.leaveDetailsColumn || {}) }}>
                            <Text style={customStyles.detailText}>
                                <Text style={styles.textBold}>Type:</Text> {leave.leave_type}
                            </Text>
                            <Text style={customStyles.detailText}>
                                <Text style={styles.textBold}>Start Date:</Text> {formatDate(leave.leave_start_date)}
                            </Text>
                            <Text style={customStyles.detailText}>
                                <Text style={styles.textBold}>End Date:</Text> {formatDate(leave.leave_end_date)}
                            </Text>
                            <Text style={customStyles.detailText}>
                                <Text style={styles.textBold}>Total Days:</Text> {leave.leave_days}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'column', ...(customStyles.leaveDetailsColumn || {}) }}>
                            <Text style={customStyles.detailText}>
                                <Text style={styles.textBold}>Date Reported:</Text> {formatDate(leave.leave_date_reported)}
                            </Text>
                            <Text style={customStyles.detailText}>
                                <Text style={styles.textBold}>Date Approved:</Text> {formatDate(leave.leave_date_approved)}
                            </Text>
                            <Text style={customStyles.detailText}>
                                <Text style={styles.textBold}>Status:</Text>{' '}
                                <Text
                                    style={{
                                        backgroundColor: statusColor(leave.status),
                                        color: statusTextColor(leave.status),
                                        padding: 4,
                                        borderRadius: 4,
                                        ...(customStyles.statusBadge || {}),
                                    }}
                                >
                                    {leave.status}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Reason & Comments */}
                <View style={{ marginBottom: 12, ...(customStyles.reasonSection || {}) }}>
                    <Text style={[styles.textBold, { fontSize: 13, marginBottom: 2 }, customStyles.fieldLabel]}>Leave Reason</Text>
                    <Text style={customStyles.fieldValue}>{leave.leave_reason || 'No reason provided'}</Text>
                </View>
                <View style={{ marginBottom: 12, ...(customStyles.commentsSection || {}) }}>
                    <Text style={[styles.textBold, { fontSize: 13, marginBottom: 2 }, customStyles.fieldLabel]}>Comments</Text>
                    <Text style={customStyles.fieldValue}>{leave.leave_comments || 'No additional comments'}</Text>
                </View>

                {showFooter && (
                    <View
                        style={{
                            marginTop: 32,
                            paddingTop: 12,
                            alignItems: 'center',
                            borderTopWidth: 1,
                            borderTopColor: '#eee',
                            ...(customStyles.footer || {}),
                        }}
                    >
                        <Text style={{ fontSize: 10, color: '#888', ...(customStyles.footerText || {}) }}>
                            This document was generated automatically by {companyName} HRIS.
                        </Text>
                        <Text style={{ fontSize: 10, color: '#888', ...(customStyles.footerText || {}) }}>
                            For any questions, please contact the HR department.
                        </Text>
                    </View>
                )}
            </Page>
        </Document>
    );

    return LeaveDocument;
}

export default LeavePDFTemplate;
