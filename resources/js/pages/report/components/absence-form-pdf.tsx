import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface Absence {
    id: string;
    absence_type: string;
    from_date: string;
    to_date: string;
    days: number;
    is_partial_day: boolean;
    status: string;
    reason: string;
    submitted_at: string;
    approved_at: string | null;
    hr_approved_at: string | null;
    employee_name: string;
    employeeid: string;
    department: string;
    position: string;
    picture: string | null;
    supervisor_approver: { id: number; name: string } | null;
    hr_approver: { id: number; name: string } | null;
    department_supervisor: { id: number; name: string } | null;
    department_hr: { id: number; name: string } | null;
}

interface AbsenceFormPDFProps {
    absence: Absence;
    hrEmployeeName: string;
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
    recipientSection: {
        marginBottom: 15,
    },
    recipientRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    recipientLabel: {
        fontSize: 11,
        width: 60,
    },
    recipientLine: {
        // Option 1: Use percentage width (adjust the percentage as needed: 40%, 50%, 60%, etc.)
        width: '30%',

        // Option 2: Use fixed pixel width (uncomment and adjust as needed)
        // width: 250,

        // Option 3: Use flex with maxWidth (uncomment and adjust)
        // flex: 1,
        // maxWidth: 250,

        borderBottomWidth: 0.8,
        borderColor: '#000',
        marginLeft: 10,
        minHeight: 15,
    },
    bodyText: {
        fontSize: 11,
        marginBottom: 15,
        lineHeight: 1.6,
    },
    bodyTextInline: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'baseline',
    },
    inlineBlank: {
        borderBottomWidth: 0.8,
        borderColor: '#000',
        minWidth: 100,
        marginHorizontal: 4,
        height: 12,
    },
    blankWithText: {
        borderBottomWidth: 0.8,
        borderColor: '#000',
        minWidth: 100,
        marginHorizontal: 4,
        paddingBottom: 2,
        minHeight: 12,
    },
    reasonLine: {
        borderBottomWidth: 0.8,
        borderColor: '#000',
        marginTop: 8,
        marginBottom: 8,
        minHeight: 15,
    },
    closing: {
        fontSize: 10,
        marginTop: 20,
    },
});

