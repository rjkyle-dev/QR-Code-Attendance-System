import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

interface GenderDistribution {
    male: number;
    female: number;
    total: number;
}

interface AgeRangeDistribution {
    '20-30': { male: number; female: number; total: number };
    '31-40': { male: number; female: number; total: number };
    '41-50': { male: number; female: number; total: number };
    '51+': { male: number; female: number; total: number };
}

interface GenderDevelopmentPDFProps {
    genderDistribution: GenderDistribution;
    ageRangeDistribution: AgeRangeDistribution;
    observations?: string;
    preparedBy?: string;
    notedBy?: string;
}

// Helper function to calculate percentage
const getPercentage = (value: number, total: number): string => {
    if (total === 0) return '0.00';
    return ((value / total) * 100).toFixed(2);
};

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fff',
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    companyName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    title: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    // Table styles
    table: {
        borderWidth: 0.8,
        borderColor: '#000',
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 0.8,
        borderColor: '#000',
    },
    tableHeaderCell: {
        padding: 6,
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#000',
        minHeight: 20,
    },
    tableCell: {
        padding: 6,
        fontSize: 9,
        borderRightWidth: 0.5,
        borderColor: '#000',
    },
    tableCellCenter: {
        padding: 6,
        fontSize: 9,
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#000',
    },
    tableCellBold: {
        padding: 6,
        fontSize: 9,
        fontWeight: 'bold',
        borderRightWidth: 0.5,
        borderColor: '#000',
    },
    tableCellBoldCenter: {
        padding: 6,
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#000',
    },
    // Observations section
    observationsSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    observationsTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    observationsLine: {
        borderBottomWidth: 0.8,
        borderColor: '#000',
        marginBottom: 4,
        height: 15,
    },
    // Prepared By section
    preparedBySection: {
        marginTop: 20,
    },
    preparedByTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    preparedByLine: {
        borderBottomWidth: 0.8,
        borderColor: '#000',
        marginBottom: 4,
        height: 15,
        width: '60%',
    },
    preparedByName: {
        fontSize: 9,
        marginTop: 4,
    },
});

