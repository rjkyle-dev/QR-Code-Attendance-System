import { AppSidebar } from '@/components/app-sidebar';
import { BackButton } from '@/components/back-button';
import { Main } from '@/components/customize/main';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Clock, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'System Settings',
        href: '/system-settings',
    },
    {
        title: 'Work Status Settings',
        href: '/system-settings/work-status',
    },
];

interface WorkStatus {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    workStatuses?: WorkStatus[];
}

export default function WorkStatusSettings({ workStatuses: initialWorkStatuses = [] }: Props) {
    const workStatuses = initialWorkStatuses || [];
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedWorkStatus, setSelectedWorkStatus] = useState<WorkStatus | null>(null);

    const addForm = useForm({
        name: '',
        description: '',
    });

    const editForm = useForm({
        name: '',
        description: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('system-settings.work-status.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Work status created successfully!');
                setIsAddDialogOpen(false);
                addForm.reset();
                router.reload({ only: ['workStatuses'] });
            },
            onError: (errors) => {
                if (errors.name) {
                    toast.error(errors.name);
                } else {
                    toast.error('Failed to create work status. Please check your input.');
                }
            },
        });
    };

    const handleEditClick = (workStatus: WorkStatus) => {
        setSelectedWorkStatus(workStatus);
        editForm.setData({
            name: workStatus.name,
            description: workStatus.description || '',
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorkStatus) return;

        editForm.put(route('system-settings.work-status.update', selectedWorkStatus.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Work status updated successfully!');
                setIsEditDialogOpen(false);
                setSelectedWorkStatus(null);
                editForm.reset();
                router.reload({ only: ['workStatuses'] });
            },
            onError: (errors) => {
                if (errors.name) {
                    toast.error(errors.name);
                } else {
                    toast.error('Failed to update work status. Please check your input.');
                }
            },
        });
    };

    const handleDeleteClick = (workStatus: WorkStatus) => {
        setSelectedWorkStatus(workStatus);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!selectedWorkStatus) return;

        router.delete(route('system-settings.work-status.destroy', selectedWorkStatus.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Work status deleted successfully!');
                setIsDeleteDialogOpen(false);
                setSelectedWorkStatus(null);
                router.reload({ only: ['workStatuses'] });
            },
            onError: () => {
                toast.error('Failed to delete work status. It may be in use.');
            },
        });
    };

    return (
        <SidebarProvider>
            <Head title="Work Status Settings" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div className="flex items-center gap-4">
                                <BackButton href="/system-settings" />
                                <div>
                                    <div className="ms-2 flex items-center">
                                        <Clock className="size-11" />
                                        <div className="ms-2">
                                            <h2 className="flex text-2xl font-bold tracking-tight">Work Status Settings</h2>
                                            <p className="text-muted-foreground">Manage work status configurations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add Work Status
                            </Button>
                        </div>
                        <div className="m-3 no-scrollbar">
                            <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                <CardHeader>
                                    <CardTitle>Work Status Configuration</CardTitle>
                                    <CardDescription>Add, edit, or delete work statuses</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!workStatuses || workStatuses.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                            <p>No work statuses found. Click "Add Work Status" to create one.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>ID</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {workStatuses.map((workStatus) => (
                                                        <TableRow key={workStatus.id}>
                                                            <TableCell className="font-medium">{workStatus.id}</TableCell>
                                                            <TableCell className="font-medium">{workStatus.name}</TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {workStatus.description || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleEditClick(workStatus)}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteClick(workStatus)}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>

            {/* Add Work Status Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Work Status</DialogTitle>
                        <DialogDescription>Create a new work status for your organization.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-name">
                                    Work Status Name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="add-name"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    placeholder="e.g., Regular, Add Crew, Probationary"
                                    className={addForm.errors.name ? 'border-red-500' : ''}
                                />
                                <InputError message={addForm.errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-description">Description</Label>
                                <Textarea
                                    id="add-description"
                                    value={addForm.data.description}
                                    onChange={(e) => addForm.setData('description', e.target.value)}
                                    placeholder="Optional description for this work status"
                                    rows={3}
                                />
                                <InputError message={addForm.errors.description} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addForm.processing}>
                                {addForm.processing ? 'Creating...' : 'Create Work Status'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Work Status Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Work Status</DialogTitle>
                        <DialogDescription>Update work status information.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">
                                    Work Status Name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    placeholder="e.g., Regular, Add Crew, Probationary"
                                    className={editForm.errors.name ? 'border-red-500' : ''}
                                />
                                <InputError message={editForm.errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    placeholder="Optional description for this work status"
                                    rows={3}
                                />
                                <InputError message={editForm.errors.description} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Updating...' : 'Update Work Status'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Work Status</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedWorkStatus?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
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

