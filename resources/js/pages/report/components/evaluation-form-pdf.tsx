import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface Evaluation {
    id: number;
    employee_id: number;
    employee_name: string;
    employeeid: string;
    department: string;
    position: string;
    picture: string | null;
    rating_date: string | null;
    evaluation_year: number | null;
    evaluation_period: number | null;
    period_label: string | null;
    total_rating: number | null;
    evaluator: string | null;
    observations: string | null;
    attendance: {
        days_late: number;
        days_absent: number;
        rating: number;
        remarks: string | null;
    } | null;
    attitudes: {
        supervisor_rating: number;
        supervisor_remarks: string | null;
        coworker_rating: number;
        coworker_remarks: string | null;
    } | null;
    workAttitude: {
        responsible: number;
        job_knowledge: number;
        cooperation: number;
        initiative: number;
        dependability: number;
        remarks: string | null;
    } | null;
    workFunctions: Array<{
        function_name: string;
        work_quality: number;
        work_efficiency: number;
    }>;
}

interface EvaluationFormPDFProps {
    evaluation: Evaluation;
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
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    table: {
        marginBottom: 15,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
        paddingVertical: 6,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
        paddingBottom: 5,
        marginBottom: 5,
        backgroundColor: '#f0f0f0',
        paddingVertical: 5,
    },
    tableCell: {
        fontSize: 9,
        paddingHorizontal: 5,
    },
    tableCellLabel: {
        flex: 2,
        fontSize: 9,
    },
    tableCellValue: {
        flex: 1,
        fontSize: 9,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    employeeInfo: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    infoLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        width: 100,
    },
    infoValue: {
        fontSize: 9,
    },
    ratingBox: {
        borderWidth: 1,
        borderColor: '#000',
        padding: 8,
        marginTop: 10,
        textAlign: 'center',
    },
    ratingValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    signatureSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    signatureBox: {
        width: '45%',
    },
    signatureLabel: {
        fontSize: 9,
        marginBottom: 4,
    },
    signatureLine: {
        borderBottomWidth: 0.8,
        borderColor: '#000',
        marginBottom: 4,
        height: 20,
    },
    remarksBox: {
        borderWidth: 0.5,
        borderColor: '#ccc',
        padding: 8,
        minHeight: 40,
        marginTop: 5,
    },
    remarksText: {
        fontSize: 9,
        lineHeight: 1.4,
    },
});

