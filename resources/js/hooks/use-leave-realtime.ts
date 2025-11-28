import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface LeaveUpdate {
  type: string;
  leave_id: number;
  employee_id: number;
  employee_name: string;
  leave_type: string;
  leave_start_date: string;
  leave_end_date: string;
}

interface LeaveStatusUpdate {
  type: string;
  status: string;
  employee_id: number;
  request_id: number | string;
  meta: any;
}

export const useLeaveRealtime = (onLeaveUpdate?: (leave: LeaveUpdate) => void, onStatusUpdate?: (update: LeaveStatusUpdate) => void, supervisorId?: number) => {
  useEffect(() => {
    if (!window.Echo) {
      console.warn('Echo not available');
      return;
    }

    // Listen for new leave requests (supervisor-specific or admin)
    const leaveChannel = supervisorId 
      ? window.Echo.private(`supervisor.${supervisorId}`)
      : window.Echo.channel('admin.leave');
    
    leaveChannel.listen('LeaveRequested', (data: LeaveUpdate) => {
      console.log('New leave request received:', data);
      toast.success(`New leave request from ${data.employee_name}`);
      onLeaveUpdate?.(data);
    });

    // Listen for leave status updates (both admin and employee)
    const notificationsChannel = window.Echo.channel('admin.notifications');
    
    notificationsChannel.listen('RequestStatusUpdated', (data: LeaveStatusUpdate) => {
      console.log('Leave status updated:', data);
      if (data.type === 'leave_status') {
        const statusMessage = data.status === 'approved' ? 'approved' : data.status === 'rejected' ? 'rejected' : data.status;
        toast.info(Leave request );
        onStatusUpdate?.(data);
      }
    });

    return () => {
      leaveChannel.stopListening('LeaveRequested');
      notificationsChannel.stopListening('RequestStatusUpdated');
      if (supervisorId) {
        window.Echo.leaveChannel(`supervisor.${supervisorId}`);
      } else {
        window.Echo.leaveChannel('admin.leave');
      }
      window.Echo.leaveChannel('admin.notifications');
    };
  }, [onLeaveUpdate, onStatusUpdate, supervisorId]);
};
