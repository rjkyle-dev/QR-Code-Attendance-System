import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

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
    department_supervisor: { id: number; name: string } | null;
    department_manager: { id: number; name: string } | null;
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

interface AdminPDFProps {
    evaluation: Evaluation;
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fff',
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 9,
        position: 'relative',
    },
    backgroundLogo: {
        position: 'absolute',
        top: 200,
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
        alignItems: 'center',
        marginBottom: 15,
    },
    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        letterSpacing: 1,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    employeeInfo: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 20,
    },
    employeeInfoLeft: {
        flex: 1,
    },
    employeeInfoRow: {
        flexDirection: 'row',
        marginBottom: 5,
        alignItems: 'center',
    },
    employeeInfoLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        width: 100,
    },
    employeeInfoValue: {
        fontSize: 9,
        flex: 1,
        borderBottomWidth: 0.8,
        borderColor: '#000',
        paddingBottom: 2,
    },
    table: {
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#f0f0f0',
        paddingVertical: 4,
    },
    tableHeaderCell: {
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 2,
    },
    tableRow: {
        flexDirection: 'row',
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#000',
        minHeight: 20,
    },
    tableCell: {
        fontSize: 8,
        paddingHorizontal: 3,
        paddingVertical: 3,
        borderRightWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
    },
    tableCellCriteria: {
        flex: 3,
        fontSize: 8,
    },
    tableCellRating: {
        flex: 1,
        fontSize: 8,
        textAlign: 'center',
    },
    tableCellTotal: {
        flex: 1,
        fontSize: 8,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    tableCellRemarks: {
        flex: 2,
        fontSize: 7,
    },
    subRow: {
        paddingLeft: 15,
        fontSize: 7,
    },
    formulaText: {
        fontSize: 6,
        fontStyle: 'italic',
        paddingLeft: 15,
        marginTop: 2,
    },
    totalRatingSection: {
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'flex-end',
    },
    totalRatingLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    totalRatingValue: {
        fontSize: 12,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: '#000',
        padding: 5,
        minWidth: 60,
        textAlign: 'center',
    },
    observationsSection: {
        marginTop: 10,
        marginBottom: 10,
    },
    observationsLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    observationsBox: {
        borderWidth: 1,
        borderColor: '#000',
        minHeight: 60,
        padding: 5,
    },
    observationsText: {
        fontSize: 8,
        lineHeight: 1.4,
    },
    signatureSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    signatureBox: {
        width: '45%',
    },
    signatureLabel: {
        fontSize: 8,
        marginBottom: 3,
    },
    signatureName: {
        fontSize: 9,
        fontWeight: 'bold',
        minHeight: 15,
        textDecoration: 'underline',
    },
    signatureTitle: {
        fontSize: 8,
        marginTop: 2,
    },
    legend: {
        marginTop: 15,
        padding: 5,
        borderWidth: 1,
        borderColor: '#000',
    },
    legendTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    legendItem: {
        fontSize: 7,
        marginBottom: 2,
    },
});

