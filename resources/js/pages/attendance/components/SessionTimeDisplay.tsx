import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { Edit, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { SessionTimeModal } from './SessionTimeModal';

type Session = {
    id: number;
    session_name: string;
    time_in_start: string;
    time_in_end: string;
    time_out_start: string;
    time_out_end: string;
    late_time?: string;
    double_scan_window?: number;
};

interface Props {
    sessions: Session[];
}

export const SessionTimeDisplay: React.FC<Props> = ({ sessions }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

    const handleUpdateSuccess = () => {
        // Reload just the sessions data so the list reflects the saved times
        try {
            router.reload({ only: ['sessions'] });
        } catch {
            // Fallback if partial reload unsupported
            window.location.reload();
        }
    };

    const handleDelete = (session: Session) => {
        setSessionToDelete(session);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (sessionToDelete) {
            router.delete(`/attendance-session/${sessionToDelete.id}`, {
                onSuccess: () => {
                    toast.success('Session time deleted successfully!');
                    setDeleteModalOpen(false);
                    setSessionToDelete(null);
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    toast.error('Failed to delete session time. Please try again.');
                },
            });
        }
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setSessionToDelete(null);
    };

    const getSessionColor = (sessionName: string) => {
        switch (sessionName) {
            case 'company':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatTime = (time: string) => {
        if (!time) return 'Not set';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Session Times</CardTitle>
                        <CardDescription>Current attendance session settings</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Change Set Time
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {sessions.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">No session times configured yet.</div>
                        ) : (
                            sessions.map((session) => (
                                <div key={session.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center space-x-3">
                                        <Badge className={getSessionColor(session.session_name || 'company')}>{'Attendance Hour'}</Badge>
                                        <div className="space-y-1">
                                            <div className="text-sm">
                                                <span className="font-medium">Time In:</span> {formatTime(session.time_in_start)} -{' '}
                                                {formatTime(session.time_in_end)}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">Time Out:</span>{' '}
                                                {session.time_out_start && session.time_out_end
                                                    ? `${formatTime(session.time_out_start)} - ${formatTime(session.time_out_end)}`
                                                    : 'Not configured'}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">Late Time:</span>{' '}
                                                {session.late_time ? formatTime(session.late_time) : 'Not configured'}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">Double Scan Window:</span>{' '}
                                                {session.double_scan_window ? `${session.double_scan_window} minutes` : 'Not configured'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(session)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <SessionTimeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                mode="update"
                onSuccess={handleUpdateSuccess}
                sessions={sessions}
            />

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Session Time</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the "{sessionToDelete?.session_name}" session time? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={cancelDelete}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
