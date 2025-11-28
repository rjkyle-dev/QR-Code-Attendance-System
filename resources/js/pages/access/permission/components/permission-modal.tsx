'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PermissionModal({ isOpen, onClose }: PermissionModalProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    permission_name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.permission_name.trim()) {
      toast.error('Permission name is required');
      return;
    }

    post('/permission/access/store', {
      onSuccess: () => {
        toast.success('Permission created successfully');
        reset();
        onClose();
      },
      onError: (errors) => {
        if (errors.permission_name) {
          toast.error(errors.permission_name);
        } else {
          toast.error('Failed to create permission');
        }
      }
    });
  };

  const handleClose = () => {
    if (!processing) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Permission</DialogTitle>
          <DialogDescription>
            Create a new permission for your application. Permission names should be descriptive and follow a consistent naming convention.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="permission_name" className="text-right">
                Permission Name
              </Label>
              <Input
                id="permission_name"
                value={data.permission_name}
                onChange={(e) => setData('permission_name', e.target.value)}
                placeholder="e.g., view-users, create-employees"
                className={`col-span-3 ${errors.permission_name ? 'border-red-500' : ''}`}
                disabled={processing}
              />
              {errors.permission_name && (
                <p className="text-sm text-red-500 mt-1 col-span-3 col-start-2">
                  {errors.permission_name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={processing || !data.permission_name.trim()}
            >
              {processing ? 'Creating...' : 'Create Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 