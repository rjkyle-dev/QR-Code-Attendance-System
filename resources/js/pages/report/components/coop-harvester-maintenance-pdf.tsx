import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface HarvesterMaintenanceEmployee {
    id: string;
    employee_name: string;
    employeeid: string;
    work_status: string;
    position: string;
    time_in: string | null;
    time_out: string | null;
}

interface HarvesterMaintenanceData {
    group1: HarvesterMaintenanceEmployee[];
    group2: HarvesterMaintenanceEmployee[];
    group3: HarvesterMaintenanceEmployee[];
    spare: HarvesterMaintenanceEmployee[];
}

interface CoopHarvesterMaintenancePDFProps {
    reportDate: Date;
    data: HarvesterMaintenanceData;
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

// Helper function to split employee name into last name and first name
const splitEmployeeName = (fullName: string): { lastName: string; firstName: string } => {
    if (!fullName || !fullName.trim()) return { lastName: '', firstName: '' };

    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length === 0) return { lastName: '', firstName: '' };

    // Last part is the last name
    const lastName = nameParts[nameParts.length - 1];

    // All other parts are the first name (including middle initial)
    const firstName = nameParts.slice(0, -1).join(' ');

    return { lastName, firstName };
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
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '25%',
        marginTop: 20,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    headerRight: {
        width: '25%',
        marginTop: 20,
    },
    companyName: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
        textAlign: 'center',
    },
    areaName: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
        textAlign: 'center',
    },
    dateRow: {
        marginTop: 3,
        fontSize: 10,
    },
    bold: {
        fontWeight: 'bold',
    },
    // Table styles
    tableContainer: {
        marginBottom: 15,
    },
    table: {
        borderWidth: 0.8,
        borderColor: '#000',
        marginTop: 5,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 0.8,
        borderColor: '#000',
    },
    tableHeaderCell: {
        borderRightWidth: 0.5,
        borderColor: '#000',
        padding: 4,
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#000',
        minHeight: 12,
    },
    tableCellNo: {
        width: '8%',
        borderRightWidth: 0.5,
        borderColor: '#000',
        padding: 3,
        fontSize: 9,
        textAlign: 'center',
    },
    tableCellLastName: {
        width: '20%',
        borderRightWidth: 0.5,
        borderColor: '#000',
        padding: 3,
        fontSize: 9,
    },
    tableCellFirstName: {
        width: '20%',
        borderRightWidth: 0.5,
        borderColor: '#000',
        padding: 3,
        fontSize: 9,
    },
    tableCellTimeIn: {
        width: '13%',
        borderRightWidth: 0.5,
        borderColor: '#000',
        padding: 3,
        fontSize: 9,
        textAlign: 'center',
    },
    tableCellTimeOut: {
        width: '13%',
        borderRightWidth: 0.5,
        borderColor: '#000',
        padding: 3,
        fontSize: 9,
        textAlign: 'center',
    },
    tableCellRemarks: {
        width: '26%',
        padding: 3,
        fontSize: 9,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    // Footer sections
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        fontSize: 10,
    },
    footerLeft: {
        width: '40%',
    },
    footerRight: {
        width: '40%',
    },
    footerLabel: {
        fontWeight: 'bold',
        marginBottom: 20,
    },
    footerLine: {
        width: '100%',
        borderBottomWidth: 0.8,
        borderColor: '#000',
        marginTop: 2,
    },
});

