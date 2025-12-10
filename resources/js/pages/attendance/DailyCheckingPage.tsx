import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import axios from 'axios';
import { ArrowLeft, CalendarIcon, Download, Eye, Loader2, Save, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    firstname?: string;
    middlename?: string;
    lastname?: string;
    department: string;
    position: string;
    work_status: string;
    attendances?: { [date: string]: { time_in?: string; time_out?: string } };
}

interface DailyCheckingPageProps {
    employees?: Employee[];
    preparedBy?: string;
    checkedBy?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attendance Management',
        href: '/attendance',
    },
    {
        title: 'Daily Checking PP Crew',
        href: '/attendance/daily-checking',
    },
];

// Position configurations with number of slots
const positions = [
    { name: 'BOX FORMER', slots: 3, field: 'boxFormer' },
    { name: 'PALLETIZER', slots: 2, field: 'palletizer' },
    { name: 'STEVEDOR', slots: 2, field: 'stevedor' },
    { name: 'TOPPER', slots: 3, field: 'topper' },
    { name: 'PALLETIZER TOPPER', slots: 1, field: 'palletizerTopper' },
    { name: 'UTILITY', slots: 1, field: 'utility' },
    { name: 'DEHANDER', slots: 1, field: 'dehander' },
    { name: 'M/BUG SPRAY', slots: 1, field: 'bugSpray' },
    { name: 'SWITCHMAN', slots: 1, field: 'switchman' },
    { name: 'Q.I', slots: 1, field: 'qi' },
    { name: 'STALK FILLER', slots: 1, field: 'stalkFiller' },
    { name: 'C.P.', slots: 1, field: 'cp' },
    { name: 'PACKER', slots: 8, field: 'packer' },
    { name: 'LABELLER', slots: 4, field: 'labeller' },
    { name: 'WEIGHER', slots: 4, field: 'weigher' },
    { name: 'SELECTOR', slots: 6, field: 'selector' },
    { name: 'SUPPORT: ABSENT', slots: 9, field: 'supportAbsent' },
];

// Leave types
const leaveTypes = ['CW', 'ML', 'AWP', 'AWOP', 'SICK LEAVE', 'EMERGENCY LEAVE', 'CUT-OFF'];

// Helper function to format employee name as "Lastname FirstInitial."
const formatEmployeeDisplayName = (employee: Employee): string => {
    if (employee.lastname && employee.firstname) {
        // Get first initial from firstname (handle cases like "RJ Kyle" -> "R")
        const firstInitial = employee.firstname.trim().charAt(0).toUpperCase();
        return `${employee.lastname} ${firstInitial}.`;
    }
    // Fallback to employee_name if name fields are not available
    return employee.employee_name;
};

// Helper function to format time from HH:mm:ss to HH:mm for HTML time input
const formatTimeForInput = (time: string | undefined | null): string => {
    if (!time) return '';
    // If time is in HH:mm:ss format, extract HH:mm
    if (time.includes(':')) {
        const parts = time.split(':');
        return `${parts[0]}:${parts[1]}`;
    }
    return time;
};

// Helper function to format date to YYYY-MM-DD using local timezone
const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper function to parse date string as local date (not UTC)
const parseDateLocal = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Helper function to format time to 12-hour format with AM/PM
const formatTimeWithAMPM = (time: string | undefined | null): string => {
    if (!time) return '--:--';

    // Handle HH:mm:ss or HH:mm format
    const timeStr = time.includes(':') ? time.split(':').slice(0, 2).join(':') : time;
    const [hours, minutes] = timeStr.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) return '--:--';

    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours < 12 ? 'AM' : 'PM';

    return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