export default function GenderDevelopmentPDF({
    genderDistribution,
    ageRangeDistribution,
    observations = '',
    preparedBy = '',
    notedBy = '',
}: GenderDevelopmentPDFProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.companyName}>CFARBEMPCO</Text>
                    <Text style={styles.title}>GENDER AND DEVELOPMENT REPORT</Text>
                </View>

                {/* Gender Distribution Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gender Distribution Summary</Text>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <View style={[styles.tableHeaderCell, { width: '40%' }]}>
                                <Text>Gender</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { width: '30%' }]}>
                                <Text>Total Employees</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { width: '30%', borderRightWidth: 0 }]}>
                                <Text>Percentage</Text>
                            </View>
                        </View>
                        {/* Table Rows */}
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, { width: '40%' }]}>
                                <Text>Male</Text>
                            </View>
                            <View style={[styles.tableCellCenter, { width: '30%' }]}>
                                <Text>{genderDistribution.male}</Text>
                            </View>
                            <View style={[styles.tableCellCenter, { width: '30%', borderRightWidth: 0 }]}>
                                <Text>{getPercentage(genderDistribution.male, genderDistribution.total)}%</Text>
                            </View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCell, { width: '40%' }]}>
                                <Text>Female</Text>
                            </View>
                            <View style={[styles.tableCellCenter, { width: '30%' }]}>
                                <Text>{genderDistribution.female}</Text>
                            </View>
                            <View style={[styles.tableCellCenter, { width: '30%', borderRightWidth: 0 }]}>
                                <Text>{getPercentage(genderDistribution.female, genderDistribution.total)}%</Text>
                            </View>
                        </View>
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCellBold, { width: '40%' }]}>
                                <Text>Total</Text>
                            </View>
                            <View style={[styles.tableCellBoldCenter, { width: '30%' }]}>
                                <Text>{genderDistribution.total}</Text>
                            </View>
                            <View style={[styles.tableCellBoldCenter, { width: '30%', borderRightWidth: 0 }]}>
                                <Text>100.00%</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Age Range Distribution by Gender */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Age Range Distribution by Gender</Text>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <View style={[styles.tableHeaderCell, { width: '25%' }]}>
                                <Text>Age Range</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { width: '18.75%' }]}>
                                <Text>Male</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { width: '18.75%' }]}>
                                <Text>Female</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { width: '18.75%' }]}>
                                <Text>Total</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { width: '18.75%', borderRightWidth: 0 }]}>
                                <Text>Percentage</Text>
                            </View>
                        </View>
                        {/* Table Rows */}
                        {(['20-30', '31-40', '41-50', '51+'] as const).map((range) => {
                            const data = ageRangeDistribution[range];
                            const rangeTotal = data.male + data.female;
                            const rangePercentage = getPercentage(rangeTotal, genderDistribution.total);
                            return (
                                <View key={range} style={styles.tableRow}>
                                    <View style={[styles.tableCell, { width: '25%' }]}>
                                        <Text>{range} years old</Text>
                                    </View>
                                    <View style={[styles.tableCellCenter, { width: '18.75%' }]}>
                                        <Text>{data.male}</Text>
                                    </View>
                                    <View style={[styles.tableCellCenter, { width: '18.75%' }]}>
                                        <Text>{data.female}</Text>
                                    </View>
                                    <View style={[styles.tableCellCenter, { width: '18.75%' }]}>
                                        <Text>{rangeTotal}</Text>
                                    </View>
                                    <View style={[styles.tableCellCenter, { width: '18.75%', borderRightWidth: 0 }]}>
                                        <Text>{rangePercentage}%</Text>
                                    </View>
                                </View>
                            );
                        })}
                        {/* Total Row */}
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCellBold, { width: '25%' }]}>
                                <Text>Total</Text>
                            </View>
                            <View style={[styles.tableCellBoldCenter, { width: '18.75%' }]}>
                                <Text>{genderDistribution.male}</Text>
                            </View>
                            <View style={[styles.tableCellBoldCenter, { width: '18.75%' }]}>
                                <Text>{genderDistribution.female}</Text>
                            </View>
                            <View style={[styles.tableCellBoldCenter, { width: '18.75%' }]}>
                                <Text>{genderDistribution.total}</Text>
                            </View>
                            <View style={[styles.tableCellBoldCenter, { width: '18.75%', borderRightWidth: 0 }]}>
                                <Text>100.00%</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Observations / Remarks */}
                <View style={styles.observationsSection}>
                    <Text style={styles.observationsTitle}>Observations / Remarks:</Text>
                    {observations ? (
                        <Text style={{ fontSize: 9, marginTop: 4 }}>{observations}</Text>
                    ) : (
                        <>
                            <View style={styles.observationsLine} />
                            <View style={styles.observationsLine} />
                            <View style={styles.observationsLine} />
                        </>
                    )}
                </View>

                {/* Prepared By and Noted By */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                    <View style={{ width: '45%' }}>
                        <Text style={styles.preparedByTitle}>Prepared By:</Text>
                        {preparedBy ? (
                            <>
                                <View style={styles.preparedByLine} />
                                <Text style={styles.preparedByName}>{preparedBy}</Text>
                            </>
                        ) : (
                            <View style={styles.preparedByLine} />
                        )}
                    </View>
                    <View style={{ width: '45%' }}>
                        <Text style={styles.preparedByTitle}>Noted By:</Text>
                        {notedBy ? (
                            <>
                                <View style={styles.preparedByLine} />
                                <Text style={styles.preparedByName}>{notedBy}</Text>
                            </>
                        ) : (
                            <View style={styles.preparedByLine} />
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    );
}
