import { Document, Image, Page, PDFDownloadLink, PDFViewer, Text, View } from '@react-pdf/renderer';
import { styles } from './leave-style';

function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function statusColor(status) {
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

function statusTextColor(status) {
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

export default function LeavePDF({ leave }: { leave: any }) {
    const LeaveDocument = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header with logo and company name */}
                <View style={{ ...styles.header, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <Image src="/AGOC.png" style={{ width: 60, height: 60, marginRight: 16 }} />
                        <View>
                            <Text style={[styles.title, styles.textBold]}>HRIS (CheckWise)</Text>
                            <Text>Leave Request Document</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 10, color: '#888' }}>Generated: {formatDate(new Date())}</Text>
                    </View>
                </View>

                {/* Employee Info */}
                <View style={{ flexDirection: 'row', marginBottom: 16, gap: 24 }}>
                    {/* Employee Photo */}
                    {leave.picture && <Image src={leave.picture} style={{ width: 80, height: 80, borderRadius: 40, border: '2px solid #eee' }} />}
                    <View style={{ flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 12 }}>
                            <Text style={styles.textBold}>Employee Name:</Text> {leave.employee_name}
                        </Text>
                        <Text style={{ fontSize: 12 }}>
                            <Text style={styles.textBold}>Employee ID:</Text> {leave.employeeid}
                        </Text>
                        <Text style={{ fontSize: 12 }}>
                            <Text style={styles.textBold}>Department:</Text> {leave.department}
                        </Text>
                        <Text style={{ fontSize: 12 }}>
                            <Text style={styles.textBold}>Position:</Text> {leave.position}
                        </Text>
                    </View>
                </View>

                {/* Leave Details */}
                <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.textBold, { fontSize: 14, marginBottom: 6 }]}>Leave Details</Text>
                    <View style={{ flexDirection: 'row', gap: 24 }}>
                        <View style={{ flexDirection: 'column', gap: 2 }}>
                            <Text>
                                <Text style={styles.textBold}>Type:</Text> {leave.leave_type}
                            </Text>
                            <Text>
                                <Text style={styles.textBold}>Start Date:</Text> {formatDate(leave.leave_start_date)}
                            </Text>
                            <Text>
                                <Text style={styles.textBold}>End Date:</Text> {formatDate(leave.leave_end_date)}
                            </Text>
                            <Text>
                                <Text style={styles.textBold}>Total Days:</Text> {leave.leave_days}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'column', gap: 2 }}>
                            <Text>
                                <Text style={styles.textBold}>Date Reported:</Text> {formatDate(leave.leave_date_reported)}
                            </Text>
                            <Text>
                                <Text style={styles.textBold}>Date Approved:</Text> {formatDate(leave.leave_date_approved)}
                            </Text>
                            <Text>
                                <Text style={styles.textBold}>Status:</Text>{' '}
                                <Text
                                    style={{
                                        backgroundColor: statusColor(leave.status),
                                        color: statusTextColor(leave.status),
                                        padding: 4,
                                        borderRadius: 4,
                                    }}
                                >
                                    {leave.status}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Reason & Comments */}
                <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.textBold, { fontSize: 13, marginBottom: 2 }]}>Reason</Text>
                    <Text>{leave.leave_reason || 'No reason provided'}</Text>
                </View>
                <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.textBold, { fontSize: 13, marginBottom: 2 }]}>Comments</Text>
                    <Text>{leave.leave_comments || 'No additional comments'}</Text>
                </View>

                {/* Footer */}
                <View style={{ marginTop: 32, borderTop: '1px solid #eee', paddingTop: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#888' }}>This document was generated automatically by HRIS (CheckWise).</Text>
                    <Text style={{ fontSize: 10, color: '#888' }}>For any questions, please contact the HR department.</Text>
                </View>
            </Page>
        </Document>
    );
    return (
        <div className="mx-auto my-10 max-w-2xl">
            <div className="h-[500px] w-full">
                <PDFViewer width="100%" height="100%">
                    <LeaveDocument />
                </PDFViewer>
            </div>
            <div className="mt-6 flex justify-center">
                <PDFDownloadLink document={<LeaveDocument />} fileName={`leave-request-${leave.employeeid || 'employee'}.pdf`}>
                    <button className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white transition duration-300 hover:bg-blue-700">
                        Download PDF
                    </button>
                </PDFDownloadLink>
            </div>
        </div>
    );
}