export default function DailyCheckingPage({
    employees: initialEmployees = [],
    preparedBy: initialPreparedBy = '',
    checkedBy: initialCheckedBy = '',
}: DailyCheckingPageProps) {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [date, setDate] = useState(formatDateLocal(new Date()));
    const [assignmentData, setAssignmentData] = useState<{ [key: string]: string[] }>({});
    // Store time_in and time_out for each position field, slot index, and day index
    const [timeData, setTimeData] = useState<{
        [key: string]: { [slotIndex: number]: { [dayIndex: number]: { time_in: string; time_out: string } } };
    }>({});
    const [leaveData, setLeaveData] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [preparedBy, setPreparedBy] = useState(initialPreparedBy);
    const [checkedBy, setCheckedBy] = useState(initialCheckedBy);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedMicroteam, setSelectedMicroteam] = useState<'MICROTEAM - 01' | 'MICROTEAM - 02' | 'MICROTEAM - 03' | null>(null);
    // Track selected employees by microteam and date: { microteam: { date: Set<employeeNames> } }
    const [allSelectedEmployees, setAllSelectedEmployees] = useState<{
        [microteam: string]: { [date: string]: Set<string> };
    }>({});
    const [loadingMicroteam, setLoadingMicroteam] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [lockPeriod7Days, setLockPeriod7Days] = useState(false);
    const [lockPeriod14Days, setLockPeriod14Days] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    // Initialize assignment data structure
    useEffect(() => {
        const initialData: { [key: string]: string[] } = {};
        const initialTimeData: typeof timeData = {};
        positions.forEach((position) => {
            initialData[position.field] = Array(position.slots).fill('');
            initialTimeData[position.field] = {};
            for (let i = 0; i < position.slots; i++) {
                initialTimeData[position.field][i] = {};
                for (let j = 0; j < 7; j++) {
                    initialTimeData[position.field][i][j] = { time_in: '', time_out: '' };
                }
            }
        });
        setAssignmentData(initialData);
        setTimeData(initialTimeData);

        // Initialize leave data
        const initialLeaveData: { [key: string]: string } = {};
        leaveTypes.forEach((type) => {
            initialLeaveData[type] = '';
        });
        setLeaveData(initialLeaveData);
    }, []);

    // Get days of the week for the table header (starting with Monday)
    const getDaysOfWeek = () => {
        const selectedDate = new Date(date);
        const days = [];
        const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(selectedDate);

        // Calculate days to subtract to get to Monday
        // If Sunday (0), go back 6 days; if Monday (1), go back 0 days, etc.
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(selectedDate.getDate() - daysToSubtract);

        // Generate 7 days starting from Monday
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days; // [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
    };

    // State to track employees with attendance for the selected week
    const [employeesWithAttendance, setEmployeesWithAttendance] = useState<Set<string>>(new Set());
    // State to track locked employees (within 14 days of assignment)
    const [lockedEmployees, setLockedEmployees] = useState<Map<string, { assignment_date: string; lock_until: string; days_remaining: number }>>(
        new Map(),
    );

    // Fetch employees when date changes - only those with attendance for the selected week
    useEffect(() => {
        const days = getDaysOfWeek();
        const startDate = formatDateLocal(days[0]);
        const endDate = formatDateLocal(days[6]);

        // Fetch employees with attendance for this specific week
        fetchPackingPlantEmployees(startDate, endDate);

        // Also fetch daily checking assignments to get employees assigned for this week
        fetchEmployeesForWeek(startDate);

        // Fetch locked employees
        fetchLockedEmployees();
    }, [date]);

    // Load settings on component mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Load settings from API
    const loadSettings = async () => {
        try {
            const response = await axios.get('/api/daily-checking/settings');
            if (response.data) {
                setLockPeriod7Days(response.data.lock_period_7_days || false);
                setLockPeriod14Days(response.data.lock_period_14_days || false);
            } else {
                // If no settings exist, both are off (no lock)
                setLockPeriod7Days(false);
                setLockPeriod14Days(false);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            // If API fails, both are off (no lock) - no default
            setLockPeriod7Days(false);
            setLockPeriod14Days(false);
        }
    };

    // Save settings
    const saveSettings = async (sevenDays: boolean, fourteenDays: boolean) => {
        try {
            setSavingSettings(true);
            await axios.post('/api/daily-checking/settings', {
                lock_period_7_days: sevenDays,
                lock_period_14_days: fourteenDays,
            });

            // Refresh locked employees after settings change
            fetchLockedEmployees();

            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSavingSettings(false);
        }
    };

    // Handle 7 days toggle
    const handle7DaysToggle = async (checked: boolean) => {
        // If turning on 7 days, turn off 14 days
        // If turning off 7 days, keep 14 days as is (unless it's also off)
        const new7Days = checked;
        const new14Days = checked ? false : lockPeriod14Days; // If 7 days is on, turn off 14 days

        setLockPeriod7Days(new7Days);
        setLockPeriod14Days(new14Days);

        // Auto-save
        await saveSettings(new7Days, new14Days);
    };

    // Handle 14 days toggle
    const handle14DaysToggle = async (checked: boolean) => {
        // If turning on 14 days, turn off 7 days
        // If turning off 14 days, keep 7 days as is (unless it's also off)
        const new14Days = checked;
        const new7Days = checked ? false : lockPeriod7Days; // If 14 days is on, turn off 7 days

        setLockPeriod14Days(new14Days);
        setLockPeriod7Days(new7Days);

        // Auto-save
        await saveSettings(new7Days, new14Days);
    };

    // Fetch locked employees (based on selected lock period)
    const fetchLockedEmployees = async () => {
        try {
            // Get the current lock period setting
            // If both are off, lock period is 0 (no lock)
            const lockPeriod = lockPeriod7Days ? 7 : lockPeriod14Days ? 14 : 0;

            const response = await axios.get('/api/daily-checking/locked-employees', {
                params: { lock_period: lockPeriod },
            });

            const lockedMap = new Map<string, { assignment_date: string; lock_until: string; days_remaining: number }>();

            if (response.data?.locked_employees) {
                response.data.locked_employees.forEach((emp: any) => {
                    lockedMap.set(emp.employee_name, {
                        assignment_date: emp.assignment_date,
                        lock_until: emp.lock_until,
                        days_remaining: emp.days_remaining,
                    });
                });
            }

            setLockedEmployees(lockedMap);
        } catch (error) {
            console.error('Error fetching locked employees:', error);
            // On error, clear the map
            setLockedEmployees(new Map());
        }
    };

    // Fetch employees who have daily checking assignments for the selected week
    const fetchEmployeesForWeek = async (weekStartDate: string) => {
        try {
            // Fetch assignments for all microteams for this week
            const response = await axios.get('/api/daily-checking/for-date', {
                params: { date: weekStartDate },
            });

            const employeesWithRecords = new Set<string>();

            // Get employees from microteams
            if (response.data?.microteams) {
                Object.values(response.data.microteams).forEach((microteam: any) => {
                    if (Array.isArray(microteam)) {
                        microteam.forEach((emp: any) => {
                            if (emp?.employee_name) {
                                employeesWithRecords.add(emp.employee_name);
                            }
                        });
                    }
                });
            }

            // Get employees from Add Crew
            if (response.data?.add_crew) {
                if (Array.isArray(response.data.add_crew)) {
                    response.data.add_crew.forEach((emp: any) => {
                        if (emp?.employee_name) {
                            employeesWithRecords.add(emp.employee_name);
                        }
                    });
                } else {
                    Object.values(response.data.add_crew).forEach((microteamAddCrew: any) => {
                        if (Array.isArray(microteamAddCrew)) {
                            microteamAddCrew.forEach((emp: any) => {
                                if (emp?.employee_name) {
                                    employeesWithRecords.add(emp.employee_name);
                                }
                            });
                        }
                    });
                }
            }

            setEmployeesWithAttendance(employeesWithRecords);
        } catch (error) {
            console.error('Error fetching employees for week:', error);
            // On error, clear the set so all employees can be shown (fallback)
            setEmployeesWithAttendance(new Set());
        }
    };

    // Update global selected employees when date changes
    useEffect(() => {
        if (!date) return;

        const fetchGlobalSelectedEmployees = async () => {
            try {
                // Build structure of selected employees by microteam and date
                // We need to fetch assignments for each date in the week to properly track by date
                const weekDays = getDaysOfWeek();
                const globalSelected: { [microteam: string]: { [date: string]: Set<string> } } = {};

                // For each day in the week, fetch assignments to get the date-specific selections
                const fetchPromises = weekDays.map(async (day) => {
                    const dayDateStr = formatDateLocal(day);
                    try {
                        const dayResponse = await axios.get('/api/daily-checking/for-date', {
                            params: { date: dayDateStr },
                        });

                        // Process microteams
                        if (dayResponse.data.microteams) {
                            Object.keys(dayResponse.data.microteams).forEach((microteamKey) => {
                                if (!globalSelected[microteamKey]) {
                                    globalSelected[microteamKey] = {};
                                }
                                if (!globalSelected[microteamKey][dayDateStr]) {
                                    globalSelected[microteamKey][dayDateStr] = new Set<string>();
                                }

                                const microteam = dayResponse.data.microteams[microteamKey];
                                if (Array.isArray(microteam)) {
                                    microteam.forEach((emp: any) => {
                                        if (emp.employee_name) {
                                            globalSelected[microteamKey][dayDateStr].add(emp.employee_name);
                                        }
                                    });
                                }
                            });
                        }

                        // Process Add Crew
                        if (dayResponse.data.add_crew) {
                            if (Array.isArray(dayResponse.data.add_crew)) {
                                // Old format: array - we can't determine microteam, so skip
                            } else {
                                // New format: grouped by microteam
                                Object.keys(dayResponse.data.add_crew).forEach((microteamKey) => {
                                    if (!globalSelected[microteamKey]) {
                                        globalSelected[microteamKey] = {};
                                    }
                                    if (!globalSelected[microteamKey][dayDateStr]) {
                                        globalSelected[microteamKey][dayDateStr] = new Set<string>();
                                    }

                                    const microteamAddCrew = dayResponse.data.add_crew[microteamKey];
                                    if (Array.isArray(microteamAddCrew)) {
                                        microteamAddCrew.forEach((emp: any) => {
                                            if (emp.employee_name) {
                                                globalSelected[microteamKey][dayDateStr].add(emp.employee_name);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching assignments for date ${dayDateStr}:`, error);
                    }
                });

                await Promise.all(fetchPromises);
                setAllSelectedEmployees(globalSelected);
            } catch (error) {
                console.error('Error fetching existing assignments:', error);
            }
        };

        fetchGlobalSelectedEmployees();
    }, [date]);

    // Reload form data when date changes and microteam is selected
    // NOTE: This only loads data when week/microteam changes, not after saving
    // This ensures data persists for the whole week after saving
    useEffect(() => {
        if (selectedMicroteam && date) {
            // Only reload if we have a microteam selected
            const loadData = async () => {
                const days = getDaysOfWeek();
                const weekStartDate = formatDateLocal(days[0]);

                // Initialize structures
                const initialData: { [key: string]: string[] } = {};
                const initialTimeData: typeof timeData = {};
                positions.forEach((position) => {
                    initialData[position.field] = Array(position.slots).fill('');
                    initialTimeData[position.field] = {};
                    for (let i = 0; i < position.slots; i++) {
                        initialTimeData[position.field][i] = {};
                        for (let j = 0; j < 7; j++) {
                            initialTimeData[position.field][i][j] = { time_in: '', time_out: '' };
                        }
                    }
                });

                // Load microteam data (includes Add Crew if it was saved with this microteam)
                try {
                    const microteamResponse = await axios.get('/api/daily-checking/by-microteam', {
                        params: { week_start_date: weekStartDate, microteam: selectedMicroteam },
                    });

                    if (microteamResponse.data.assignment_data) {
                        // Merge microteam data (including SUPPORT: ABSENT - it's saved per microteam)
                        Object.keys(microteamResponse.data.assignment_data).forEach((positionField) => {
                            if (initialData[positionField]) {
                                const savedAssignments = microteamResponse.data.assignment_data[positionField];
                                savedAssignments.forEach((emp: string, index: number) => {
                                    if (emp && index < initialData[positionField].length) {
                                        initialData[positionField][index] = emp;
                                    }
                                });
                            }
                        });

                        if (microteamResponse.data.time_data) {
                            // Merge microteam time data (including SUPPORT: ABSENT)
                            // This loads ALL 7 days of time data for the week
                            Object.keys(microteamResponse.data.time_data).forEach((positionField) => {
                                if (initialTimeData[positionField]) {
                                    const savedTimeData = microteamResponse.data.time_data[positionField];
                                    Object.keys(savedTimeData).forEach((slotIndex) => {
                                        const slot = parseInt(slotIndex);
                                        Object.keys(savedTimeData[slotIndex]).forEach((dayIndex) => {
                                            const day = parseInt(dayIndex);
                                            if (savedTimeData[slotIndex][dayIndex]) {
                                                initialTimeData[positionField][slot][day] = {
                                                    time_in: savedTimeData[slotIndex][dayIndex].time_in || '',
                                                    time_out: savedTimeData[slotIndex][dayIndex].time_out || '',
                                                };
                                            }
                                        });
                                    });
                                }
                            });
                        }

                        if (microteamResponse.data.prepared_by) {
                            setPreparedBy(microteamResponse.data.prepared_by);
                        }
                        if (microteamResponse.data.checked_by) {
                            setCheckedBy(microteamResponse.data.checked_by);
                        }
                    }
                } catch (error) {
                    console.error('Error loading microteam data:', error);
                }

                // Only set data if we're loading a different week/microteam
                // This preserves unsaved changes when working on the same week
                setAssignmentData(initialData);
                setTimeData(initialTimeData);
            };

            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date, selectedMicroteam]);

    const fetchPackingPlantEmployees = async (startDate?: string, endDate?: string) => {
        setLoading(true);
        try {
            let url = '/api/employees/packing-plant';
            if (startDate && endDate) {
                url += `?start_date=${startDate}&end_date=${endDate}`;
            }
            const response = await axios.get(url);
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignmentChange = (field: string, slotIndex: number, value: string) => {
        const previousValue = assignmentData[field]?.[slotIndex] || '';

        setAssignmentData((prev) => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === slotIndex ? value : item)),
        }));

        // Update global selected employees set by microteam and date
        // Only prevent selection if same employee is selected for same microteam AND same date
        if (selectedMicroteam && date) {
            setAllSelectedEmployees((prev) => {
                const updated = { ...prev };
                if (!updated[selectedMicroteam]) {
                    updated[selectedMicroteam] = {};
                }
                if (!updated[selectedMicroteam][date]) {
                    updated[selectedMicroteam][date] = new Set<string>();
                }

                const dateSet = new Set(updated[selectedMicroteam][date]);
                if (previousValue) {
                    dateSet.delete(previousValue);
                }
                if (value) {
                    dateSet.add(value);
                }

                updated[selectedMicroteam][date] = dateSet;
                return updated;
            });
        }

        // Auto-populate time_in and time_out when employee is selected
        if (value) {
            const selectedEmployee = employees.find((emp) => emp.employee_name === value);
            if (selectedEmployee && selectedEmployee.attendances) {
                const days = getDaysOfWeek();
                const newTimeData = { ...timeData };

                if (!newTimeData[field]) {
                    newTimeData[field] = {};
                }
                if (!newTimeData[field][slotIndex]) {
                    newTimeData[field][slotIndex] = {};
                }

                days.forEach((day, dayIndex) => {
                    const dateStr = formatDateLocal(day);
                    const attendance = selectedEmployee.attendances?.[dateStr];
                    if (attendance) {
                        newTimeData[field][slotIndex][dayIndex] = {
                            time_in: formatTimeForInput(attendance.time_in),
                            time_out: formatTimeForInput(attendance.time_out),
                        };
                    } else {
                        newTimeData[field][slotIndex][dayIndex] = {
                            time_in: '',
                            time_out: '',
                        };
                    }
                });

                setTimeData(newTimeData);
            } else {
                // Clear times if employee is deselected or has no attendance data
                const newTimeData = { ...timeData };
                if (newTimeData[field] && newTimeData[field][slotIndex]) {
                    const days = getDaysOfWeek();
                    days.forEach((_, dayIndex) => {
                        newTimeData[field][slotIndex][dayIndex] = {
                            time_in: '',
                            time_out: '',
                        };
                    });
                    setTimeData(newTimeData);
                }
            }
        } else {
            // Clear times if employee is deselected
            const newTimeData = { ...timeData };
            if (newTimeData[field] && newTimeData[field][slotIndex]) {
                const days = getDaysOfWeek();
                days.forEach((_, dayIndex) => {
                    newTimeData[field][slotIndex][dayIndex] = {
                        time_in: '',
                        time_out: '',
                    };
                });
                setTimeData(newTimeData);
            }
        }
    };

    // Handle microteam change - load saved data or reset form
    const handleMicroteamChange = async (microteam: 'MICROTEAM - 01' | 'MICROTEAM - 02' | 'MICROTEAM - 03' | null) => {
        setSelectedMicroteam(microteam);
        setLoadingMicroteam(true);

        try {
            const days = getDaysOfWeek();
            const weekStartDate = formatDateLocal(days[0]);

            // Initialize assignment data and time data structures
            const initialData: { [key: string]: string[] } = {};
            const initialTimeData: typeof timeData = {};
            positions.forEach((position) => {
                initialData[position.field] = Array(position.slots).fill('');
                initialTimeData[position.field] = {};
                for (let i = 0; i < position.slots; i++) {
                    initialTimeData[position.field][i] = {};
                    for (let j = 0; j < 7; j++) {
                        initialTimeData[position.field][i][j] = { time_in: '', time_out: '' };
                    }
                }
            });

            // Load microteam data if microteam is selected
            // Add Crew will be loaded as part of the microteam data loading (it's saved separately but loaded together)
            if (microteam) {
                try {
                    const microteamResponse = await axios.get('/api/daily-checking/by-microteam', {
                        params: {
                            week_start_date: weekStartDate,
                            microteam: microteam,
                        },
                    });

                    if (microteamResponse.data.assignment_data) {
                        // Merge microteam data into initial data (including SUPPORT: ABSENT - it's saved per microteam)
                        Object.keys(microteamResponse.data.assignment_data).forEach((positionField) => {
                            if (initialData[positionField]) {
                                const savedAssignments = microteamResponse.data.assignment_data[positionField];
                                savedAssignments.forEach((emp: string, index: number) => {
                                    if (emp && index < initialData[positionField].length) {
                                        initialData[positionField][index] = emp;
                                    }
                                });
                            }
                        });

                        // Merge microteam time data (including SUPPORT: ABSENT)
                        if (microteamResponse.data.time_data) {
                            Object.keys(microteamResponse.data.time_data).forEach((positionField) => {
                                if (initialTimeData[positionField]) {
                                    const savedTimeData = microteamResponse.data.time_data[positionField];
                                    Object.keys(savedTimeData).forEach((slotIndex) => {
                                        const slot = parseInt(slotIndex);
                                        if (initialTimeData[positionField][slot]) {
                                            Object.keys(savedTimeData[slotIndex]).forEach((dayIndex) => {
                                                const day = parseInt(dayIndex);
                                                if (savedTimeData[slotIndex][dayIndex]) {
                                                    initialTimeData[positionField][slot][day] = {
                                                        time_in: savedTimeData[slotIndex][dayIndex].time_in || '',
                                                        time_out: savedTimeData[slotIndex][dayIndex].time_out || '',
                                                    };
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }

                        // Load prepared_by and checked_by if available
                        if (microteamResponse.data.prepared_by) {
                            setPreparedBy(microteamResponse.data.prepared_by);
                        }
                        if (microteamResponse.data.checked_by) {
                            setCheckedBy(microteamResponse.data.checked_by);
                        }
                    }
                } catch (error) {
                    console.error('Error loading microteam data:', error);
                    // If error, just use empty form
                }
            }

            // Update state with loaded data
            setAssignmentData(initialData);
            setTimeData(initialTimeData);

            // Update global selected employees by microteam and date
            try {
                const days = getDaysOfWeek();
                const globalSelected: { [microteam: string]: { [date: string]: Set<string> } } = {};

                // For each day in the week, fetch assignments to get the date-specific selections
                const fetchPromises = days.map(async (day) => {
                    const dayDateStr = formatDateLocal(day);
                    try {
                        const dayResponse = await axios.get('/api/daily-checking/for-date', {
                            params: { date: dayDateStr },
                        });

                        // Process microteams
                        if (dayResponse.data.microteams) {
                            Object.keys(dayResponse.data.microteams).forEach((microteamKey) => {
                                if (!globalSelected[microteamKey]) {
                                    globalSelected[microteamKey] = {};
                                }
                                if (!globalSelected[microteamKey][dayDateStr]) {
                                    globalSelected[microteamKey][dayDateStr] = new Set<string>();
                                }

                                const microteam = dayResponse.data.microteams[microteamKey];
                                if (Array.isArray(microteam)) {
                                    microteam.forEach((emp: any) => {
                                        if (emp.employee_name) {
                                            globalSelected[microteamKey][dayDateStr].add(emp.employee_name);
                                        }
                                    });
                                }
                            });
                        }

                        // Process Add Crew
                        if (dayResponse.data.add_crew) {
                            if (Array.isArray(dayResponse.data.add_crew)) {
                                // Old format: array - we can't determine microteam, so skip
                            } else {
                                // New format: grouped by microteam
                                Object.keys(dayResponse.data.add_crew).forEach((microteamKey) => {
                                    if (!globalSelected[microteamKey]) {
                                        globalSelected[microteamKey] = {};
                                    }
                                    if (!globalSelected[microteamKey][dayDateStr]) {
                                        globalSelected[microteamKey][dayDateStr] = new Set<string>();
                                    }

                                    const microteamAddCrew = dayResponse.data.add_crew[microteamKey];
                                    if (Array.isArray(microteamAddCrew)) {
                                        microteamAddCrew.forEach((emp: any) => {
                                            if (emp.employee_name) {
                                                globalSelected[microteamKey][dayDateStr].add(emp.employee_name);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching assignments for date ${dayDateStr}:`, error);
                    }
                });

                await Promise.all(fetchPromises);
                setAllSelectedEmployees(globalSelected);
            } catch (error) {
                console.error('Error loading global selected employees:', error);
                // Fallback: initialize with current microteam selection for current date
                if (selectedMicroteam && date) {
                    const selectedEmps = new Set<string>();
                    Object.values(initialData).forEach((slots) => {
                        slots.forEach((emp) => {
                            if (emp) {
                                selectedEmps.add(emp);
                            }
                        });
                    });
                    setAllSelectedEmployees({
                        [selectedMicroteam]: {
                            [date]: selectedEmps,
                        },
                    });
                }
            }
        } catch (error) {
            console.error('Error loading microteam data:', error);
            toast.error('Failed to load microteam data');
        } finally {
            setLoadingMicroteam(false);
        }
    };

    // Get all currently selected employees across all positions in current microteam
    const getSelectedEmployees = () => {
        const selected: string[] = [];
        Object.values(assignmentData).forEach((slots) => {
            slots.forEach((employee) => {
                if (employee && !selected.includes(employee)) {
                    selected.push(employee);
                }
            });
        });
        return selected;
    };

    // Check if employee is selected on the CURRENT date across ANY microteam
    // This prevents selecting the same employee on the same date in different microteams
    // But allows selecting the same employee on different dates (regardless of microteam)
    // Example: If Mr. Kyle is selected in M1 on 2025-11-10, he cannot be selected in M2 on 2025-11-10
    // But Mr. Kyle can be selected in M1 on 2025-11-10 and again in M1 (or any microteam) on 2025-11-11
    // IMPORTANT: This applies to ALL employees including Add Crew employees
    // If Add Crew employee Mr. Kyle is selected in M1 on 2025-11-14, he CANNOT be selected in M2 on 2025-11-14
    // But if date changes to 2025-11-15, Mr. Kyle can be selected again (even if selected in M1 on 2025-11-14)
    const isEmployeeSelectedGlobally = (employeeName: string): boolean => {
        if (!date) return false;

        // Check across ALL microteams for the current date
        // If employee is selected in ANY microteam on this date, return true
        // This applies to both regular employees and Add Crew employees
        for (const microteamKey in allSelectedEmployees) {
            const microteamSelections = allSelectedEmployees[microteamKey];
            if (!microteamSelections) continue;

            const dateSelections = microteamSelections[date];
            if (!dateSelections) continue;

            if (dateSelections.has(employeeName)) {
                return true; // Employee is already selected on this date in some microteam
            }
        }

        return false; // Employee is not selected on this date in any microteam
    };

    // Filter employees based on position field and attendance for selected week
    const getFilteredEmployees = (positionField: string): Employee[] => {
        let filtered = employees;

        // First filter by position field
        if (positionField === 'supportAbsent') {
            // SUPPORT: ABSENT - Only show Add Crew employees
            filtered = employees.filter((emp) => emp.work_status === 'Add Crew');
        } else {
            // All other positions - Include Packing Plant and Coop Area employees, exclude Add Crew employees
            filtered = employees.filter(
                (emp) => emp.work_status !== 'Add Crew' && (emp.department === 'Packing Plant' || emp.department === 'Coop Area'),
            );
        }

        // Then filter by attendance records for the selected week
        // Only show employees who have attendance records for this specific week
        const days = getDaysOfWeek();

        // Filter to only show employees who have attendance records for any day in the selected week
        // OR have daily checking assignments for this week (to allow viewing/editing saved data)
        filtered = filtered.filter((emp) => {
            // Check if employee has attendance records for any day in the week
            const hasAttendance = days.some((day) => {
                const dateStr = formatDateLocal(day);
                return emp.attendances?.[dateStr] !== undefined;
            });

            // Check if employee has daily checking assignment for this week (allows viewing saved data)
            const hasAssignment = employeesWithAttendance.has(emp.employee_name);

            // Show employee if they have attendance records OR daily checking assignment for this week
            // This ensures:
            // 1. Employees with attendance for the week are shown
            // 2. Employees with saved daily checking data for the week can be viewed/edited
            return hasAttendance || hasAssignment;
        });

        return filtered;
    };

    // Group employees by department for dropdown display
    const getGroupedEmployees = (positionField: string): { packingPlant: Employee[]; coopArea: Employee[] } => {
        const filtered = getFilteredEmployees(positionField);
        const packingPlant = filtered.filter((emp) => emp.department === 'Packing Plant');
        const coopArea = filtered.filter((emp) => emp.department === 'Coop Area');
        return { packingPlant, coopArea };
    };

    const handleLeaveChange = (type: string, value: string) => {
        setLeaveData((prev) => ({
            ...prev,
            [type]: value,
        }));
    };

    const handleSave = async () => {
        // Check if there are any assignments to save
        const hasAssignments = Object.values(assignmentData).some((slots) => slots.some((emp) => emp));
        if (!hasAssignments) {
            toast.error('Cannot Save', {
                description: 'Please assign at least one employee before saving.',
                duration: 4000,
            });
            return;
        }

        // Check if we have any assignments without microteam selected
        if (hasAssignments && !selectedMicroteam) {
            toast.error('Microteam Required', {
                description: 'Please select a Microteam first before assigning employees.',
                duration: 4000,
            });
            return;
        }

        try {
            setSaving(true);
            // Calculate Monday of the week
            const days = getDaysOfWeek();
            const weekStartDate = formatDateLocal(days[0]);

            // Count assignments for better messaging
            let addCrewCount = 0;
            let regularCount = 0;

            // Transform assignmentData and timeData into the format expected by API
            const assignments: any[] = [];

            Object.keys(assignmentData).forEach((positionField) => {
                const slots = assignmentData[positionField];
                slots.forEach((employeeName, slotIndex) => {
                    if (employeeName) {
                        // Get employee to check if Add Crew
                        const employee = employees.find((emp) => emp.employee_name === employeeName);
                        const isAddCrew = employee?.work_status === 'Add Crew' || positionField === 'supportAbsent';

                        if (isAddCrew) {
                            addCrewCount++;
                        } else {
                            regularCount++;
                        }

                        // Get time data for this position, slot, and all days
                        const slotTimeData = timeData[positionField]?.[slotIndex] || {};

                        assignments.push({
                            employee_name: employeeName,
                            position_field: positionField,
                            slot_index: slotIndex,
                            microteam: selectedMicroteam, // Add Crew is saved with the microteam it was selected in
                            is_add_crew: isAddCrew,
                            time_data: Array.from({ length: 7 }, (_, dayIndex) => {
                                const dayTime = slotTimeData[dayIndex] || { time_in: '', time_out: '' };
                                // Convert empty strings to null explicitly
                                const timeIn = dayTime.time_in && dayTime.time_in.trim() !== '' ? dayTime.time_in : null;
                                const timeOut = dayTime.time_out && dayTime.time_out.trim() !== '' ? dayTime.time_out : null;
                                return {
                                    time_in: timeIn,
                                    time_out: timeOut,
                                };
                            }),
                        });
                    }
                });
            });

            // Build descriptive message
            let saveMessage = 'Saving daily checking assignments';
            if (selectedMicroteam && regularCount > 0) {
                saveMessage += ` for ${selectedMicroteam}`;
            }
            if (addCrewCount > 0) {
                saveMessage += ` and ${addCrewCount} Add Crew employee${addCrewCount > 1 ? 's' : ''}`;
            }
            saveMessage += '...';

            // Show loading toast with descriptive message
            toast.loading(saveMessage, {
                id: 'save-daily-checking',
                duration: Infinity, // Keep loading until dismissed
            });

            // Use the selected date from the calendar (not current date)
            // This is the date the user selected in the calendar input
            const selectedDate = date; // This is already in YYYY-MM-DD format

            // Generate PDF and convert to base64
            let pdfBase64 = null;
            try {
                const PackingPlantPDF = (await import('./components/packing-plant-pdf')).default;
                const weekStartDateObj = parseDateLocal(weekStartDate);
                const PackingPlantDocument = PackingPlantPDF({
                    weekStart: weekStartDateObj,
                    workers: assignmentData,
                    timeData: timeData,
                    employees: employees,
                    leaveData: leaveData,
                    preparedBy: preparedBy || '',
                    checkedBy: checkedBy || '',
                });

                const documentComponent = PackingPlantDocument();
                if (documentComponent) {
                    const instance = pdf(documentComponent);
                    const blob = await instance.toBlob();

                    // Convert blob to base64
                    const reader = new FileReader();
                    pdfBase64 = await new Promise<string>((resolve, reject) => {
                        reader.onloadend = () => {
                            const base64String = reader.result as string;
                            // Remove data:application/pdf;base64, prefix if present
                            const base64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;
                            resolve(base64);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                }
            } catch (pdfError) {
                console.error('Error generating PDF for save:', pdfError);
                // Continue with save even if PDF generation fails
            }

            const response = await axios.post('/api/daily-checking/store', {
                week_start_date: weekStartDate,
                assignments: assignments,
                prepared_by: preparedBy,
                checked_by: checkedBy,
                day_of_save: selectedDate, // The date selected in the calendar (e.g., Nov 11, 2025)
                pdf_base64: pdfBase64, // Base64 encoded PDF
            });

            toast.dismiss('save-daily-checking');

            if (response.data.success) {
                // Refresh locked employees after successful save
                fetchLockedEmployees();
                // Build success message with details
                const details: string[] = [];

                if (selectedMicroteam && regularCount > 0) {
                    details.push(`${regularCount} employee${regularCount > 1 ? 's' : ''} saved to ${selectedMicroteam}`);
                }
                if (addCrewCount > 0) {
                    details.push(`${addCrewCount} Add Crew employee${addCrewCount > 1 ? 's' : ''} saved`);
                }

                // Show success toast with details
                const description =
                    details.length > 0 ? details.join('. ') : `Total: ${assignments.length} assignment${assignments.length > 1 ? 's' : ''} saved`;

                toast.success('Save Successful', {
                    description: description,
                    duration: 5000,
                });

                // Refresh global selected employees from API after successful save (by microteam and date)
                // NOTE: We do NOT clear assignmentData or timeData - they persist for the whole week
                // This allows users to continue editing the week without losing their work
                try {
                    const days = getDaysOfWeek();
                    const globalSelected: { [microteam: string]: { [date: string]: Set<string> } } = {};

                    // For each day in the week, fetch assignments to get the date-specific selections
                    const fetchPromises = days.map(async (day) => {
                        const dayDateStr = formatDateLocal(day);
                        try {
                            const dayResponse = await axios.get('/api/daily-checking/for-date', {
                                params: { date: dayDateStr },
                            });

                            // Process microteams
                            if (dayResponse.data.microteams) {
                                Object.keys(dayResponse.data.microteams).forEach((microteamKey) => {
                                    if (!globalSelected[microteamKey]) {
                                        globalSelected[microteamKey] = {};
                                    }
                                    if (!globalSelected[microteamKey][dayDateStr]) {
                                        globalSelected[microteamKey][dayDateStr] = new Set<string>();
                                    }

                                    const microteam = dayResponse.data.microteams[microteamKey];
                                    if (Array.isArray(microteam)) {
                                        microteam.forEach((emp: any) => {
                                            if (emp.employee_name) {
                                                globalSelected[microteamKey][dayDateStr].add(emp.employee_name);
                                            }
                                        });
                                    }
                                });
                            }

                            // Process Add Crew
                            if (dayResponse.data.add_crew) {
                                if (Array.isArray(dayResponse.data.add_crew)) {
                                    // Old format: array - we can't determine microteam, so skip
                                } else {
                                    // New format: grouped by microteam
                                    Object.keys(dayResponse.data.add_crew).forEach((microteamKey) => {
                                        if (!globalSelected[microteamKey]) {
                                            globalSelected[microteamKey] = {};
                                        }
                                        if (!globalSelected[microteamKey][dayDateStr]) {
                                            globalSelected[microteamKey][dayDateStr] = new Set<string>();
                                        }

                                        const microteamAddCrew = dayResponse.data.add_crew[microteamKey];
                                        if (Array.isArray(microteamAddCrew)) {
                                            microteamAddCrew.forEach((emp: any) => {
                                                if (emp.employee_name) {
                                                    globalSelected[microteamKey][dayDateStr].add(emp.employee_name);
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        } catch (error) {
                            console.error(`Error fetching assignments for date ${dayDateStr}:`, error);
                        }
                    });

                    await Promise.all(fetchPromises);
                    setAllSelectedEmployees(globalSelected);

                    // Also update employeesWithAttendance to reflect saved data (flatten for backward compatibility)
                    const allEmployeesSet = new Set<string>();
                    Object.values(globalSelected).forEach((microteamData) => {
                        Object.values(microteamData).forEach((dateSet) => {
                            dateSet.forEach((empName) => allEmployeesSet.add(empName));
                        });
                    });
                    setEmployeesWithAttendance(allEmployeesSet);
                } catch (error) {
                    console.error('Error refreshing global selected employees:', error);
                    // Fallback to current selection if API call fails
                    if (selectedMicroteam && date) {
                        const currentSelected = getSelectedEmployees();
                        setAllSelectedEmployees((prev) => {
                            const updated = { ...prev };
                            if (!updated[selectedMicroteam]) {
                                updated[selectedMicroteam] = {};
                            }
                            updated[selectedMicroteam][date] = new Set(currentSelected);
                            return updated;
                        });
                    }
                }

                // DO NOT clear assignmentData or timeData - they should persist for the whole week
                // Users can continue editing the week without losing their work
            } else {
                const errorMsg = response.data.message || 'Failed to save daily checking assignments. Please try again.';
                toast.error('Save Failed', {
                    description: errorMsg,
                    duration: 5000,
                });
            }
        } catch (error: any) {
            toast.dismiss('save-daily-checking');
            console.error('Error saving daily checking:', error);

            const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
            const errorDetails = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(', ')
                : 'Please check your connection and try again.';

            toast.error('Save Failed', {
                description: `${errorMessage}. ${errorDetails}`,
                duration: 5000,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        try {
            // Show loading toast
            toast.loading('Generating PDF...', { id: 'pdf-export' });

            // Import the PDF component dynamically
            const PackingPlantPDF = (await import('./components/packing-plant-pdf')).default;
            const weekStartDate = date ? parseDateLocal(date) : new Date();
            const PackingPlantDocument = PackingPlantPDF({
                weekStart: weekStartDate,
                workers: assignmentData,
                timeData: timeData,
                employees: employees,
                leaveData: leaveData,
                preparedBy: preparedBy || '',
                checkedBy: checkedBy || '',
            });

            // Generate PDF blob
            const documentComponent = PackingPlantDocument();
            if (!documentComponent) {
                throw new Error('Failed to generate PDF document');
            }
            const instance = pdf(documentComponent);
            const blob = await instance.toBlob();

            // Dismiss loading toast
            toast.dismiss('pdf-export');

            // Create download link
            const dateStr = date ? date : formatDateLocal(new Date());
            const filename = `Daily_Checking_PP_Crew_${dateStr}.pdf`;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('PDF exported successfully');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.dismiss('pdf-export');
            toast.error('Failed to export PDF. Please try again.');
        }
    };

    const handlePrint = async () => {
        try {
            console.log('Generating PDF for printing...', { date, workers: assignmentData });

            // Show loading toast
            toast.loading('Generating PDF for printing...', { id: 'pdf-print' });

            // Import the PDF component dynamically
            const PackingPlantPDF = (await import('./components/packing-plant-pdf')).default;
            const weekStartDate = date ? parseDateLocal(date) : new Date();
            const PackingPlantDocument = PackingPlantPDF({
                weekStart: weekStartDate,
                workers: assignmentData,
                timeData: timeData,
                employees: employees,
                leaveData: leaveData,
                preparedBy: preparedBy || '',
                checkedBy: checkedBy || '',
            });

            // Generate PDF blob
            const documentComponent = PackingPlantDocument();
            if (!documentComponent) {
                throw new Error('Failed to generate PDF document');
            }
            const instance = pdf(documentComponent);
            const blob = await instance.toBlob();

            // Dismiss loading toast
            toast.dismiss('pdf-print');

            // Create a blob URL
            const pdfUrl = URL.createObjectURL(blob);

            // Open in new window and trigger print dialog
            const printWindow = window.open(pdfUrl, '_blank');

            if (printWindow) {
                printWindow.addEventListener('load', () => {
                    setTimeout(() => {
                        printWindow.print();
                    }, 250);
                });

                // Clean up the URL after a delay
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
            }

            toast.success('PDF opened for printing');
        } catch (error) {
            console.error('Error generating PDF for printing:', error);
            toast.dismiss('pdf-print');
            toast.error('Failed to generate PDF for printing. Please try again.');
        }
    };

    // Function to view the PDF in a new window
    const viewPPPdf = async () => {
        try {
            console.log('Generating PDF for new window...', { date, workers: assignmentData });

            // Show loading toast
            toast.loading('Generating PDF...', { id: 'pdf-generation' });

            // Import the PDF component dynamically
            const PackingPlantPDF = (await import('./components/packing-plant-pdf')).default;
            const weekStartDate = date ? parseDateLocal(date) : new Date();
            const PackingPlantDocument = PackingPlantPDF({
                weekStart: weekStartDate,
                workers: assignmentData,
                timeData: timeData,
                employees: employees,
                leaveData: leaveData,
                preparedBy: preparedBy || '',
                checkedBy: checkedBy || '',
            });

            // Generate PDF blob
            const documentComponent = PackingPlantDocument();
            if (!documentComponent) {
                throw new Error('Failed to generate PDF document');
            }
            const instance = pdf(documentComponent);
            const blob = await instance.toBlob();

            // Dismiss loading toast
            toast.dismiss('pdf-generation');

            // Create a blob URL
            const pdfUrl = URL.createObjectURL(blob);

            // Try to open in new window
            const newWindow = window.open('', '_blank');

            if (newWindow) {
                // Write the blob URL as iframe src to handle PDF viewing
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>Packing Plant Daily Checking - ${date}</title>
                            <style>
                                body { margin: 0; padding: 0; }
                                iframe { width: 100%; height: 100vh; border: none; }
                            </style>
                        </head>
                        <body>
                            <iframe src="${pdfUrl}" type="application/pdf"></iframe>
                        </body>
                    </html>
                `);
                newWindow.document.close();
            }

            // Clean up the URL after longer delay to ensure PDF loads
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);

            toast.success('PDF opened in new window');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.dismiss('pdf-generation');
            toast.error('Failed to generate PDF. Please try again.');
        }
    };

    const daysOfWeek = getDaysOfWeek();

    return (
        <SidebarProvider>
            <Head title="Daily Checking of PP Crew" />
            {/* <Toaster position="top-center" richColors /> */}
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="print:p-8">
                            {/* Header */}
                            <div className="mb-6 flex items-center justify-between border-b-2 border-gray-800 pb-4 print:mb-4">
                                <div className="flex items-center gap-4">
                                    <img src="/AGOC.png" alt="Company Logo" className="h-20 w-20 object-contain" />
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-800">CFARESSMPCO</h1>
                                        <p className="text-sm text-gray-600">PP-2701</p>
                                        <p className="text-lg font-semibold text-gray-700">DAILY CHECKING OF PP CREW</p>
                                    </div>
                                </div>
                            </div>

                            {/* Controls Row */}
                            <div className="mb-4 flex items-end gap-4 print:hidden">
                                {/* Microteam Selection */}
                                <div className="flex-1">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Select Microteam:
                                        {loadingMicroteam && <span className="ml-2 text-xs text-gray-500">Loading...</span>}
                                    </label>
                                    <Select
                                        value={selectedMicroteam || ''}
                                        onValueChange={(value) =>
                                            handleMicroteamChange(value as 'MICROTEAM - 01' | 'MICROTEAM - 02' | 'MICROTEAM - 03' | null)
                                        }
                                        disabled={loadingMicroteam}
                                    >
                                        <SelectTrigger className="w-64 border-gray-300">
                                            <SelectValue placeholder="Select Microteam..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MICROTEAM - 01">Microteam 1</SelectItem>
                                            <SelectItem value="MICROTEAM - 02">Microteam 2</SelectItem>
                                            <SelectItem value="MICROTEAM - 03">Microteam 3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Settings Button */}
                                <Button variant="outline" onClick={() => setShowSettings(true)} className="border-gray-300">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Button>
                            </div>

                            {/* Date Selection */}
                            <div className="mb-4 print:hidden">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Select Week Date:</label>
                                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn('w-64 justify-start text-left font-normal', !date && 'text-muted-foreground')}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date
                                                ? parseDateLocal(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date ? parseDateLocal(date) : undefined}
                                            onSelect={(selectedDate) => {
                                                if (selectedDate) {
                                                    setDate(formatDateLocal(selectedDate));
                                                    setCalendarOpen(false);
                                                }
                                            }}
                                            captionLayout="dropdown"
                                            initialFocus
                                            disabled={(date) => {
                                                // Disable future dates (tomorrow and beyond)
                                                // Allow only today and past dates
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                const checkDate = new Date(date);
                                                checkDate.setHours(0, 0, 0, 0);
                                                return checkDate > today;
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Main Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border-2 border-black text-sm">
                                    {/* Table Header */}
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border-2 border-black p-2 text-left font-bold" rowSpan={2}>
                                                DAILY WEEK SCHEDULE
                                            </th>
                                            <th className="w-8 border-2 border-black p-1 text-center font-bold" rowSpan={2}></th>
                                            <th className="border-2 border-black p-2 text-left font-bold" rowSpan={2}>
                                                NAME OF WORKERS
                                            </th>
                                            {daysOfWeek.map((day, index) => (
                                                <th key={index} className="border-2 border-black p-1 text-center" colSpan={2}>
                                                    <div className="text-xs font-bold">
                                                        {day.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
                                                    </div>
                                                    <div className="text-xs">
                                                        {day.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                        <tr className="bg-gray-100">
                                            {daysOfWeek.map((_, index) => (
                                                <React.Fragment key={index}>
                                                    <th className="border-2 border-black p-1 text-xs">IN</th>
                                                    <th className="border-2 border-black p-1 text-xs">OUT</th>
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>

                                    {/* Table Body */}
                                    <tbody>
                                        {positions.map((position) => (
                                            <React.Fragment key={position.field}>
                                                {/* Position rows with slot numbers */}
                                                {Array.from({ length: position.slots }).map((_, slotIndex) => (
                                                    <tr key={slotIndex}>
                                                        {/* Position name (only for first row) */}
                                                        {slotIndex === 0 && (
                                                            <td className="border-2 border-black bg-gray-50 p-2 font-bold" rowSpan={position.slots}>
                                                                {position.name}
                                                            </td>
                                                        )}
                                                        {/* Slot number */}
                                                        <td className="w-8 border-2 border-black p-1 text-center text-xs font-semibold">
                                                            {slotIndex + 1}
                                                        </td>
                                                        {/* Employee name dropdown */}
                                                        <td className="border-2 border-black p-1">
                                                            <Select
                                                                value={assignmentData[position.field]?.[slotIndex] || ''}
                                                                onValueChange={(value) => handleAssignmentChange(position.field, slotIndex, value)}
                                                                disabled={!selectedMicroteam}
                                                            >
                                                                <SelectTrigger className="h-8 border-0 text-xs">
                                                                    <SelectValue
                                                                        placeholder={
                                                                            selectedMicroteam
                                                                                ? position.field === 'supportAbsent'
                                                                                    ? 'Select Add Crew...'
                                                                                    : 'Select...'
                                                                                : 'Select Microteam first'
                                                                        }
                                                                    />
                                                                </SelectTrigger>
                                                                <SelectContent className={position.field !== 'supportAbsent' ? 'min-w-[400px]' : ''}>
                                                                    {position.field === 'supportAbsent'
                                                                        ? // Support Absent: Show Add Crew employees without grouping
                                                                          getFilteredEmployees(position.field).map((emp) => {
                                                                              const selectedEmployees = getSelectedEmployees();
                                                                              const isSelectedInCurrent = selectedEmployees.includes(
                                                                                  emp.employee_name,
                                                                              );
                                                                              const isSelectedInSameMicroteamAndDate = isEmployeeSelectedGlobally(
                                                                                  emp.employee_name,
                                                                              );
                                                                              const isCurrentSelection =
                                                                                  assignmentData[position.field]?.[slotIndex] === emp.employee_name;

                                                                              // Check if employee is locked (within 14 days)
                                                                              const isLocked = lockedEmployees.has(emp.employee_name);
                                                                              const lockInfo = isLocked
                                                                                  ? lockedEmployees.get(emp.employee_name)
                                                                                  : null;

                                                                              const shouldDisable =
                                                                                  (isSelectedInCurrent && !isCurrentSelection) ||
                                                                                  (isSelectedInSameMicroteamAndDate &&
                                                                                      !isCurrentSelection &&
                                                                                      !isSelectedInCurrent) ||
                                                                                  (isLocked && !isCurrentSelection);

                                                                              return (
                                                                                  <SelectItem
                                                                                      key={emp.id}
                                                                                      value={emp.employee_name}
                                                                                      className="text-xs"
                                                                                      disabled={shouldDisable}
                                                                                      title={
                                                                                          isLocked && lockInfo
                                                                                              ? `Locked until ${lockInfo.lock_until} (${lockInfo.days_remaining} days remaining)`
                                                                                              : undefined
                                                                                      }
                                                                                  >
                                                                                      {formatEmployeeDisplayName(emp)}
                                                                                      {isLocked && lockInfo && (
                                                                                          <span className="ml-2 text-xs text-emerald-500">
                                                                                              ({lockInfo.days_remaining}d left)
                                                                                          </span>
                                                                                      )}
                                                                                  </SelectItem>
                                                                              );
                                                                          })
                                                                        : // All other positions: Display in two columns (Packing Plant | Coop Area)
                                                                          (() => {
                                                                              const { packingPlant, coopArea } = getGroupedEmployees(position.field);
                                                                              const selectedEmployees = getSelectedEmployees();

                                                                              return (
                                                                                  <div className="flex">
                                                                                      {/* Packing Plant Column */}
                                                                                      <div className="flex flex-1 flex-col border-r border-gray-200">
                                                                                          <SelectGroup>
                                                                                              <SelectLabel className="flex flex-shrink-0 items-center justify-center py-2 text-xs font-semibold text-gray-700">
                                                                                                  Packing Plant
                                                                                              </SelectLabel>
                                                                                              <div className="max-h-[300px] overflow-y-auto">
                                                                                                  {packingPlant.map((emp) => {
                                                                                                      const isSelectedInCurrent =
                                                                                                          selectedEmployees.includes(
                                                                                                              emp.employee_name,
                                                                                                          );
                                                                                                      const isSelectedInSameMicroteamAndDate =
                                                                                                          isEmployeeSelectedGlobally(
                                                                                                              emp.employee_name,
                                                                                                          );
                                                                                                      const isCurrentSelection =
                                                                                                          assignmentData[position.field]?.[
                                                                                                              slotIndex
                                                                                                          ] === emp.employee_name;

                                                                                                      // Check if employee is locked (within 14 days)
                                                                                                      const isLocked = lockedEmployees.has(
                                                                                                          emp.employee_name,
                                                                                                      );
                                                                                                      const lockInfo = isLocked
                                                                                                          ? lockedEmployees.get(emp.employee_name)
                                                                                                          : null;

                                                                                                      const shouldDisable =
                                                                                                          (isSelectedInCurrent &&
                                                                                                              !isCurrentSelection) ||
                                                                                                          (isSelectedInSameMicroteamAndDate &&
                                                                                                              !isCurrentSelection &&
                                                                                                              !isSelectedInCurrent) ||
                                                                                                          (isLocked && !isCurrentSelection);

                                                                                                      return (
                                                                                                          <SelectItem
                                                                                                              key={emp.id}
                                                                                                              value={emp.employee_name}
                                                                                                              className="text-xs"
                                                                                                              disabled={shouldDisable}
                                                                                                              title={
                                                                                                                  isLocked && lockInfo
                                                                                                                      ? `Locked until ${lockInfo.lock_until} (${lockInfo.days_remaining} days remaining)`
                                                                                                                      : undefined
                                                                                                              }
                                                                                                          >
                                                                                                              {formatEmployeeDisplayName(emp)}
                                                                                                              {isLocked && lockInfo && (
                                                                                                                  <span className="ml-2 text-xs text-emerald-500">
                                                                                                                      ({lockInfo.days_remaining}d
                                                                                                                      left)
                                                                                                                  </span>
                                                                                                              )}
                                                                                                          </SelectItem>
                                                                                                      );
                                                                                                  })}
                                                                                              </div>
                                                                                          </SelectGroup>
                                                                                      </div>

                                                                                      {/* Coop Area Column */}
                                                                                      <div className="flex flex-1 flex-col">
                                                                                          <SelectGroup>
                                                                                              <SelectLabel className="flex flex-shrink-0 items-center justify-center py-2 text-xs font-semibold text-gray-700">
                                                                                                  Coop Area
                                                                                              </SelectLabel>
                                                                                              <div className="max-h-[300px] overflow-y-auto">
                                                                                                  {coopArea.map((emp) => {
                                                                                                      const isSelectedInCurrent =
                                                                                                          selectedEmployees.includes(
                                                                                                              emp.employee_name,
                                                                                                          );
                                                                                                      const isSelectedInSameMicroteamAndDate =
                                                                                                          isEmployeeSelectedGlobally(
                                                                                                              emp.employee_name,
                                                                                                          );
                                                                                                      const isCurrentSelection =
                                                                                                          assignmentData[position.field]?.[
                                                                                                              slotIndex
                                                                                                          ] === emp.employee_name;

                                                                                                      // Check if employee is locked (within 14 days)
                                                                                                      const isLocked = lockedEmployees.has(
                                                                                                          emp.employee_name,
                                                                                                      );
                                                                                                      const lockInfo = isLocked
                                                                                                          ? lockedEmployees.get(emp.employee_name)
                                                                                                          : null;

                                                                                                      const shouldDisable =
                                                                                                          (isSelectedInCurrent &&
                                                                                                              !isCurrentSelection) ||
                                                                                                          (isSelectedInSameMicroteamAndDate &&
                                                                                                              !isCurrentSelection &&
                                                                                                              !isSelectedInCurrent) ||
                                                                                                          (isLocked && !isCurrentSelection);

                                                                                                      return (
                                                                                                          <SelectItem
                                                                                                              key={emp.id}
                                                                                                              value={emp.employee_name}
                                                                                                              className="text-xs"
                                                                                                              disabled={shouldDisable}
                                                                                                              title={
                                                                                                                  isLocked && lockInfo
                                                                                                                      ? `Locked until ${lockInfo.lock_until} (${lockInfo.days_remaining} days remaining)`
                                                                                                                      : undefined
                                                                                                              }
                                                                                                          >
                                                                                                              {formatEmployeeDisplayName(emp)}
                                                                                                              {isLocked && lockInfo && (
                                                                                                                  <span className="ml-2 text-xs text-emerald-500">
                                                                                                                      ({lockInfo.days_remaining}d
                                                                                                                      left)
                                                                                                                  </span>
                                                                                                              )}
                                                                                                          </SelectItem>
                                                                                                      );
                                                                                                  })}
                                                                                              </div>
                                                                                          </SelectGroup>
                                                                                      </div>
                                                                                  </div>
                                                                              );
                                                                          })()}
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                        {/* Days of week IN/OUT columns */}
                                                        {daysOfWeek.map((_, dayIndex) => (
                                                            <React.Fragment key={dayIndex}>
                                                                <td className="border-2 border-black p-1 text-center text-xs">
                                                                    {formatTimeWithAMPM(timeData[position.field]?.[slotIndex]?.[dayIndex]?.time_in)}
                                                                </td>
                                                                <td className="border-2 border-black p-1 text-center text-xs">
                                                                    {formatTimeWithAMPM(timeData[position.field]?.[slotIndex]?.[dayIndex]?.time_out)}
                                                                </td>
                                                            </React.Fragment>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}

                                        {/* Leave Types Section */}
                                        {leaveTypes.map((leaveType) => (
                                            <tr key={leaveType}>
                                                <td className="border-2 border-black bg-gray-50 p-2 font-bold" colSpan={3}>
                                                    {leaveType}
                                                </td>
                                                {daysOfWeek.map((_, dayIndex) => (
                                                    <React.Fragment key={dayIndex}>
                                                        <td className="border-2 border-black p-0" colSpan={2}>
                                                            <Input
                                                                className="h-8 rounded-none border-0 text-center text-xs"
                                                                value={leaveData[`${leaveType}_${dayIndex}`] || ''}
                                                                onChange={(e) => handleLeaveChange(`${leaveType}_${dayIndex}`, e.target.value)}
                                                            />
                                                        </td>
                                                    </React.Fragment>
                                                ))}
                                            </tr>
                                        ))}

                                        {/* Total Row */}
                                        <tr className="bg-gray-100 font-bold">
                                            <td className="border-2 border-black p-2" colSpan={3}>
                                                TOTAL
                                            </td>
                                            {daysOfWeek.map((_, dayIndex) => (
                                                <td key={dayIndex} className="border-2 border-black p-2 text-center" colSpan={2}>
                                                    <Input className="h-8 rounded-none border-0 text-center font-bold" />
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer - Prepared by and Checked by */}
                            <div className="mt-8 flex justify-between">
                                <div className="w-1/2">
                                    <p className="mb-2 font-semibold">Prepared by:</p>
                                    <Input
                                        value={preparedBy}
                                        onChange={(e) => setPreparedBy(e.target.value)}
                                        className="w-64 border-t-0 border-r-0 border-b-2 border-l-0 border-gray-400 print:border-b-2"
                                        placeholder="Name"
                                    />
                                </div>
                                <div className="ml-[60%] w-1/2">
                                    <p className="mb-2 font-semibold">Checked by:</p>
                                    <Input
                                        value={checkedBy}
                                        onChange={(e) => setCheckedBy(e.target.value)}
                                        className="ml-auto w-64 border-t-0 border-r-0 border-b-2 border-l-0 border-gray-400 print:border-b-2"
                                        placeholder="Name"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-start gap-2 print:hidden">
                                {/* Back Button */}
                                <div className="flex w-full justify-between">
                                    <div>
                                        <Button variant="outline" onClick={() => router.visit('/attendance')} className="border-gray-300">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setShowPreview(true)} className="hover:bg-blue-50">
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Button>
                                        <Button variant="outline" onClick={handleExport} className="hover:bg-blue-50">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>

            {/* Settings Dialog */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Daily Checking Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="lock-7-days" className="text-base font-semibold">
                                        Lock Period: 7 Days
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Employees will be locked for 7 days after assignment</p>
                                </div>
                                <Switch id="lock-7-days" checked={lockPeriod7Days} onCheckedChange={handle7DaysToggle} disabled={savingSettings} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="lock-14-days" className="text-base font-semibold">
                                        Lock Period: 14 Days
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Employees will be locked for 14 days after assignment</p>
                                </div>
                                <Switch id="lock-14-days" checked={lockPeriod14Days} onCheckedChange={handle14DaysToggle} disabled={savingSettings} />
                            </div>
                        </div>

                        {savingSettings && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving settings...
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* PDF Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="h-[90vh] w-full min-w-[70vw] p-0">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle>Daily Checking PP Crew Preview</DialogTitle>
                    </DialogHeader>
                    <div className="h-[calc(90vh-80px)] w-full overflow-auto bg-gray-100">
                        <style>
                            {`
                                .react-pdf__Page {
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    max-width: 100% !important;
                                }
                                .react-pdf__Page__canvas {
                                    margin: 0 !important;
                                    display: block !important;
                                    max-width: 100% !important;
                                    width: 100% !important;
                                    height: auto !important;
                                }
                                .react-pdf__Document {
                                    display: flex !important;
                                    flex-direction: column !important;
                                    align-items: stretch !important;
                                    width: 100% !important;
                                }
                                .react-pdf__Page__textContent {
                                    width: 100% !important;
                                }
                            `}
                        </style>
                        {showPreview && (
                            <PDFViewerWrapper
                                date={date}
                                assignmentData={assignmentData}
                                timeData={timeData}
                                employees={employees}
                                leaveData={leaveData}
                                preparedBy={preparedBy}
                                checkedBy={checkedBy}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}

// PDF Viewer Wrapper Component
function PDFViewerWrapper({
    date,
    assignmentData,
    timeData,
    employees,
    leaveData,
    preparedBy,
    checkedBy,
}: {
    date: string;
    assignmentData: { [key: string]: string[] };
    timeData: {
        [key: string]: { [slotIndex: number]: { [dayIndex: number]: { time_in: string; time_out: string } } };
    };
    employees: Employee[];
    leaveData: { [key: string]: string };
    preparedBy: string;
    checkedBy: string;
}) {
    const [PackingPlantPDFComponent, setPackingPlantPDFComponent] = useState<React.ComponentType<any> | null>(null);

    useEffect(() => {
        import('./components/packing-plant-pdf').then((module) => {
            const PackingPlantPDF = module.default;
            const weekStartDate = date ? parseDateLocal(date) : new Date();
            const PackingPlantDocument = PackingPlantPDF({
                weekStart: weekStartDate,
                workers: assignmentData,
                timeData: timeData,
                employees: employees,
                leaveData: leaveData,
                preparedBy: preparedBy || '',
                checkedBy: checkedBy || '',
            });
            // Create a component that renders the document
            const PDFComponent = () => PackingPlantDocument();
            setPackingPlantPDFComponent(() => PDFComponent);
        });
    }, [date, assignmentData, timeData, employees, leaveData, preparedBy, checkedBy]);

    if (!PackingPlantPDFComponent) {
        return <div>Loading PDF...</div>;
    }

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
            <PackingPlantPDFComponent />
        </PDFViewer>
    );
}

function SidebarHoverLogic({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const { handleMouseEnter, handleMouseLeave } = useSidebarHover();
    return (
        <>
            <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <AppSidebar onMouseLeave={handleMouseLeave} />
            {children}
        </>
    );
}
