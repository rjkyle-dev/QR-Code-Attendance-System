import { AppSidebar } from '@/components/app-sidebar';
import { BackButton } from '@/components/back-button';
import { Main } from '@/components/customize/main';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Briefcase, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
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
        title: 'Position Settings',
        href: '/system-settings/position',
    },
];

interface Position {
    id: number;
    name: string;
    department: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface Department {
    id: number;
    name: string;
}

interface Props {
    positions?: Position[];
    departments?: Department[];
}

export default function PositionSettings({ positions: initialPositions = [], departments: initialDepartments = [] }: Props) {
    const positions = initialPositions || [];
    const departments = initialDepartments || [];
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

    const addForm = useForm({
        name: '',
        department: '',
        description: '',
    });

    const editForm = useForm({
        name: '',
        department: '',
        description: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('system-settings.position.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Position created successfully!');
                setIsAddDialogOpen(false);
                addForm.reset();
                router.reload({ only: ['positions', 'departments'] });
            },
            onError: (errors) => {
                if (errors.name) {
                    toast.error(errors.name);
                } else if (errors.department) {
                    toast.error(errors.department);
                } else {
                    toast.error('Failed to create position. Please check your input.');
                }
            },
        });
    };

    const handleEditClick = (position: Position) => {
        setSelectedPosition(position);
        editForm.setData({
            name: position.name,
            department: position.department,
            description: position.description || '',
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPosition) return;

        editForm.put(route('system-settings.position.update', selectedPosition.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Position updated successfully!');
                setIsEditDialogOpen(false);
                setSelectedPosition(null);
                editForm.reset();
                router.reload({ only: ['positions', 'departments'] });
            },
            onError: (errors) => {
                if (errors.name) {
                    toast.error(errors.name);
                } else if (errors.department) {
                    toast.error(errors.department);
                } else {
                    toast.error('Failed to update position. Please check your input.');
                }
            },
        });
    };

    const handleDeleteClick = (position: Position) => {
        setSelectedPosition(position);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!selectedPosition) return;

        router.delete(route('system-settings.position.destroy', selectedPosition.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Position deleted successfully!');
                setIsDeleteDialogOpen(false);
                setSelectedPosition(null);
                router.reload({ only: ['positions', 'departments'] });
            },
            onError: () => {
                toast.error('Failed to delete position. It may be in use.');
            },
        });
    };

    return (
        <SidebarProvider>
            <Head title="Position Settings" />
            <Toaster position="top-right" richColors />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div className="flex items-center gap-4">
                                <BackButton href="/system-settings" />
                                <div>
                                    <div className="ms-2 flex items-center">
                                        <Briefcase className="size-11" />
                                        <div className="ms-2">
                                            <h2 className="flex text-2xl font-bold tracking-tight">Position Settings</h2>
                                            <p className="text-muted-foreground">Manage position configurations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add Position
                            </Button>
                        </div>
                        <div className="m-3 no-scrollbar">
                            <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                <CardHeader>
                                    <CardTitle>Position Configuration</CardTitle>
                                    <CardDescription>Add, edit, or delete positions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!positions || positions.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <Briefcase className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                            <p>No positions found. Click "Add Position" to create one.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>ID</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Department</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {positions.map((position) => (
                                                        <TableRow key={position.id}>
                                                            <TableCell className="font-medium">{position.id}</TableCell>
                                                            <TableCell className="font-medium">{position.name}</TableCell>
                                                            <TableCell>{position.department}</TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {position.description || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleEditClick(position)}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteClick(position)}
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

            {/* Add Position Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Position</DialogTitle>
                        <DialogDescription>Create a new position for your organization.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-department">
                                    Department <span className="text-red-600">*</span>
                                </Label>
                                <Select
                                    value={addForm.data.department}
                                    onValueChange={(value) => addForm.setData('department', value)}
                                >
                                    <SelectTrigger className={addForm.errors.department ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.name}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={addForm.errors.department} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-name">
                                    Position Name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="add-name"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    placeholder="e.g., Finance Supervisor"
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
                                    placeholder="Optional description for this position"
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
                                {addForm.processing ? 'Creating...' : 'Create Position'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Position Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Position</DialogTitle>
                        <DialogDescription>Update position information.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-department">
                                    Department <span className="text-red-600">*</span>
                                </Label>
                                <Select
                                    value={editForm.data.department}
                                    onValueChange={(value) => editForm.setData('department', value)}
                                >
                                    <SelectTrigger className={editForm.errors.department ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.name}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.department} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">
                                    Position Name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    placeholder="e.g., Finance Supervisor"
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
                                    placeholder="Optional description for this position"
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
                                {editForm.processing ? 'Updating...' : 'Update Position'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Position</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedPosition?.name}"? This action cannot be undone.
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