export default function AdminPDF({ evaluation }: AdminPDFProps) {
    // Format rating
    const formatRating = (rating: number | null | string | undefined): string => {
        if (rating === null || rating === undefined || rating === '') return '-';
        const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
        if (isNaN(numRating)) return '-';
        return numRating.toFixed(1);
    };

    // Capitalize name
    const capitalizeName = (name: string | null | undefined): string => {
        if (!name || typeof name !== 'string') {
            return '';
        }
        return name.trim().toUpperCase();
    };

    // Calculate work attitude average
    const workAttitudeAvg = evaluation.workAttitude
        ? (evaluation.workAttitude.responsible +
              evaluation.workAttitude.job_knowledge +
              evaluation.workAttitude.cooperation +
              evaluation.workAttitude.initiative +
              evaluation.workAttitude.dependability) /
          5
        : 0;

    // Calculate work functions average
    const workFunctionsAvg =
        evaluation.workFunctions && evaluation.workFunctions.length > 0
            ? evaluation.workFunctions.reduce((sum, func) => {
                  const avg = (func.work_quality + func.work_efficiency) / 2;
                  return sum + avg;
              }, 0) / evaluation.workFunctions.length
            : 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Background Logo */}
                <Image src="/AGOC.png" style={styles.backgroundLogo} />

                {/* Content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.companyName}>CFARBEMPCO</Text>
                        <Text style={styles.title}>WORKERS EVALUATION</Text>
                    </View>

                    {/* Employee Information */}
                    <View style={styles.employeeInfo}>
                        <View style={styles.employeeInfoLeft}>
                            <View style={styles.employeeInfoRow}>
                                <Text style={styles.employeeInfoLabel}>DEPARTMENT:</Text>
                                <Text style={styles.employeeInfoValue}>{evaluation.department || 'ADMIN'}</Text>
                            </View>
                            <View style={styles.employeeInfoRow}>
                                <Text style={styles.employeeInfoLabel}>NAME OF WORKER:</Text>
                                <Text style={styles.employeeInfoValue}>{capitalizeName(evaluation.employee_name)}</Text>
                            </View>
                            <View style={styles.employeeInfoRow}>
                                <Text style={styles.employeeInfoLabel}>EMPLOYMENT STATUS:</Text>
                                <Text style={styles.employeeInfoValue}>{evaluation.position || ''}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Evaluation Table */}
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <View style={[styles.tableHeaderCell, styles.tableCellCriteria]}>
                                <Text>CRITERIA</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, styles.tableCellRating]}>
                                <Text>RATING (1-10)</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, styles.tableCellTotal]}>
                                <Text>TOTAL/AVG VG</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, styles.tableCellRemarks]}>
                                <Text>REMARKS</Text>
                            </View>
                        </View>

                        {/* 1. ATTENDANCE */}
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={{ fontWeight: 'bold' }}>1. ATTENDANCE</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}></View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}>
                                <Text>{formatRating(evaluation.attendance?.rating)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}>
                                <Text>{evaluation.attendance?.remarks || ''}</Text>
                            </View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={styles.subRow}>LATE</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}>
                                <Text>{evaluation.attendance?.days_late || 0}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}></View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}></View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={styles.subRow}>ABSENT</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}>
                                <Text>{evaluation.attendance?.days_absent || 0}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}></View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}></View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={styles.formulaText}>FORMULA(NO DAYS LATE OR ABSENT /24X10)-10 = RATING</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}></View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}></View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}></View>
                        </View>

                        {/* 2. ATTITUDE TOWARDS SUPERVISOR */}
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={{ fontWeight: 'bold' }}>2. ATTITUDE TOWARDS SUPERVISOR</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}>
                                <Text>{formatRating(evaluation.attitudes?.supervisor_rating)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}>
                                <Text>{formatRating(evaluation.attitudes?.supervisor_rating)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}>
                                <Text>{evaluation.attitudes?.supervisor_remarks || ''}</Text>
                            </View>
                        </View>

                        {/* 3. ATTITUDE TOWARDS CO-WORKER */}
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={{ fontWeight: 'bold' }}>3. ATTITUDE TOWARDS CO-WORKER</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}>
                                <Text>{formatRating(evaluation.attitudes?.coworker_rating)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}>
                                <Text>{formatRating(evaluation.attitudes?.coworker_rating)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}>
                                <Text>{evaluation.attitudes?.coworker_remarks || ''}</Text>
                            </View>
                        </View>

                        {/* 4. WORK ATTITUDE/PERFORMANCE */}
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={{ fontWeight: 'bold' }}>4. WORK ATTITUDE/PERFORMANCE</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}></View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}>
                                <Text>{formatRating(workAttitudeAvg)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}>
                                <Text>{evaluation.workAttitude?.remarks || ''}</Text>
                            </View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={styles.subRow}>RESPONSIBLE IN WORK ASSIGNMENT</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}>
                                <Text>{formatRating(evaluation.workAttitude?.responsible)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}></View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}></View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={styles.subRow}>WORK INITIATIVE</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}>
                                <Text>{formatRating(evaluation.workAttitude?.initiative)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}></View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}></View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={styles.subRow}>JOB KNOWLEDGE</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}>
                                <Text>{formatRating(evaluation.workAttitude?.job_knowledge)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}></View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}></View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={styles.subRow}>DEPENDABILITY</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}>
                                <Text>{formatRating(evaluation.workAttitude?.dependability)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}></View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}></View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={styles.subRow}>COOPERATION</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRating]}>
                                <Text>{formatRating(evaluation.workAttitude?.cooperation)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}></View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}></View>
                        </View>

                        {/* 5. WORK FUNCTIONS - Special structure with two rating columns */}
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                <Text style={{ fontWeight: 'bold' }}>5. WORK FUNCTIONS</Text>
                            </View>
                            <View style={[styles.tableCell, { flex: 1, flexDirection: 'row' }]}>
                                <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 2 }}>
                                    <Text style={{ fontSize: 7, textAlign: 'center' }}>WORK QUALITY (1-10)</Text>
                                </View>
                                <View style={{ flex: 1, padding: 2 }}>
                                    <Text style={{ fontSize: 7, textAlign: 'center' }}>EFFICIENCY (1-10)</Text>
                                </View>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellTotal]}>
                                <Text>{formatRating(workFunctionsAvg)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellRemarks]}></View>
                        </View>
                        {evaluation.workFunctions && evaluation.workFunctions.length > 0 ? (
                            evaluation.workFunctions.map((workFunction, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                        <Text style={styles.subRow}>{workFunction.function_name.toUpperCase()}</Text>
                                    </View>
                                    <View style={[styles.tableCell, { flex: 1, flexDirection: 'row' }]}>
                                        <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 2, justifyContent: 'center' }}>
                                            <Text style={{ textAlign: 'center' }}>{formatRating(workFunction.work_quality)}</Text>
                                        </View>
                                        <View style={{ flex: 1, padding: 2, justifyContent: 'center' }}>
                                            <Text style={{ textAlign: 'center' }}>{formatRating(workFunction.work_efficiency)}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.tableCell, styles.tableCellTotal]}></View>
                                    <View style={[styles.tableCell, styles.tableCellRemarks]}></View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.tableRow}>
                                <View style={[styles.tableCell, styles.tableCellCriteria]}>
                                    <Text style={styles.subRow}>-</Text>
                                </View>
                                <View style={[styles.tableCell, { flex: 1, flexDirection: 'row' }]}>
                                    <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 2 }}>
                                        <Text style={{ textAlign: 'center' }}>-</Text>
                                    </View>
                                    <View style={{ flex: 1, padding: 2 }}>
                                        <Text style={{ textAlign: 'center' }}>-</Text>
                                    </View>
                                </View>
                                <View style={[styles.tableCell, styles.tableCellTotal]}></View>
                                <View style={[styles.tableCell, styles.tableCellRemarks]}></View>
                            </View>
                        )}
                    </View>

                    {/* TOTAL RATING */}
                    <View style={styles.totalRatingSection}>
                        <Text style={styles.totalRatingLabel}>TOTAL RATING:</Text>
                        <Text style={styles.totalRatingValue}>{formatRating(evaluation.total_rating)}</Text>
                    </View>

                    {/* OBSERVATIONS/COMMENTS */}
                    <View style={styles.observationsSection}>
                        <Text style={styles.observationsLabel}>OBSERVATIONS/COMMENTS:</Text>
                        <View style={styles.observationsBox}>
                            <Text style={styles.observationsText}>{evaluation.observations || ''}</Text>
                        </View>
                    </View>

                    {/* Signatures */}
                    <View style={styles.signatureSection}>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>EVALUATED BY:</Text>
                            {evaluation.department_supervisor?.name && (
                                <Text style={styles.signatureName}>{capitalizeName(evaluation.department_supervisor.name)}</Text>
                            )}

                            <Text style={styles.signatureTitle}>SUPERVISOR</Text>
                        </View>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>APPROVED BY:</Text>
                            {evaluation.department_manager?.name && (
                                <Text style={styles.signatureName}>{capitalizeName(evaluation.department_manager.name)}</Text>
                            )}
                            <View style={{ borderBottomWidth: 0.8, borderColor: '#000', minHeight: 15, marginTop: 5, marginBottom: 50 }} />
                            <Text style={styles.signatureTitle}>MANAGER</Text>
                        </View>
                    </View>

                    {/* Legend */}
                    <View style={styles.legend}>
                        <Text style={styles.legendTitle}>LEGEND:</Text>
                        <Text style={styles.legendItem}>1-4: Fail</Text>
                        <Text style={styles.legendItem}>5-7: Satisfactory</Text>
                        <Text style={styles.legendItem}>8-9: Very Satisfactory</Text>
                        <Text style={styles.legendItem}>10: Excellent</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