export default function EvaluationFormPDF({ evaluation }: EvaluationFormPDFProps) {
    // Format date for display
    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    // Capitalize name
    const capitalizeName = (name: string | null | undefined): string => {
        if (!name || typeof name !== 'string') {
            return '';
        }
        return name.trim().toUpperCase();
    };

    // Format rating
    const formatRating = (rating: number | null | undefined): string => {
        if (rating === null || rating === undefined) return 'N/A';
        return rating.toFixed(1);
    };

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
                    <Text style={styles.title}>Employee Performance Evaluation</Text>

                    {/* Employee Information */}
                    <View style={styles.employeeInfo}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Employee Name:</Text>
                            <Text style={styles.infoValue}>{capitalizeName(evaluation.employee_name)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Employee ID:</Text>
                            <Text style={styles.infoValue}>{evaluation.employeeid}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Department:</Text>
                            <Text style={styles.infoValue}>{evaluation.department}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Position:</Text>
                            <Text style={styles.infoValue}>{evaluation.position}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Evaluation Period:</Text>
                            <Text style={styles.infoValue}>
                                {evaluation.period_label || 'N/A'} {evaluation.evaluation_year || ''}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Rating Date:</Text>
                            <Text style={styles.infoValue}>{formatDate(evaluation.rating_date)}</Text>
                        </View>
                        {evaluation.evaluator && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Evaluator:</Text>
                                <Text style={styles.infoValue}>{capitalizeName(evaluation.evaluator)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Total Rating */}
                    <View style={styles.ratingBox}>
                        <Text style={{ fontSize: 10, marginBottom: 5 }}>TOTAL RATING</Text>
                        <Text style={styles.ratingValue}>{formatRating(evaluation.total_rating)} / 10.0</Text>
                    </View>

                    {/* Attendance Section */}
                    {evaluation.attendance && (
                        <>
                            <Text style={styles.sectionTitle}>1. Attendance</Text>
                            <View style={styles.table}>
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCellLabel}>Days Late:</Text>
                                    <Text style={styles.tableCellValue}>{evaluation.attendance.days_late}</Text>
                                </View>
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCellLabel}>Days Absent:</Text>
                                    <Text style={styles.tableCellValue}>{evaluation.attendance.days_absent}</Text>
                                </View>
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCellLabel}>Rating:</Text>
                                    <Text style={styles.tableCellValue}>{formatRating(evaluation.attendance.rating)}</Text>
                                </View>
                                {evaluation.attendance.remarks && (
                                    <View style={styles.remarksBox}>
                                        <Text style={styles.remarksText}>{evaluation.attendance.remarks}</Text>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {/* Work Attitude Section */}
                    {evaluation.workAttitude && (
                        <>
                            <Text style={styles.sectionTitle}>2. Work Attitude</Text>
                            <View style={styles.table}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>Criteria</Text>
                                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Rating</Text>
                                </View>
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCellLabel}>Responsible</Text>
                                    <Text style={styles.tableCellValue}>{formatRating(evaluation.workAttitude.responsible)}</Text>
                                </View>
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCellLabel}>Job Knowledge</Text>
                                    <Text style={styles.tableCellValue}>{formatRating(evaluation.workAttitude.job_knowledge)}</Text>
                                </View>
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCellLabel}>Cooperation</Text>
                                    <Text style={styles.tableCellValue}>{formatRating(evaluation.workAttitude.cooperation)}</Text>
                                </View>
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCellLabel}>Initiative</Text>
                                    <Text style={styles.tableCellValue}>{formatRating(evaluation.workAttitude.initiative)}</Text>
                                </View>
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCellLabel}>Dependability</Text>
                                    <Text style={styles.tableCellValue}>{formatRating(evaluation.workAttitude.dependability)}</Text>
                                </View>
                                {evaluation.workAttitude.remarks && (
                                    <View style={styles.remarksBox}>
                                        <Text style={styles.remarksText}>{evaluation.workAttitude.remarks}</Text>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {/* Attitudes Section */}
                    {evaluation.attitudes && (
                        <>
                            <Text style={styles.sectionTitle}>3. Attitudes</Text>
                            <View style={styles.table}>
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCellLabel}>Supervisor Rating:</Text>
                                    <Text style={styles.tableCellValue}>{formatRating(evaluation.attitudes.supervisor_rating)}</Text>
                                </View>
                                {evaluation.attitudes.supervisor_remarks && (
                                    <View style={styles.remarksBox}>
                                        <Text style={styles.remarksText}>Supervisor Remarks: {evaluation.attitudes.supervisor_remarks}</Text>
                                    </View>
                                )}
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCellLabel}>Coworker Rating:</Text>
                                    <Text style={styles.tableCellValue}>{formatRating(evaluation.attitudes.coworker_rating)}</Text>
                                </View>
                                {evaluation.attitudes.coworker_remarks && (
                                    <View style={styles.remarksBox}>
                                        <Text style={styles.remarksText}>Coworker Remarks: {evaluation.attitudes.coworker_remarks}</Text>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {/* Work Functions Section */}
                    {evaluation.workFunctions && evaluation.workFunctions.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>4. Work Functions</Text>
                            <View style={styles.table}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>Function</Text>
                                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Quality</Text>
                                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Efficiency</Text>
                                </View>
                                {evaluation.workFunctions.map((workFunction, index) => (
                                    <View key={index} style={styles.tableRow}>
                                        <Text style={styles.tableCellLabel}>{workFunction.function_name}</Text>
                                        <Text style={styles.tableCellValue}>{formatRating(workFunction.work_quality)}</Text>
                                        <Text style={styles.tableCellValue}>{formatRating(workFunction.work_efficiency)}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Observations */}
                    {evaluation.observations && (
                        <>
                            <Text style={styles.sectionTitle}>5. General Observations</Text>
                            <View style={styles.remarksBox}>
                                <Text style={styles.remarksText}>{evaluation.observations}</Text>
                            </View>
                        </>
                    )}

                    {/* Signatures */}
                    <View style={styles.signatureSection}>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>Evaluator:</Text>
                            <View style={styles.signatureLine} />
                            {evaluation.evaluator && (
                                <Text style={{ fontSize: 9, marginTop: 4, textDecoration: 'underline', fontWeight: 'bold' }}>
                                    {capitalizeName(evaluation.evaluator)}
                                </Text>
                            )}
                        </View>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>Date:</Text>
                            <View style={styles.signatureLine} />
                            <Text style={{ fontSize: 9, marginTop: 4 }}>{formatDate(evaluation.rating_date)}</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
