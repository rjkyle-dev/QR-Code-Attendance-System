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
import { Building2, Edit, Plus, Trash2 } from 'lucide-react';
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
        title: 'Department Settings',
        href: '/system-settings/department',
    },
];

interface Department {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    departments?: Department[];
}

export default function DepartmentSettings({ departments: initialDepartments = [] }: Props) {
    const departments = initialDepartments || [];
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

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
        addForm.post(route('system-settings.department.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Department created successfully!');
                setIsAddDialogOpen(false);
                addForm.reset();
                router.reload({ only: ['departments'] });
            },
            onError: (errors) => {
                if (errors.name) {
                    toast.error(errors.name);
                } else {
                    toast.error('Failed to create department. Please check your input.');
                }
            },
        });
    };

    const handleEditClick = (department: Department) => {
        setSelectedDepartment(department);
        editForm.setData({
            name: department.name,
            description: department.description || '',
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDepartment) return;

        editForm.put(route('system-settings.department.update', selectedDepartment.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Department updated successfully!');
                setIsEditDialogOpen(false);
                setSelectedDepartment(null);
                editForm.reset();
                router.reload({ only: ['departments'] });
            },
            onError: (errors) => {
                if (errors.name) {
                    toast.error(errors.name);
                } else {
                    toast.error('Failed to update department. Please check your input.');
                }
            },
        });
    };

    const handleDeleteClick = (department: Department) => {
        setSelectedDepartment(department);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!selectedDepartment) return;

        router.delete(route('system-settings.department.destroy', selectedDepartment.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Department deleted successfully!');
                setIsDeleteDialogOpen(false);
                setSelectedDepartment(null);
                router.reload({ only: ['departments'] });
            },
            onError: () => {
                toast.error('Failed to delete department. It may be in use.');
            },
        });
    };

    return (
        <SidebarProvider>
            <Head title="Department Settings" />
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
                                        <Building2 className="size-11" />
                                        <div className="ms-2">
                                            <h2 className="flex text-2xl font-bold tracking-tight">Department Settings</h2>
                                            <p className="text-muted-foreground">Manage department configurations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add Department
                            </Button>
                        </div>
                        <div className="m-3 no-scrollbar">
                            <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                <CardHeader>
                                    <CardTitle>Department Configuration</CardTitle>
                                    <CardDescription>Add, edit, or delete departments</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!departments || departments.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <Building2 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                            <p>No departments found. Click "Add Department" to create one.</p>
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
                                                    {departments.map((department) => (
                                                        <TableRow key={department.id}>
                                                            <TableCell className="font-medium">{department.id}</TableCell>
                                                            <TableCell className="font-medium">{department.name}</TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {department.description || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleEditClick(department)}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteClick(department)}
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

            {/* Add Department Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Department</DialogTitle>
                        <DialogDescription>Create a new department for your organization.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-name">
                                    Department Name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="add-name"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    placeholder="e.g., Human Resources"
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
                                    placeholder="Optional description for this department"
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
                                {addForm.processing ? 'Creating...' : 'Create Department'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Department Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>Update department information.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">
                                    Department Name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    placeholder="e.g., Human Resources"
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
                                    placeholder="Optional description for this department"
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
                                {editForm.processing ? 'Updating...' : 'Update Department'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Department</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedDepartment?.name}"? This action cannot be undone.
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
