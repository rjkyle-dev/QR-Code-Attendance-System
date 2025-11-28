import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface MicroteamEmployee {
    id: string;
    employee_name: string;
    employeeid: string;
    work_status: string;
    position: string;
    time_in: string | null;
    time_out: string | null;
}

interface MicroteamData {
    'MICROTEAM - 01': MicroteamEmployee[];
    'MICROTEAM - 02': MicroteamEmployee[];
    'MICROTEAM - 03': MicroteamEmployee[];
}

interface AddCrewData {
    'ADD CREW - 01': MicroteamEmployee[];
    'ADD CREW - 02': MicroteamEmployee[];
    'ADD CREW - 03': MicroteamEmployee[];
}

interface DailyAttendancePDFProps {
    reportDate: Date;
    microteams: MicroteamData;
    addCrew?: AddCrewData;
    ph?: string;
    hrName?: string;
    managerName?: string;
}

// Helper function to format time
const formatTime = (timeStr: string | null): string => {
    if (!timeStr) return '';
    if (timeStr.includes(':')) {
        const parts = timeStr.split(':');
        return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
};

// Helper function to format employee name: "Lastname FirstInitial."
// Example: "RJ Kyle G. Labrador" -> "Labrador R."
const formatEmployeeName = (fullName: string): string => {
    if (!fullName || !fullName.trim()) return '';

    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length === 0) return '';

    // Last part is the last name
    const lastName = nameParts[nameParts.length - 1];

    // First part is the first name, get its first character
    const firstName = nameParts[0];
    const firstInitial = firstName.charAt(0).toUpperCase();

    return `${lastName} ${firstInitial}.`;
};

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fff',
        padding: 10,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    headerLeft: {
        flexDirection: 'column',
        width: '25%',
    },
    companyName: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
        marginTop: 35,
    },
    phRow: {
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 10,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 35,
    },
    title: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        width: '25%',
        fontSize: 10,
        marginTop: 35,
    },
    dateRow: {
        marginBottom: 1,
    },
    bold: {
        fontWeight: 'bold',
    },
    // Table styles
    tableContainer: {
        flexDirection: 'row',
        marginBottom: 3,
        gap: 5,
    },
    microteamTable: {
        flex: 1,
        borderWidth: 0.8,
        borderColor: '#000',
        marginTop: 10,
    },
    addCrewTable: {
        flex: 1,
        borderWidth: 0.8,
        borderColor: '#000',
        marginTop: 10,
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 0.8,
        borderColor: '#000',
        padding: 2,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#000',
        minHeight: 8,
    },
    tableCellNo: {
        width: '15%',
        borderRightWidth: 0.5,
        borderColor: '#000',
        padding: 1,
        fontSize: 10,
        textAlign: 'center',
    },
    tableCellName: {
        width: '45%',
        borderRightWidth: 0.5,
        borderColor: '#000',
        padding: 1,
        fontSize: 10,
    },
    tableCellRemarks: {
        width: '40%',
        padding: 1,
        fontSize: 10,
    },
    columnHeaderRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.8,
        borderColor: '#000',
        backgroundColor: '#f0f0f0',
    },
    columnHeaderCell: {
        borderRightWidth: 0.5,
        borderColor: '#000',
        padding: 6,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Summary table
    summaryTable: {
        borderWidth: 0.8,
        borderColor: '#000',
        marginBottom: 4,
        marginTop: 10,
    },
    summaryHeader: {
        flexDirection: 'row',
        borderBottomWidth: 0.8,
        borderColor: '#000',
        backgroundColor: '#f0f0f0',
    },
    summaryHeaderCell: {
        padding: 6,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#000',
    },
    summaryRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#000',
        minHeight: 8,
    },
    summaryCellLabel: {
        width: '40%',
        padding: 2,
        fontSize: 10,
        borderRightWidth: 0.5,
        borderColor: '#000',
    },
    summaryCell: {
        width: '15%',
        padding: 2,
        fontSize: 10,
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#000',
    },
    // Signatories
    signatories: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 5,
    },
    signatory: {
        alignItems: 'center',
        width: '30%',
    },
    signatoryLabel: {
        fontSize: 10,
        marginBottom: 1,
    },
    signatoryLine: {
        width: '80%',
        borderBottomWidth: 0.8,
        borderColor: '#000',
        marginBottom: 2,
        height: 1,
    },
    signatoryName: {
        fontSize: 10,
        textAlign: 'center',
    },
});