export default function AbsenceFormPDF({ absence, hrEmployeeName }: AbsenceFormPDFProps) {
    // DEBUG: Log absence data
    console.log('[AbsenceFormPDF] Debug - absence.days:', absence.days);
    console.log('[AbsenceFormPDF] Debug - typeof absence.days:', typeof absence.days);

    // Format date for display
    const formatDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    // Calculate resume date (day after to_date)
    const getResumeDate = (): string => {
        try {
            const toDate = new Date(absence.to_date);
            toDate.setDate(toDate.getDate() + 1);
            return format(toDate, 'MMMM dd, yyyy');
        } catch {
            return '';
        }
    };

    // Split reason into lines
    const reasonLines = absence.reason ? absence.reason.split('\n').filter((line) => line.trim()) : [];
    const displayLines = Math.max(1, reasonLines.length);

    // Use absence.days directly, same as employee-absenteeism-report.tsx
    // Ensure we always have a valid number to display
    let totalDays: number = 1;

    // First, try to use absence.days (same as report page uses)
    if (absence.days !== null && absence.days !== undefined) {
        const daysValue = Number(absence.days);
        if (!isNaN(daysValue) && daysValue > 0) {
            totalDays = Math.floor(daysValue);
        }
    }

    // Fallback: calculate from dates if days is not available or invalid
    if (totalDays === 1 && (!absence.days || absence.days === null || absence.days === undefined)) {
        try {
            const fromDate = new Date(absence.from_date);
            const toDate = new Date(absence.to_date);
            if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(0, 0, 0, 0);
                const diffTime = toDate.getTime() - fromDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                totalDays = diffDays > 0 ? diffDays : 1;
            }
        } catch (error) {
            console.error('[AbsenceFormPDF] Error calculating days fallback:', error);
        }
    }

    // Convert to string for display - ensure it's always a valid string
    const daysDisplay: string = totalDays > 0 ? String(totalDays) : '1';

    // DEBUG: Log the final value
    console.log('[AbsenceFormPDF] Debug - absence.days:', absence.days);
    console.log('[AbsenceFormPDF] Debug - typeof absence.days:', typeof absence.days);
    console.log('[AbsenceFormPDF] Debug - totalDays:', totalDays);
    console.log('[AbsenceFormPDF] Debug - daysDisplay:', daysDisplay);
    console.log('[AbsenceFormPDF] Debug - Will render:', daysDisplay);

    // DEBUG: Log date formatting
    console.log('[AbsenceFormPDF] Debug - absence.from_date:', absence.from_date);
    const formattedFromDate = formatDate(absence.from_date);
    console.log('[AbsenceFormPDF] Debug - formatted from_date:', formattedFromDate);
    console.log('[AbsenceFormPDF] Debug - absence.to_date:', absence.to_date);
    const formattedToDate = formatDate(absence.to_date);
    console.log('[AbsenceFormPDF] Debug - formatted to_date:', formattedToDate);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Background Logo */}
                <Image src="/Logo.png" style={styles.backgroundLogo} />

                {/* Content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
                        <Image src="/Logo.png" style={[styles.headerLogo, { marginLeft: 5 }]} />
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
                    <Text style={styles.title}>ABSENT FORM</Text>

                    {/* Recipient Section */}
                    <View style={styles.recipientSection}>
                        <View style={styles.recipientRow}>
                            <Text style={styles.recipientLabel}>TO :</Text>
                            <View style={styles.recipientLine}>
                                {absence.department_supervisor && (
                                    <Text
                                        style={{
                                            fontSize: 9,
                                            marginLeft: 4,
                                            marginTop: 2,

                                            flexShrink: 0,
                                        }}
                                    >
                                        {absence.department_supervisor.name.toUpperCase()}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.recipientRow}>
                            <Text style={styles.recipientLabel}>FROM :</Text>
                            <View style={styles.recipientLine}>
                                {absence.department_hr && (
                                    <Text
                                        style={{
                                            fontSize: 9,
                                            marginLeft: 4,
                                            marginTop: 2,

                                            flexShrink: 0,
                                        }}
                                    >
                                        {absence.department_hr.name.toUpperCase()}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.recipientRow}>
                            <Text style={styles.recipientLabel}>DATE :</Text>
                            <View style={styles.recipientLine}>
                                <Text style={{ fontSize: 11, marginLeft: 4, marginTop: 2 }}>{formatDate(absence.submitted_at)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Body Text */}
                    <View style={styles.bodyText}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8, flexWrap: 'wrap' }}>
                            <Text style={{ fontSize: 11 }}>This is to inform you that </Text>
                            {/* <View style={{ borderBottomWidth: 0.8, borderColor: '#000', width: 120, height: 12, marginLeft: 4 }}> */}
                            <Text style={{ fontSize: 11, marginLeft: 2, textDecoration: 'underline', fontWeight: 'bold' }}>{absence.employee_name.toUpperCase()}</Text>
                            {/* </View> */}
                            <Text style={{ fontSize: 11, marginBottom: 2 }}> file a leave of absence for   <Text style={{ fontSize: 11, marginLeft: 2, color: '#000000', textDecoration: 'underline', fontWeight: 'bold' }}>{daysDisplay || '0'}</Text></Text>
                        </View>

                        <View style={{ marginTop: 3, marginBottom: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4, flexWrap: 'wrap' }}>

                                <Text style={{ fontSize: 11 }}> days from </Text>

                                <Text style={{ fontSize: 11, marginLeft: 2, color: '#000000', textDecoration: 'underline', fontWeight: 'bold' }}>
                                    {formattedFromDate}
                                </Text>

                                <Text style={{ fontSize: 11 }}> to </Text>
                                <Text style={{ fontSize: 11, marginLeft: 2, color: '#000000', textDecoration: 'underline', fontWeight: 'bold' }}>{formattedToDate}</Text>

                                <Text style={{ fontSize: 11 }}> for the following reason/s</Text>
                            </View>
                        </View>
                    </View>

                    {/* Reason Lines */}
                    <View style={{ fontSize: 11, marginTop: 8, marginBottom: 15 }}>
                        {Array.from({ length: displayLines }).map((_, index) => {
                            const lineText = reasonLines[index] || '';
                            return (
                                <View key={index} style={styles.reasonLine}>
                                    {lineText ? <Text style={{ fontSize: 11, marginLeft: 4, marginTop: 2 }}>{lineText}</Text> : <Text> </Text>}
                                </View>
                            );
                        })}
                    </View>

                    {/* Resume Work Text */}
                    <View style={{ ...styles.bodyText }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <Text>Said worker/employee is officially on leave on the date above stated and will resume work on </Text>
                            <View style={{ borderBottomWidth: 0.8, borderColor: '#000', width: 120, height: 12, marginLeft: 4 }}>
                                <Text style={{ fontSize: 11, marginLeft: 2 }}>{getResumeDate()}</Text>
                            </View>
                            <Text>.</Text>
                        </View>
                    </View>

                    {/* Closing */}
                    <View style={{ ...styles.closing }}>
                        <Text>Thank you,</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
