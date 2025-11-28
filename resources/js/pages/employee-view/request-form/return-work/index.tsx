import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CalendarSync, FileText, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Request Forms',
        href: '/employee-view/requests',
    },
    {
        title: 'Return to Work',
        href: '/employee-view/return-work',
    },
];

export default function ReturnWorkIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Return to Work" />
            <div className="w-full space-y-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xl font-semibold">
                        <CalendarSync className="h-5 w-5 text-emerald-600" />
                        <span>Return to Work Request Form</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Submit your return to work notification</p>
                </div>

                <div className="grid gap-6 md:grid-cols-1">
                    <Card className="border-emerald-200 bg-emerald-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-800">
                                <Plus className="h-5 w-5" />
                                Submit Return to Work Form
                            </CardTitle>
                            <CardDescription>Notify HR and your supervisor about your return to work after an absence</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm text-emerald-700">
                                Use this form to officially notify the organization about your return to work. This helps ensure proper documentation
                                and smooth transition back to your duties.
                            </p>
                            <Button asChild variant="main" className="w-full">
                                <Link href="/employee-view/return-work/request">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Submit Return to Work Form
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Return to Work Guidelines</CardTitle>
                            <CardDescription>Important information about returning to work</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <h4 className="font-medium">Before Returning:</h4>
                                <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                                    <li>Ensure you are medically cleared if applicable</li>
                                    <li>Review any updated policies or procedures</li>
                                    <li>Check with your supervisor about any changes</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">Upon Return:</h4>
                                <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                                    <li>Submit this form at least 24 hours before your return</li>
                                    <li>Bring any required documentation</li>
                                    <li>Meet with your supervisor if requested</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card> */}
                </div>

                {/* <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>Get help with your return to work process</CardDescription>
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
