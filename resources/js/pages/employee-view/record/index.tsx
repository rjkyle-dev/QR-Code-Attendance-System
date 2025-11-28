import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { SectionCards } from './components/section-cards';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluation Management',
        href: '/evaluation',
    },
];

export default function Index() {
    const [loading, setLoading] = useState(true);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evaluation" />
            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                <div>
                    <div className="ms-2 flex items-center">
                        <Users className="size-11" />
                        <div className="ms-2">
                            <h2 className="flex text-2xl font-bold tracking-tight">Evaluation</h2>
                            <p className="text-muted-foreground">Manage your organization's workforce</p>
                        </div>
                    </div>
                </div>
            </div>
            <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                <TabsContent value="overview" className="space-y-4">
                    <div className="flex flex-1 flex-col">
                        <div className="relative flex flex-1 flex-col">
                            <div className="@container/main flex flex-1 flex-col gap-2">
                                <div className="flex flex-col">
                                    <SectionCards />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <Separator className="shadow-sm" />
            </Tabs>
            <div className="m-3 no-scrollbar">
                <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                    <CardHeader>
                        <CardTitle>Evaluation List</CardTitle>
                        <CardDescription>List of Evaluation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns([])} data={[]} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
