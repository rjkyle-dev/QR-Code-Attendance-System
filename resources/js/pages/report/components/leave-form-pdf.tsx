import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface Leave {
    id: string;
    leave_type: string;
    leave_start_date: string;
    leave_end_date: string;
    leave_days: number;
    status: string;
    leave_reason: string;
    leave_date_reported: string;
    leave_date_approved: string | null;
    leave_comments: string | null;
    employee_name: string;
    employeeid: string;
    department: string;
    position: string;
    picture: string | null;
    supervisor_approver: { id: number; name: string } | null;
    hr_approver: { id: number; name: string } | null;
    department_hr: { id: number; name: string } | null;
    department_manager: { id: number; name: string } | null;
    used_credits: number | null;
    remaining_credits: number | null;
}

interface LeaveFormPDFProps {
    leave: Leave;
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fff',
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        position: 'relative',
    },
    backgroundLogo: {
        position: 'absolute',
        top: 150,
        left: 50,
        width: 500,
        height: 500,
        opacity: 0.02,
        zIndex: 0,
    },
    content: {
        position: 'relative',
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 15,
    },
    headerLogo: {
        width: 80,
        height: 80,
    },
    headerText: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyName: {
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 2,
    },
    companyNameBold: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 2,
    },
    acronym: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 2,
    },
    address: {
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 8,
    },
    separator: {
        borderBottomWidth: 1,
        borderColor: '#000',
        marginBottom: 20,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    bodyText: {
        fontSize: 10,
        marginBottom: 15,
        lineHeight: 1.5,
    },
    reasonLines: {
        marginTop: 8,
        marginBottom: 15,
    },
    reasonLine: {
        borderBottomWidth: 0.8,
        borderColor: '#000',
        marginBottom: 8,
        paddingBottom: 2,
        minHeight: 15,
    },
    reasonText: {
        fontSize: 10,
        marginBottom: 2,
    },
    signatureSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 50,
    },
    signatureBox: {
        width: '45%',
    },
    signatureBoxLeft: {
        width: '45%',
        alignItems: 'flex-start',
    },
    signatureBoxRight: {
        width: '45%',
        alignItems: 'flex-end',
    },
    signatureLabel: {
        fontSize: 10,
        marginBottom: 4,
    },
    signatureLine: {
        borderBottomWidth: 0.8,
        borderColor: '#000',
        marginBottom: 4,
        height: 1,
    },
    employeeSignature: {
        alignItems: 'flex-end',
    },
});

