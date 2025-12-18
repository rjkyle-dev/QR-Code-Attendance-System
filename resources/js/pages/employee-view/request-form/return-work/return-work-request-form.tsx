import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CalendarSync, ChevronDown, Info } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

export default function ReturnWorkRequestForm() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Request Forms', href: '/employee-view/return-work' },
        { title: 'Submit Return to Work Form', href: '/employee-view/return-work/request' },
    ];

    const [returnDate, setReturnDate] = React.useState<Date | undefined>(undefined);
    const [absenceType, setAbsenceType] = React.useState<string | undefined>(undefined);
    const [reason, setReason] = React.useState<string>('');
    const [medicalClearance, setMedicalClearance] = React.useState<string>('');
    const { employee, previousAbsences } = usePage().props as any;
    const [submitting, setSubmitting] = React.useState(false);

    const handleSubmit = async () => {
        if (!returnDate || !absenceType || !reason) {
            toast.error('Please fill in all required fields.');
            return;
        }
        try {
            setSubmitting(true);
            await axios.post('/employee-view/return-work', {
                employee_id: employee?.id ?? null,
                full_name: employee?.employee_name ?? '',
                employee_id_number: employee?.employeeid ?? '',
                department: employee?.department ?? '',
                position: employee?.position ?? '',
                return_date: returnDate.toISOString().slice(0, 10),
                absence_type: absenceType,
                reason: reason,
                medical_clearance: medicalClearance,
                return_date_reported: new Date().toISOString().slice(0, 10),
            });
            toast.success('Return to work notification submitted successfully!');
            // Clear form after successful submission
            setReturnDate(undefined);
            setAbsenceType(undefined);
            setReason('');
            setMedicalClearance('');
        } catch (e) {
            toast.error('Failed to submit return to work notification. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const clearForm = () => {
        setReturnDate(undefined);
        setAbsenceType(undefined);
        setReason(''); 
        setMedicalClearance('');
    };

    // Get current date for calendar restrictions
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Return to Work Form" />
            <div className="w-full space-y-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xl font-semibold">
                        <CalendarSync className="h-5 w-5 text-emerald-600" />
                        <span>Submit Return to Work Form</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Notify HR and your supervisor about your return to work</p>
                </div>

                {/* <Alert className="border-emerald-200 bg-emerald-50/80 text-emerald-900">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Please submit your return to work notification at least 24 hours before your scheduled return date. 
                        This helps ensure proper documentation and smooth transition back to your duties.
                    </AlertDescription>
                </Alert> */}

                <Card>
                    <CardHeader>
                        <CardTitle>Return to Work Notification Form</CardTitle>
                        <CardDescription>Please provide details about your return to work</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="font-medium">
                                    Return Date <span className="text-destructive">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-10 w-full justify-between">
                                            <span>{returnDate ? returnDate.toLocaleDateString() : 'mm/dd/yyyy'}</span>
                                            <ChevronDown className="h-4 w-4 opacity-60" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={returnDate}
                                            onSelect={setReturnDate}
                                            initialFocus
                                            disabled={(date) => date < currentDate}
                                            className="rounded-md border"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">
                                    Type of Absence <span className="text-destructive">*</span>
                                </Label>
                                <Select value={absenceType} onValueChange={setAbsenceType}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select absence type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                        <SelectItem value="Vacation Leave">Vacation Leave</SelectItem>
                                        <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                                        <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                                        <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                                        <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-medium">
                                Reason for Return <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please provide details about your return to work and any relevant information..."
                                className="min-h-32"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-medium">
                                Medical Clearance (if applicable)
                            </Label>
                            <Textarea
                                value={medicalClearance}
                                onChange={(e) => setMedicalClearance(e.target.value)}
                                placeholder="If you were on medical leave, please provide details about your medical clearance or any restrictions..."
                                className="min-h-24"
                            />
                        </div>

                        {/* <Alert className="border-amber-200 bg-amber-50/80 text-amber-900">
                            <AlertTitle>Return to Work Policy:</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc space-y-1 pl-4">
                                    <li>Submit return notifications at least 24 hours before your return date</li>
                                    <li>Medical clearance may be required for certain types of absences</li>
                                    <li>Contact your supervisor if you have any work restrictions</li>
                                    <li>Ensure all required documentation is submitted</li>
                                </ul>
                            </AlertDescription>
                        </Alert> */}

                        {previousAbsences && previousAbsences.length > 0 && (
                            <Alert className="border-blue-200 bg-blue-50/80 text-blue-900">
                                <AlertTitle>Recent Absences:</AlertTitle>
                                <AlertDescription>
                                    <div className="space-y-1">
                                        {previousAbsences.slice(0, 3).map((absence: any, index: number) => (
                                            <div key={index} className="text-sm">
                                                <strong>{absence.date}</strong> - {absence.type}: {absence.reason}
                                            </div>
                                        ))}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex items-center justify-between gap-3 pt-2">
                            <div />
                            <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={clearForm}>
                                    Clear Form
                                </Button>
                                <Button variant="main" disabled={submitting} onClick={handleSubmit}>
                                    {submitting ? 'Submitting...' : 'Submit Return to Work Form'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* <Card>
                    <CardHeader>
                        <CardTitle>Emergency Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <div className="font-semibold">HR Department</div>
                                <div className="text-sm text-muted-foreground">Phone: +63 XXX-XXX-XXXX</div>
                                <div className="text-sm text-muted-foreground">Email: hr@cfarbenpo.com</div>
                            </div>
                            <div>
                                <div className="font-semibold">Your Supervisor</div>
                                <div className="text-sm text-muted-foreground">Contact your direct supervisor</div>
                                <div className="text-sm text-muted-foreground">For urgent matters, call directly</div>
                            </div>
                        </div>
                    </CardContent>
                </Card> */}
            </div>
        </AppLayout>
    );
}
