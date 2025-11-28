import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface AbsenceUpdate {
  type: string;
  absence_id: number;
  employee_id: number;
  employee_name: string;
  absence_type: string;
  from_date: string;
  to_date: string;
}

interface AbsenceStatusUpdate {
  type: string;
  status: string;
  employee_id: number;
  request_id: number | string;
  meta: any;
}

export const useAbsenceRealtime = (onAbsenceUpdate?: (absence: AbsenceUpdate) => void, onStatusUpdate?: (update: AbsenceStatusUpdate) => void, supervisorId?: number) => {
  useEffect(() => {
    if (!window.Echo) {
      console.warn('Echo not available');
      return;
    }

    // Listen for new absence requests (supervisor-specific or admin)
    const absenceChannel = supervisorId 
      ? window.Echo.private(`supervisor.${supervisorId}`)
      : window.Echo.channel('admin.absence');
    
    absenceChannel.listen('AbsenceRequested', (data: AbsenceUpdate) => {
      console.log('New absence request received:', data);
      toast.success(`New absence request from ${data.employee_name}`);
      onAbsenceUpdate?.(data);
    });

    // Listen for absence status updates (both admin and employee)
    const notificationsChannel = window.Echo.channel('admin.notifications');
    
    notificationsChannel.listen('RequestStatusUpdated', (data: AbsenceStatusUpdate) => {
      console.log('Absence status updated:', data);
      if (data.type === 'absence_status') {
        const statusMessage = data.status === 'approved' ? 'approved' : data.status === 'rejected' ? 'rejected' : data.status;
        toast.info(Absence request );
        onStatusUpdate?.(data);
      }
    });

    return () => {
      absenceChannel.stopListening('AbsenceRequested');
      notificationsChannel.stopListening('RequestStatusUpdated');
      if (supervisorId) {
        window.Echo.leaveChannel(`supervisor.${supervisorId}`);
      } else {
        window.Echo.leaveChannel('admin.absence');
      }
      window.Echo.leaveChannel('admin.notifications');
    };
  }, [onAbsenceUpdate, onStatusUpdate, supervisorId]);
};