export default function CoopHarvesterMaintenancePDF({ reportDate, data }: CoopHarvesterMaintenancePDFProps) {
    const titleDate = format(reportDate, 'MMMM dd, yyyy');

    // Render a table row
    const renderTableRow = (index: number, employee?: HarvesterMaintenanceEmployee) => {
        const no = String(index + 1).padStart(2, '0');
        const { lastName, firstName } = employee?.employee_name ? splitEmployeeName(employee.employee_name) : { lastName: '', firstName: '' };
        const timeIn = employee?.time_in ? formatTime(employee.time_in) : '';
        const timeOut = employee?.time_out ? formatTime(employee.time_out) : '';
        // Determine remarks based on attendance
        let remarks = '';
        if (employee?.time_in && employee?.time_out) {
            remarks = 'AWP'; // Present with work
        }
        // Return empty string instead of auto-setting AWOP or SL

        return (
            <View key={index} style={styles.tableRow}>
                <View style={styles.tableCellNo}>
                    <Text>{no}</Text>
                </View>
                <View style={styles.tableCellLastName}>
                    <Text>{lastName}</Text>
                </View>
                <View style={styles.tableCellFirstName}>
                    <Text>{firstName}</Text>
                </View>
                <View style={styles.tableCellTimeIn}>
                    <Text>{timeIn}</Text>
                </View>
                <View style={styles.tableCellTimeOut}>
                    <Text>{timeOut}</Text>
                </View>
                <View style={styles.tableCellRemarks}>
                    <Text>{remarks}</Text>
                </View>
            </View>
        );
    };

    // Render a table
    const renderTable = (employees: HarvesterMaintenanceEmployee[], maxRows: number, showNumbering: boolean = true) => {
        const rowsToShow = Math.max(maxRows, employees.length);

        return (
            <View style={styles.table}>
                {/* Column Headers */}
                <View style={styles.tableHeader}>
                    <View style={[styles.tableHeaderCell, styles.tableCellNo]}>
                        <Text>No.</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, styles.tableCellLastName]}>
                        <Text>LastName</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, styles.tableCellFirstName]}>
                        <Text>FirstName</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, styles.tableCellTimeIn]}>
                        <Text>TIME IN</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, styles.tableCellTimeOut]}>
                        <Text>TIME OUT</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, styles.tableCellRemarks, { borderRightWidth: 0 }]}>
                        <Text>REMARKS</Text>
                    </View>
                </View>
                {Array.from({ length: rowsToShow }).map((_, i) => {
                    if (!showNumbering && i >= employees.length) {
                        // For SPARE section, don't show numbers for empty rows
                        return (
                            <View key={i} style={styles.tableRow}>
                                <View style={styles.tableCellNo}>
                                    <Text></Text>
                                </View>
                                <View style={styles.tableCellLastName}>
                                    <Text></Text>
                                </View>
                                <View style={styles.tableCellFirstName}>
                                    <Text></Text>
                                </View>
                                <View style={styles.tableCellTimeIn}>
                                    <Text></Text>
                                </View>
                                <View style={styles.tableCellTimeOut}>
                                    <Text></Text>
                                </View>
                                <View style={styles.tableCellRemarks}>
                                    <Text></Text>
                                </View>
                            </View>
                        );
                    }
                    return renderTableRow(i, employees[i]);
                })}
            </View>
        );
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.dateRow}>
                            <Text>
                                <Text style={styles.bold}>Date:</Text> {titleDate}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerCenter}>
                        <Text style={styles.companyName}>CFARBEMPCO</Text>
                        <Text style={styles.areaName}>COOP HARVESTER / MAINTENANCE ATTENDANCE</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>

                {/* GROUP 1 Table */}
                <Text style={styles.sectionTitle}>GROUP 1</Text>
                <View style={styles.tableContainer}>{renderTable(data.group1 || [], 8)}</View>

                {/* GROUP 2 Table */}
                <Text style={styles.sectionTitle}>GROUP 2</Text>
                <View style={styles.tableContainer}>{renderTable(data.group2 || [], 8)}</View>

                {/* GROUP 3 Table */}
                <Text style={styles.sectionTitle}>GROUP 3</Text>
                <View style={styles.tableContainer}>{renderTable(data.group3 || [], 8)}</View>

                {/* SPARE Table */}
                <Text style={styles.sectionTitle}>SPARE</Text>
                <View style={styles.tableContainer}>{renderTable(data.spare || [], 3, false)}</View>

                {/* Footer - Prepared By and Checked By */}
                <View style={styles.footer}>
                    <View style={styles.footerLeft}>
                        <Text style={styles.footerLabel}>Prepared By:</Text>
                        <View style={styles.footerLine} />
                    </View>
                    <View style={styles.footerRight}>
                        <Text style={styles.footerLabel}>Checked By:</Text>
                        <View style={styles.footerLine} />
                    </View>
                </View>
            </Page>
        </Document>
    );
}