export default function DailyAttendancePDF({
    reportDate,
    microteams,
    addCrew,
    ph = '',
    hrName = 'HR Personnel',
    managerName = 'Manager',
}: DailyAttendancePDFProps) {
    const defaultAddCrew: AddCrewData = {
        'ADD CREW - 01': [],
        'ADD CREW - 02': [],
        'ADD CREW - 03': [],
    };
    const addCrewData = addCrew || defaultAddCrew;
    const titleDate = format(reportDate, 'MMMM dd, yyyy');
    const titleDay = format(reportDate, 'EEEE');

    // Helper function to count all displayed employees (regardless of time_in/time_out status)
    const countAllEmployees = (employees: MicroteamEmployee[]): number => {
        return employees.filter((emp) => emp).length;
    };

    // Calculate summary counts
    const calculateSummaryCounts = () => {
        // Present Regular counts for each microteam - count ALL displayed employees
        const presentRegularM1 = countAllEmployees(microteams['MICROTEAM - 01'] || []);
        const presentRegularM2 = countAllEmployees(microteams['MICROTEAM - 02'] || []);
        const presentRegularM3 = countAllEmployees(microteams['MICROTEAM - 03'] || []);
        const presentRegularTotal = presentRegularM1 + presentRegularM2 + presentRegularM3;

        // Add Crew counts for each group - count ALL displayed employees
        const addCrewM1 = countAllEmployees(addCrewData['ADD CREW - 01'] || []);
        const addCrewM2 = countAllEmployees(addCrewData['ADD CREW - 02'] || []);
        const addCrewM3 = countAllEmployees(addCrewData['ADD CREW - 03'] || []);
        const addCrewTotal = addCrewM1 + addCrewM2 + addCrewM3;

        // Total (Present Regular + Add Crew)
        const totalM1 = presentRegularM1 + addCrewM1;
        const totalM2 = presentRegularM2 + addCrewM2;
        const totalM3 = presentRegularM3 + addCrewM3;
        const totalOverall = presentRegularTotal + addCrewTotal;

        return {
            presentRegular: {
                m1: presentRegularM1,
                m2: presentRegularM2,
                m3: presentRegularM3,
                total: presentRegularTotal,
            },
            addCrew: {
                m1: addCrewM1,
                m2: addCrewM2,
                m3: addCrewM3,
                total: addCrewTotal,
            },
            total: {
                m1: totalM1,
                m2: totalM2,
                m3: totalM3,
                total: totalOverall,
            },
        };
    };

    // Calculate summary counts once
    const summaryCounts = calculateSummaryCounts();

    // Get summary value for a specific row and column
    const getSummaryValue = (rowName: string, column: 'm1' | 'm2' | 'm3' | 'total'): string => {
        switch (rowName) {
            case 'PRESENT REGULAR':
                return summaryCounts.presentRegular[column].toString();
            case 'ADD CREW':
                return summaryCounts.addCrew[column].toString();
            case 'TOTAL':
                return summaryCounts.total[column].toString();
            default:
                return ''; // Other rows (AWP, AWOP/AWOL, etc.) remain empty for now
        }
    };

    // Render a table row
    const renderTableRow = (index: number, employee?: MicroteamEmployee) => {
        const no = String(index + 1).padStart(2, '0');
        const name = employee?.employee_name ? formatEmployeeName(employee.employee_name) : '';
        const remarks = employee?.time_in && employee?.time_out ? 'Present' : '';

        return (
            <View key={index} style={styles.tableRow}>
                <View style={styles.tableCellNo}>
                    <Text>{no}</Text>
                </View>
                <View style={styles.tableCellName}>
                    <Text>{name}</Text>
                </View>
                <View style={styles.tableCellRemarks}>
                    <Text>{remarks}</Text>
                </View>
            </View>
        );
    };

    // Render a microteam table
    const renderMicroteamTable = (title: string, employees: MicroteamEmployee[]) => {
        const maxRows = 25;
        const rowsToShow = Math.max(maxRows, employees.length);

        return (
            <View style={styles.microteamTable}>
                <View style={styles.tableHeader}>
                    <Text>{title}</Text>
                </View>
                {/* Column Headers */}
                <View style={styles.columnHeaderRow}>
                    <View style={[styles.columnHeaderCell, styles.tableCellNo]}>
                        <Text>No</Text>
                    </View>
                    <View style={[styles.columnHeaderCell, styles.tableCellName]}>
                        <Text>Name</Text>
                    </View>
                    <View style={[styles.columnHeaderCell, styles.tableCellRemarks, { borderRightWidth: 0 }]}>
                        <Text>Remarks</Text>
                    </View>
                </View>
                {Array.from({ length: rowsToShow }).map((_, i) => renderTableRow(i, employees[i]))}
            </View>
        );
    };

    // Render an ADD CREW table
    const renderAddCrewTable = (title: string, employees: MicroteamEmployee[]) => {
        const maxRows = 8;
        const rowsToShow = Math.max(maxRows, employees.length);

        return (
            <View style={styles.addCrewTable}>
                <View style={styles.tableHeader}>
                    <Text>{title}</Text>
                </View>
                {/* Column Headers */}
                <View style={styles.columnHeaderRow}>
                    <View style={[styles.columnHeaderCell, styles.tableCellNo]}>
                        <Text>No</Text>
                    </View>
                    <View style={[styles.columnHeaderCell, styles.tableCellName]}>
                        <Text>Name</Text>
                    </View>
                    <View style={[styles.columnHeaderCell, styles.tableCellRemarks, { borderRightWidth: 0 }]}>
                        <Text>Remarks</Text>
                    </View>
                </View>
                {Array.from({ length: rowsToShow }).map((_, i) => renderTableRow(i, employees[i]))}
            </View>
        );
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>CFARBEMPCO</Text>
                        <View style={styles.phRow}>
                            <Text style={styles.bold}>PH:</Text>
                            <Text style={{ marginLeft: 4 }}>{ph || '_________'}</Text>
                        </View>
                    </View>
                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>Daily Attendance Report (DTR)</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.dateRow}>
                            <Text>
                                <Text style={styles.bold}>Date:</Text> {titleDate}
                            </Text>
                        </View>
                        <View style={styles.dateRow}>
                            <Text>
                                <Text style={styles.bold}>Day:</Text> {titleDay}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Microteam Tables */}
                <View style={styles.tableContainer}>
                    {renderMicroteamTable('MICROTEAM - 01', microteams['MICROTEAM - 01'] || [])}
                    {renderMicroteamTable('MICROTEAM - 02', microteams['MICROTEAM - 02'] || [])}
                    {renderMicroteamTable('MICROTEAM - 03', microteams['MICROTEAM - 03'] || [])}
                </View>

                {/* ADD CREW Tables */}
                <View style={styles.tableContainer}>
                    {renderAddCrewTable('ADD CREW - 01', addCrewData['ADD CREW - 01'] || [])}
                    {renderAddCrewTable('ADD CREW - 02', addCrewData['ADD CREW - 02'] || [])}
                    {renderAddCrewTable('ADD CREW - 03', addCrewData['ADD CREW - 03'] || [])}
                </View>

                {/* Summary Table */}
                <View style={styles.summaryTable}>
                    <View style={styles.summaryHeader}>
                        <View style={[styles.summaryHeaderCell, { width: '40%' }]}>
                            <Text>Summary:</Text>
                        </View>
                        <View style={[styles.summaryHeaderCell, { width: '15%' }]}>
                            <Text>M1</Text>
                        </View>
                        <View style={[styles.summaryHeaderCell, { width: '15%' }]}>
                            <Text>M2</Text>
                        </View>
                        <View style={[styles.summaryHeaderCell, { width: '15%' }]}>
                            <Text>M3</Text>
                        </View>
                        <View style={[styles.summaryHeaderCell, { width: '15%', borderRightWidth: 0 }]}>
                            <Text>TOTAL</Text>
                        </View>
                    </View>
                    {['PRESENT REGULAR', 'ADD CREW', 'TOTAL', 'AWP', 'AWOP/AWOL', 'NL/SL/VL/EL', 'OUTSIDE/CW/SD/FR', 'OVERALL TOTAL'].map((row) => (
                        <View key={row} style={styles.summaryRow}>
                            <View style={styles.summaryCellLabel}>
                                <Text>{row}</Text>
                            </View>
                            <View style={styles.summaryCell}>
                                <Text>{getSummaryValue(row, 'm1')}</Text>
                            </View>
                            <View style={styles.summaryCell}>
                                <Text>{getSummaryValue(row, 'm2')}</Text>
                            </View>
                            <View style={styles.summaryCell}>
                                <Text>{getSummaryValue(row, 'm3')}</Text>
                            </View>
                            <View style={[styles.summaryCell, { borderRightWidth: 0 }]}>
                                <Text>{getSummaryValue(row, 'total')}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Signatories */}
                <View style={styles.signatories}>
                    <View style={styles.signatory}>
                        <Text style={styles.signatoryLabel}>Prepared By:</Text>
                        <Text style={[styles.signatoryName, { textDecoration: 'underline', marginTop: 8 }]}>PHMC</Text>
                    </View>
                    <View style={styles.signatory}>
                        <Text style={styles.signatoryLabel}>Noted by:</Text>
                        <Text style={[styles.signatoryName, { textDecoration: 'underline', marginTop: 8 }]}>{hrName}</Text>
                    </View>
                    <View style={styles.signatory}>
                        <Text style={styles.signatoryLabel}>Approved by:</Text>
                        <Text style={[styles.signatoryName, { textDecoration: 'underline', marginTop: 8 }]}>{managerName}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
