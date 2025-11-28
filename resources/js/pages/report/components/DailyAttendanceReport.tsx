import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useMemo, useState } from 'react';

type ExportFormat = 'pdf' | 'xlsx';

interface DailyAttendanceReportProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Simple mock rows for layout preview
const mockRows = Array.from({ length: 10 }).map((_, i) => ({
    no: i + 1,
    employeeId: `E-${String(1000 + i)}`,
    name: `Employee ${i + 1}`,
    department: i % 2 === 0 ? 'Packing' : 'Field',
    shift: i % 3 === 0 ? 'Day' : 'Night',
    inAM: '07:59',
    outAM: '12:02',
    inPM: '13:00',
    outPM: '17:01',
    otIn: '-',
    otOut: '-',
    lateMin: i % 4 === 0 ? 5 : 0,
    undertimeMin: 0,
    status: 'Present',
}));

export default function DailyAttendanceReport({ open, onOpenChange }: DailyAttendanceReportProps) {
    const [reportDate, setReportDate] = useState<Date | undefined>(new Date());
    const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
    const [area, setArea] = useState<string>('all');

    const titleDate = useMemo(() => (reportDate ? format(reportDate, 'MMMM dd, yyyy') : ''), [reportDate]);

    const handleExport = () => {
        // wire later to backend; for now just close
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1100px]">
                <DialogHeader>
                    <DialogTitle className="text-lg">Daily Attendance Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Controls */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn('w-full justify-start text-left font-normal', !reportDate && 'text-muted-foreground')}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {reportDate ? titleDate : <span>Select date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent mode="single" selected={reportDate} onSelect={setReportDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Select value={area} onValueChange={setArea}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Area" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Areas</SelectItem>
                                    <SelectItem value="packing">Packing</SelectItem>
                                    <SelectItem value="field">Field</SelectItem>
                                    <SelectItem value="office">Office</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={exportFormat} onValueChange={(v: ExportFormat) => setExportFormat(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Export" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="xlsx">Excel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Report preview styled similarly to provided PDF */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-sm font-semibold">CFARBEMPCO</div>
                                <div className="text-base font-bold">Daily Attendance Report (DTR)</div>
                                <div className="text-xs">{titleDate}</div>
                            </div>

                            <div className="mt-4 overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">#</TableHead>
                                            <TableHead className="whitespace-nowrap">Employee ID</TableHead>
                                            <TableHead className="whitespace-nowrap">Employee Name</TableHead>
                                            <TableHead className="whitespace-nowrap">Department</TableHead>
                                            <TableHead className="whitespace-nowrap">Shift</TableHead>
                                            <TableHead className="whitespace-nowrap">IN AM</TableHead>
                                            <TableHead className="whitespace-nowrap">OUT AM</TableHead>
                                            <TableHead className="whitespace-nowrap">IN PM</TableHead>
                                            <TableHead className="whitespace-nowrap">OUT PM</TableHead>
                                            <TableHead className="whitespace-nowrap">OT IN</TableHead>
                                            <TableHead className="whitespace-nowrap">OT OUT</TableHead>
                                            <TableHead className="whitespace-nowrap">Late (min)</TableHead>
                                            <TableHead className="whitespace-nowrap">Undertime (min)</TableHead>
                                            <TableHead className="whitespace-nowrap">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockRows.map((r) => (
                                            <TableRow key={r.no}>
                                                <TableCell>{r.no}</TableCell>
                                                <TableCell>{r.employeeId}</TableCell>
                                                <TableCell className="whitespace-nowrap">{r.name}</TableCell>
                                                <TableCell>{r.department}</TableCell>
                                                <TableCell>{r.shift}</TableCell>
                                                <TableCell>{r.inAM}</TableCell>
                                                <TableCell>{r.outAM}</TableCell>
                                                <TableCell>{r.inPM}</TableCell>
                                                <TableCell>{r.outPM}</TableCell>
                                                <TableCell>{r.otIn}</TableCell>
                                                <TableCell>{r.otOut}</TableCell>
                                                <TableCell>{r.lateMin}</TableCell>
                                                <TableCell>{r.undertimeMin}</TableCell>
                                                <TableCell>{r.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-xs">
                                <div>Prepared by: ____________________</div>
                                <div>Checked by: ____________________</div>
                                <div>Approved by: ____________________</div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                        <Button variant="main" onClick={handleExport}>
                            Export {exportFormat.toUpperCase()}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
