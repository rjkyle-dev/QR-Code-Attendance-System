import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Building2, Edit, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { toast, Toaster } from 'sonner';
import { ContentLoading } from '@/components/ui/loading';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { AppSidebar } from '@/components/app-sidebar';

interface Department {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
}

interface Position {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
}

interface SettingsPageProps extends PageProps {
    departments: Department[];
    positions: Position[];
}

export default function SettingsIndex() {
    const { departments, positions } = usePage<SettingsPageProps>().props;
    const [activeTab, setActiveTab] = useState<'departments' | 'positions'>('departments');
    const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
    const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);
    // const [loading, setLoading] = useState(true);


    

    const departmentForm = useForm({
        name: '',
        description: '',
    });

    const positionForm = useForm({
        name: '',
        description: '',
    });

    const handleDepartmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingDepartment) {
            departmentForm.put(route('settings.departments.update', editingDepartment.id), {
                onSuccess: () => {
                    setIsDepartmentDialogOpen(false);
                    setEditingDepartment(null);
                    departmentForm.reset();
                },
            });
        } else {
            router.post(route('settings.departments.store'), departmentForm.data, {
                onSuccess: () => {
                    router.reload({ only: ['departments', 'positions'] });
                },
            });
        }
    };

    const handlePositionSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingPosition) {
            positionForm.put(route('settings.positions.update', editingPosition.id), {
                onSuccess: () => {
                    setIsPositionDialogOpen(false);
                    setEditingPosition(null);
                    positionForm.reset();
                },
            });
        } else {
            router.post(route('settings.positions.store'), positionForm.data, {
                onSuccess: () => {
                    router.reload({ only: ['departments', 'positions'] });
                },
            }); 
        }
    };

    const handleEditDepartment = (department: Department) => {
        setEditingDepartment(department);
        departmentForm.setData({
            name: department.name,
            description: department.description || '',
        });
        setIsDepartmentDialogOpen(true);
    };

    const handleEditPosition = (position: Position) => {
        setEditingPosition(position);
        positionForm.setData({
            name: position.name,
            description: position.description || '',
        });
        setIsPositionDialogOpen(true);
    };

    const handleDeleteDepartment = (department: Department) => {
        departmentForm.delete(route('settings.departments.destroy', department.id));
    };

    const handleDeletePosition = (position: Position) => {
        positionForm.delete(route('settings.positions.destroy', position.id));
    };

    const openNewDepartmentDialog = () => {
        setEditingDepartment(null);
        departmentForm.reset();
        setIsDepartmentDialogOpen(true);
    };

    const openNewPositionDialog = () => {
        setEditingPosition(null);
        positionForm.reset();
        setIsPositionDialogOpen(true);
    };

    return (
      
        <SidebarProvider>
           
            {/* <Toaster position="top-right" richColors /> */}
           
            <SidebarHoverLogic>
                <SidebarInset>
            <Head title="Settings" />
{/* {loading ? (
                        <ContentLoading />
                    ) : (
                          <> */}
            <div className="container mx-auto space-y-6 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">Manage system configurations and customizations</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Tabs */}
                    <div className="flex space-x-2 border-b">
                        <button
                            onClick={() => setActiveTab('departments')}
                            className={`px-4 py-2 font-medium transition-colors ${
                                activeTab === 'departments' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Building2 className="mr-2 inline h-4 w-4" />
                            Departments
                        </button>
                        <button
                            onClick={() => setActiveTab('positions')}
                            className={`px-4 py-2 font-medium transition-colors ${
                                activeTab === 'positions' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Users className="mr-2 inline h-4 w-4" />
                            Positions
                        </button>
                    </div>

                    {/* Departments Tab */}
                    {activeTab === 'departments' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Departments</CardTitle>
                                        <CardDescription>Manage employee departments</CardDescription>
                                    </div>
                                    <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button onClick={openNewDepartmentDialog}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Department
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add Department'}</DialogTitle>
                                                <DialogDescription>
                                                    {editingDepartment ? 'Update department information' : 'Create a new department for employees'}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleDepartmentSubmit}>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="name">Name</Label>
                                                        <Input
                                                            id="name"
                                                            value={departmentForm.data.name}
                                                            onChange={(e) => departmentForm.setData('name', e.target.value)}
                                                            placeholder="Enter department name"
                                                            required
                                                        />
                                                        {departmentForm.errors.name && (
                                                            <p className="mt-1 text-sm text-destructive">{departmentForm.errors.name}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="description">Description</Label>
                                                        <Textarea
                                                            id="description"
                                                            value={departmentForm.data.description}
                                                            onChange={(e) => departmentForm.setData('description', e.target.value)}
                                                            placeholder="Enter department description (optional)"
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter className="mt-6">
                                                    <Button type="button" variant="outline" onClick={() => setIsDepartmentDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={departmentForm.processing}>
                                                        {departmentForm.processing ? 'Saving...' : 'Save'}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {departments.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <Building2 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                            <p>No departments found</p>
                                            <p className="text-sm">Create your first department to get started</p>
                                        </div>
                                    ) : (
                                        departments.map((department) => (
                                            <div key={department.id} className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{department.name}</h3>
                                                    {department.description && (
                                                        <p className="mt-1 text-sm text-muted-foreground">{department.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditDepartment(department)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{department.name}"? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteDepartment(department)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Positions Tab */}
                    {activeTab === 'positions' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Positions</CardTitle>
                                        <CardDescription>Manage employee positions</CardDescription>
                                    </div>
                                    <Dialog open={isPositionDialogOpen} onOpenChange={setIsPositionDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button onClick={openNewPositionDialog}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Position
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{editingPosition ? 'Edit Position' : 'Add Position'}</DialogTitle>
                                                <DialogDescription>
                                                    {editingPosition ? 'Update position information' : 'Create a new position for employees'}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handlePositionSubmit}>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="position-name">Name</Label>
                                                        <Input
                                                            id="position-name"
                                                            value={positionForm.data.name}
                                                            onChange={(e) => positionForm.setData('name', e.target.value)}
                                                            placeholder="Enter position name"
                                                            required
                                                        />
                                                        {positionForm.errors.name && (
                                                            <p className="mt-1 text-sm text-destructive">{positionForm.errors.name}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="position-description">Description</Label>
                                                        <Textarea
                                                            id="position-description"
                                                            value={positionForm.data.description}
                                                            onChange={(e) => positionForm.setData('description', e.target.value)}
                                                            placeholder="Enter position description (optional)"
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter className="mt-6">
                                                    <Button type="button" variant="outline" onClick={() => setIsPositionDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={positionForm.processing}>
                                                        {positionForm.processing ? 'Saving...' : 'Save'}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {positions.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                            <p>No positions found</p>
                                            <p className="text-sm">Create your first position to get started</p>
                                        </div>
                                    ) : (
                                        positions.map((position) => (
                                            <div key={position.id} className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{position.name}</h3>
                                                    {position.description && (
                                                        <p className="mt-1 text-sm text-muted-foreground">{position.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditPosition(position)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Position</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{position.name}"? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeletePosition(position)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        {/* </> */}
                    {/* )} */}
             </SidebarInset>
            </SidebarHoverLogic>
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
