import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

// Helper function to format employee name as "Lastname FirstInitial."
const formatEmployeeDisplayName = (employeeName: string, employees?: any[]): string => {
    if (!employees || employees.length === 0) return employeeName;

    const employee = employees.find((emp) => emp.employee_name === employeeName);
    if (employee && employee.lastname && employee.firstname) {
        const firstInitial = employee.firstname.trim().charAt(0).toUpperCase();
        return `${employee.lastname} ${firstInitial}.`;
    }
    return employeeName;
};

// Helper function to format time from HH:mm:ss to HH:mm with AM/PM
const formatTimeForPDF = (time: string | undefined | null): string => {
    if (!time) return '';

    // Handle HH:mm:ss or HH:mm format
    const timeStr = time.includes(':') ? time.split(':').slice(0, 2).join(':') : time;
    const [hours, minutes] = timeStr.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) return '';

    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours < 12 ? 'AM' : 'PM';

    return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

// --- Styles matching the uploaded form ---
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fff',
        padding: 4,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
        paddingHorizontal: 5,
        marginTop: 20,
    },
    logo: {
        width: 50,
        height: 50,
        marginRight: 5,
    },
    header: {
        flex: 1,
        textAlign: 'center',
        marginTop: 2,
    },
    companyName: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    code: {
        fontSize: 8,
        marginBottom: 0.5,
    },
    title: {
        fontSize: 10,
        fontWeight: 'bold',
        textDecoration: 'underline',
        marginBottom: 2,
    },

    // --- Table Layout ---
    table: {
        display: 'flex',
        width: '100%',
        borderWidth: 0.8,
        borderColor: '#000',
        marginTop: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.8,
        borderColor: '#000',
        minHeight: 6,
    },
    cell: {
        borderRightWidth: 0.8,
        borderColor: '#000',
        justifyContent: 'center',
        paddingVertical: 0.5,
    },
    text: {
        fontSize: 6,
    },
    headerText: {
        fontSize: 6,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    leftAlignText: {
        fontSize: 6,
        textAlign: 'left',
        paddingLeft: 1,
    },

    // --- Column Widths ---
    colSchedule: { width: '12%', padding: 0.3 },
    colNumber: { width: '1.5%', padding: 0.3 },
    colWorker: { width: '10%', padding: 0.3 },
    colDay: { width: `${(76.5 / 7).toFixed(2)}%` }, // evenly divide remaining 76.5%

    dayLabelCell: {
        borderBottomWidth: 0.8,
        borderColor: '#000',
        paddingVertical: 1,
        backgroundColor: '#e8e8e8',
    },
    inOutContainer: {
        flexDirection: 'row',
        borderBottomWidth: 0.8,
        borderColor: '#000',
    },
    inCell: {
        flex: 1,
        borderRightWidth: 0.8,
        borderColor: '#000',
        paddingVertical: 1,
        backgroundColor: '#e8e8e8',
        justifyContent: 'center',
    },
    outCell: {
        flex: 1,
        paddingVertical: 1,
        backgroundColor: '#e8e8e8',
        justifyContent: 'center',
    },
    inOutText: {
        fontSize: 6,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    timeCell: {
        flex: 1,
        borderRightWidth: 0.8,
        borderColor: '#000',
        paddingVertical: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeCellLast: {
        flex: 1,
        paddingVertical: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 6,
        textAlign: 'center',
    },
    emptyCell: {
        minHeight: 6,
    },
    leaveCell: {
        width: '23.5%',
        borderRightWidth: 0.8,
        borderColor: '#000',
        paddingLeft: 1,
    },
    leaveCellTotal: {
        width: '23.5%', // Spans schedule + number + worker columns
        borderRightWidth: 0.8,
        borderColor: '#000',
        paddingLeft: 1,
    },
    totalRow: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingHorizontal: 5,
    },
    footerSection: {
        width: '45%',
    },
    footerSectionLeft: {
        width: '45%',
    },
    footerSectionRight: {
        width: '45%',
        marginLeft: '60%',
    },
    footerLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    footerLine: {
        // borderBottomWidth: 0.5,
        borderColor: '#000',
        paddingBottom: 1,
        minHeight: 12,
    },
    footerText: {
        fontSize: 8,
    },
});