export default function LeaveFormPDF({ leave }: LeaveFormPDFProps) {
    // Format leave type for the form
    const getLeaveTypeText = (type: string): string => {
        const typeMap: Record<string, string> = {
            'Vacation Leave': 'Vacation Leave',
            'Sick Leave': 'Sick Leave',
            'Emergency Leave': 'Emergency Leave',
            Voluntary: 'Voluntary',
            Resignation: 'Resignation',
        };
        return typeMap[type] || type;
    };

    // Format date for display
    const formatDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    // Capitalize name (convert to all uppercase)
    const capitalizeName = (name: string | null | undefined): string => {
        if (!name || typeof name !== 'string') {
            return '';
        }
        return name.trim().toUpperCase();
    };

    // Split reason into lines for display
    const reasonLines = leave.leave_reason ? leave.leave_reason.split('\n').filter((line) => line.trim()) : [];
    // Ensure at least 3 lines for the form
    const displayLines = Math.max(3, reasonLines.length);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Background Logo */}
                <Image src="/AGOC.png" style={styles.backgroundLogo} />

                {/* Content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
                        <Image src="/AGOC.png" style={[styles.headerLogo, { marginLeft: 5 }]} />
                        <View style={styles.headerText}>
                            <Text style={styles.companyName}>Checkered Farms Agrarian Reform Beneficiaries</Text>
                            <Text style={styles.companyNameBold}>Multi Purpose Cooperative</Text>
                            <Text style={styles.acronym}>CFARBEMPCO</Text>
                            <Text style={styles.address}>Purok 3, Tibungol, Panabo City, Davao del Norte</Text>
                        </View>
                        <View style={{ width: 80, height: 80, marginRight: 5 }} />
                    </View>

                    {/* Separator */}
                    <View style={styles.separator} />

                    {/* Title */}
                    <Text style={styles.title}>LEAVE FORM</Text>

                    {/* Body Text */}
                    <View style={styles.bodyText}>
                        <Text>
                            I would like to render/apply for request for my Voluntary / Resignation / Vacation Leave / Emergency Leave / Maternity
                            Leave / Paternity Leave effective{' '}
                            <Text style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{leave.leave_days}</Text> days for the following
                            reasons:
                        </Text>
                    </View>

                    {/* Reason Lines */}
                    <View style={styles.reasonLines}>
                        {Array.from({ length: displayLines }).map((_, index) => {
                            const lineText = reasonLines[index] || '';
                            return (
                                <View key={index} style={styles.reasonLine}>
                                    {lineText ? <Text style={styles.reasonText}>{lineText}</Text> : <Text style={styles.reasonText}> </Text>}
                                </View>
                            );
                        })}
                    </View>

                    <View style={{ width: '100%', marginTop: 24, alignItems: 'flex-end' }}>
                        <View style={styles.employeeSignature}>
                            {leave.employee_name && (
                                <Text style={{ fontSize: 9, marginTop: 4, textDecoration: 'underline', fontWeight: 'bold' }}>
                                    {capitalizeName(leave.employee_name)}
                                </Text>
                            )}
                            {/* <View style={styles.signatureLine} /> */}
                            <Text style={{ fontSize: 9, marginTop: 4 }}>Name & Signature of Employee</Text>
                        </View>
                    </View>

                    {/* Credits Section */}
                    <View style={{ marginTop: 24, width: '100%' }}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 6 }}>CREDITS:</Text>
                        {/* Table Header */}
                        <View style={{ flexDirection: 'row', borderBottomColor: '#666', paddingBottom: 3 }}>
                            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>LEAVE TYPE</Text>

                                <Text style={{ fontSize: 9, fontWeight: 'bold', marginLeft: 45 }}>No. OF DAY</Text>
                            </View>
                            <View style={{ flex: 2, alignItems: 'center' }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>LEAVE CREDITS TO BE TAKEN</Text>
                            </View>
                            <View style={{ flex: 2, alignItems: 'center' }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>EMPLOYEE LEAVE CREDIT BALANCE</Text>
                            </View>
                        </View>
                        {/* Row Example - you may want to replace or repeat for additional rows */}
                        <View style={{ flexDirection: 'row', paddingTop: 4, paddingBottom: 4 }}>
                            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                                    {capitalizeName(leave.leave_type)}
                                </Text>

                                <Text style={{ fontSize: 10, fontWeight: 'bold', marginLeft: 70 }}>{leave.leave_days}</Text>
                            </View>
                            <View style={{ flex: 2, alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{leave.used_credits !== null ? leave.used_credits : '-'}</Text>
                            </View>
                            <View style={{ flex: 2, alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                                    {leave.remaining_credits !== null ? leave.remaining_credits : '-'}
                                </Text>
                            </View>
                        </View>
                        {/* Date Reg, Year Applicable Section */}
                        <View style={{ flexDirection: 'row', marginTop: 40, marginBottom: 6 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 11 }}>
                                    Date Reg:{' '}
                                    <Text style={{ fontWeight: 'bold' }}>
                                        {leave.leave_date_reported ? format(new Date(leave.leave_date_reported), 'yyyy-MM-dd') : '-'}
                                    </Text>
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 10 }}>
                                    Year Applicable:{' '}
                                    <Text style={{ fontWeight: 'bold' }}>
                                        {leave.leave_start_date ? format(new Date(leave.leave_start_date), 'yyyy') : '-'}
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Signatures */}
                    <View style={styles.signatureSection}>
                        <View style={styles.signatureBoxLeft}>
                            <Text style={styles.signatureLabel}>Prepared by:</Text>
                            {leave.department_hr?.name && (
                                <Text style={{ fontSize: 10, textDecoration: 'underline', fontWeight: 'bold' }}>
                                    {capitalizeName(leave.department_hr.name)}
                                </Text>
                            )}
                            {/* <View style={styles.signatureLine} /> */}
                        </View>
                        <View style={styles.signatureBoxRight}>
                            <Text style={[styles.signatureLabel, { marginRight: 30 }]}>Approved by:</Text>
                            {leave.department_manager?.name && (
                                <Text style={{ fontSize: 10, textDecoration: 'underline', fontWeight: 'bold' }}>
                                    {capitalizeName(leave.department_manager.name)}
                                </Text>
                            )}
                            {/* <View style={styles.signatureLine} /> */}
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
