import { Document, Image, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface ResumeToWorkRequest {
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

interface ResumeToWorkPDFProps {
    request: ResumeToWorkRequest;
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
        marginBottom: 30,
        textTransform: 'uppercase',
    },
    memoField: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-end',
    },
    memoLabel: {
        fontSize: 10,
        width: 50,
    },
    memoLine: {
        borderBottomWidth: 0.8,
        borderColor: '#000',
        flex: 1,
        marginLeft: 8,
        marginBottom: 2,
        minHeight: 15,
        width: '100%',
        maxWidth: '30%',
    },
    bodyText: {
        fontSize: 10,
        marginTop: 20,
        marginBottom: 15,
        lineHeight: 1.5,
    },
    bodyTextInline: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
    },
    bodyTextPart: {
        fontSize: 10,
    },
    bodyTextLine: {
        borderBottomWidth: 0.8,
        borderColor: '#000',
        minWidth: 150,
        marginHorizontal: 4,
        marginBottom: 2,
        minHeight: 15,
    },
    closing: {
        fontSize: 10,
        marginTop: 30,
        marginBottom: 20,
    },
    signatureName: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    signatureTitle: {
        fontSize: 10,
    },
});

export default function ResumeToWorkPDF({ request }: ResumeToWorkPDFProps) {
    // Format date for display
    const formatDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    // Format date for memo (short format)
    const formatDateShort = (dateString: string): string => {
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

    // Get HR Officer name (from hr_officer_name, processed_by, or default)
    const getHROfficerName = (): string => {
        if (request.hr_officer_name) {
            return capitalizeName(request.hr_officer_name);
        }
        if (request.processed_by) {
            return capitalizeName(request.processed_by);
        }
        return 'ROVILYN B. VILLANUEVA'; // Default HR Officer name
    };

    // Get current date for the memo
    const getCurrentDate = (): string => {
        return formatDateShort(new Date().toISOString());
    };

    const ResumeToWorkDocument = () => (
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
                    <Text style={styles.title}>RESUME TO WORK FROM</Text>

                    {/* Memo Fields */}
                    <View style={styles.memoField}>
                        <Text style={styles.memoLabel}>TO:</Text>
                        <View style={styles.memoLine}>
                            {request.supervisor_name && (
                                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{capitalizeName(request.supervisor_name)}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.memoField}>
                        <Text style={styles.memoLabel}>FROM:</Text>
                        <View style={styles.memoLine}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{getHROfficerName()}</Text>
                        </View>
                    </View>

                    <View style={styles.memoField}>
                        <Text style={styles.memoLabel}>DATE:</Text>
                        <View style={styles.memoLine}>
                            <Text style={{ fontSize: 10 }}>{getCurrentDate()}</Text>
                        </View>
                    </View>

                    {/* Body Text */}
                    <View style={styles.bodyText}>
                        <View style={styles.bodyTextInline}>
                            <Text style={styles.bodyTextPart}>Please be inform that </Text>
                            <View style={styles.bodyTextLine}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{capitalizeName(request.employee_name)}</Text>
                            </View>
                            <Text style={styles.bodyTextPart}> will resume work on </Text>
                            <View style={styles.bodyTextLine}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{formatDateShort(request.return_date)}</Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: 10, marginTop: 8 }}>Kindly accommodate said employee in your workforce.</Text>
                    </View>

                    {/* Closing */}
                    <Text style={styles.closing}>Thank you,</Text>

                    {/* Signature Block */}
                    <View style={{ marginTop: 30 }}>
                        <Text style={styles.signatureName}>{getHROfficerName()}</Text>
                        <Text style={styles.signatureTitle}>HR Officer</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );

    return (
        <PDFViewer
            width="100%"
            height="100%"
            style={{
                borderRadius: '0',
                border: 'none',
            }}
            showToolbar={true}
        >
            <ResumeToWorkDocument />
        </PDFViewer>
    );
}