// --- Configuration matching your table ---
const positions = [
    { name: 'BOX FORMER', slots: 3 },
    { name: 'PALLETIZER', slots: 2 },
    { name: 'STEVEDOR', slots: 2 },
    { name: 'TOPPER', slots: 3 },
    { name: 'PALLETIZER', slots: 1 },
    { name: 'TOPPER', slots: 1 },
    { name: 'UTILITY', slots: 1 },
    { name: 'DEHANDER', slots: 1 },
    { name: 'M/BUG SPRAY', slots: 1 },
    { name: 'SWITCHMAN', slots: 1 },
    { name: 'Q.I.', slots: 1 },
    { name: 'STALK FILLER', slots: 1 },
    { name: 'C.P.', slots: 1 },
    { name: 'PACKER', slots: 8 },
    { name: 'LABELLER', slots: 4 },
    { name: 'WEIGHER', slots: 4 },
    { name: 'SELECTOR', slots: 6 },
    { name: 'SUPPORT: ABSENT', slots: 8 },
];

const leaveTypes = ['CW', 'ML', 'AWP', 'AWOP', 'SICK LEAVE', 'EMERGENCY LEAVE', 'CUT-OFF'];

const daysOfWeek = ['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'];

interface PackingPlantPDFProps {
    weekStart?: Date;
    workers?: { [key: string]: string[] };
    timeData?: {
        [key: string]: { [slotIndex: number]: { [dayIndex: number]: { time_in: string; time_out: string } } };
    };
    employees?: any[];
    leaveData?: { [key: string]: string };
    preparedBy?: string;
    checkedBy?: string;
}

