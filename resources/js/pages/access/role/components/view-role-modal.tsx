import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SingleRole } from '@/types/role_permission';
import { Calendar, Shield } from 'lucide-react';

interface ViewRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: SingleRole | null;
}

export default function ViewRoleModal({ isOpen, onClose, role }: ViewRoleModalProps) {
  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>View Role Details</DialogTitle>
          <DialogDescription>
            View detailed information about this role and its permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Role Name</Label>
          </div>
          <div className="pl-6">
            <p className="text-sm font-medium">{role.name}</p>
            <p className="text-xs text-muted-foreground">ID: {role.id}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Created Date</Label>
          </div>
          <div className="pl-6">
            <p className="text-sm">{new Date(role.created_at).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">Permissions</Label>
          </div>
          <div className="pl-6">
            <div className="flex flex-wrap gap-1">
              {role.permissions && role.permissions.length > 0 ? (
                role.permissions.map((permission, index) => (
                  <Badge key={index} variant="secondary">
                    {permission}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No permissions assigned</p>
              )}
            </div>
            {role.permissions && role.permissions.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Total: {role.permissions.length} permission(s)
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 