export default function PackingPlantPDF({
    weekStart = new Date(),
    workers = {},
    timeData = {},
    employees = [],
    leaveData = {},
    preparedBy = '',
    checkedBy = '',
}: PackingPlantPDFProps = {}) {
    const PackingPlantDocument = () => {
        // Get position field names
        const positionFields = [
            'boxFormer',
            'palletizer',
            'stevedor',
            'topper',
            'palletizerTopper',
            'utility',
            'dehander',
            'bugSpray',
            'switchman',
            'qi',
            'stalkFiller',
            'cp',
            'packer',
            'labeller',
            'weigher',
            'selector',
            'supportAbsent',
        ];

        return (
            <Document>
                <Page size="A4" orientation="portrait" style={styles.page}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        {/* <Image src="/Logo.png" style={styles.logo} /> */}
                        <View style={styles.header}>
                            <Text style={styles.companyName}>CFARBEMPCO</Text>
                            <Text style={styles.code}>PP-2701</Text>
                            <Text style={styles.title}>DAILY CHECKING OF PP CREW</Text>
                        </View>
                    </View>

                    {/* Table */}
                    <View style={styles.table}>
                        {/* --- Header Row (Days) --- */}
                        <View style={styles.tableRow}>
                            <View style={[styles.cell, styles.colSchedule]}>
                                <Text style={styles.headerText}>DAILY WEEK SCHEDULE</Text>
                            </View>
                            <View style={[styles.cell, styles.colNumber]}>
                                <Text style={styles.headerText}></Text>
                            </View>
                            <View style={[styles.cell, styles.colWorker]}>
                                <Text style={styles.headerText}>NAME OF WORKERS</Text>
                            </View>

                            {/* Grouped Day Columns */}
                            {daysOfWeek.map((day, i) => (
                                <View key={i} style={[styles.colDay, styles.cell, { padding: 0 }]}>
                                    <View>
                                        <View style={styles.dayLabelCell}>
                                            <Text style={styles.headerText}>{day}</Text>
                                        </View>
                                        <View style={styles.inOutContainer}>
                                            <View style={styles.inCell}>
                                                <Text style={styles.inOutText}>IN</Text>
                                            </View>
                                            <View style={styles.outCell}>
                                                <Text style={styles.inOutText}>OUT</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* --- Worker Rows --- */}
                        {positions.flatMap((p, pIndex) => {
                            const fieldName = positionFields[pIndex];
                            const workerSlots = workers[fieldName] || [];
                            const isSupportAbsent = p.name === 'SUPPORT: ABSENT';

                            const workerRows = Array.from({ length: p.slots }).map((_, i) => {
                                const workerName = workerSlots[i] || '';
                                const slotTimeData = timeData[fieldName]?.[i] || {};
                                const formattedName = workerName ? formatEmployeeDisplayName(workerName, employees) : '';

                                return (
                                    <View key={`${pIndex}-${i}`} style={styles.tableRow}>
                                        {i === 0 ? (
                                            <View style={[styles.cell, styles.colSchedule, { textAlign: 'left', paddingLeft: 1 }]}>
                                                <Text style={styles.leftAlignText}>{p.name}</Text>
                                            </View>
                                        ) : (
                                            <View style={[styles.cell, styles.colSchedule]} />
                                        )}
                                        <View style={[styles.cell, styles.colNumber]}>
                                            <Text style={styles.text}>{i + 1}</Text>
                                        </View>
                                        <View style={[styles.cell, styles.colWorker]}>
                                            <Text style={styles.leftAlignText}>{formattedName}</Text>
                                        </View>
                                        {daysOfWeek.map((_, dIndex) => {
                                            const dayTime = slotTimeData[dIndex] || { time_in: '', time_out: '' };
                                            const timeIn = formatTimeForPDF(dayTime.time_in);
                                            const timeOut = formatTimeForPDF(dayTime.time_out);

                                            return (
                                                <View key={dIndex} style={[styles.colDay, styles.cell, { padding: 0 }]}>
                                                    <View style={{ flexDirection: 'row', minHeight: 10 }}>
                                                        <View style={styles.timeCell}>
                                                            <Text style={styles.timeText}>{timeIn}</Text>
                                                        </View>
                                                        <View style={styles.timeCellLast}>
                                                            <Text style={styles.timeText}>{timeOut}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                );
                            });

                            // Add leave types right after SUPPORT: ABSENT rows
                            if (isSupportAbsent) {
                                const leaveRows = leaveTypes.map((leave, leaveIndex) => (
                                    <View key={`leave-${leaveIndex}`} style={styles.tableRow}>
                                        <View style={[styles.cell, styles.colSchedule, { textAlign: 'left', paddingLeft: 1 }]}>
                                            <Text style={styles.leftAlignText}>{leave}</Text>
                                        </View>
                                        <View style={[styles.cell, styles.colNumber]} />
                                        <View style={[styles.cell, styles.colWorker]} />
                                        {daysOfWeek.map((_, dIndex) => {
                                            const leaveValue = leaveData[`${leave}_${dIndex}`] || '';
                                            return (
                                                <View key={dIndex} style={[styles.colDay, styles.cell, { padding: 0 }]}>
                                                    <View style={{ flexDirection: 'row', minHeight: 8 }}>
                                                        <View style={[styles.timeCell, { borderRightWidth: 0.8 }]}>
                                                            <Text style={styles.timeText}>{leaveValue}</Text>
                                                        </View>
                                                        <View style={styles.timeCellLast}>
                                                            <Text style={styles.timeText}></Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ));
                                return [...workerRows, ...leaveRows];
                            }

                            return workerRows;
                        })}

                        {/* --- Total Row --- */}
                        <View style={[styles.tableRow, styles.totalRow]}>
                            <View style={[styles.cell, styles.leaveCellTotal]}>
                                <Text style={styles.leftAlignText}>TOTAL</Text>
                            </View>
                            {daysOfWeek.map((_, i) => (
                                <View key={i} style={[styles.colDay, styles.cell, { padding: 0 }]}>
                                    <View style={{ flexDirection: 'row', minHeight: 10 }}>
                                        <View style={[styles.timeCell, { backgroundColor: '#f0f0f0' }]}>
                                            <Text style={styles.timeText}></Text>
                                        </View>
                                        <View style={[styles.timeCellLast, { backgroundColor: '#f0f0f0' }]}>
                                            <Text style={styles.timeText}></Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Footer - Prepared by and Checked by */}
                    <View style={styles.footer}>
                        <View style={styles.footerSectionLeft}>
                            <Text style={styles.footerLabel}>Prepared by:</Text>
                            <View style={styles.footerLine}>
                                <Text
                                    style={{
                                        ...styles.footerText,
                                        textDecoration: 'underline',
                                        textDecorationStyle: 'solid',
                                    }}
                                >
                                    {preparedBy || ''}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.footerSectionRight}>
                            <Text style={styles.footerLabel}>Checked by:</Text>
                            <View style={styles.footerLine}>
                                <Text
                                    style={{
                                        ...styles.footerText,
                                        textDecoration: 'underline',
                                        textDecorationStyle: 'solid',
                                    }}
                                >
                                    {checkedBy || ''}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Page>
            </Document>
        );
    };

    return PackingPlantDocument;
}
