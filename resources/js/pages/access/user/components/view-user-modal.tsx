import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SingleUser } from '@/types/users';
import { Building2, Calendar, Mail, User } from 'lucide-react';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SingleUser | null;
}

export default function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>View User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4 border-b pb-6">
            <div className="relative">
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.fullname}
                  className="h-24 w-24 rounded-full border-4 border-gray-200 object-cover shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/Logo.png';
                  }}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-gray-200 bg-gray-100 shadow-lg">
                  <img
                    src="/Logo.png"
                    alt={user.fullname}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{user.fullname}</h3>
              <p className="text-sm text-gray-500">
                {user.firstname} {user.middlename ? user.middlename + ' ' : ''}{user.lastname}
              </p>
            </div>
          </div>

          {/* User Information Grid */}
          <div className="grid gap-4">
            {/* Email */}
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                <p className="text-sm text-gray-900 mt-1">{user.email}</p>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Building2 className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700">Department</Label>
                <p className="text-sm text-gray-900 mt-1">{user.department || 'N/A'}</p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700">Created Date</Label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Roles */}
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                <User className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700">Roles</Label>
                <div className="mt-2">
                  {user.roles && user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role, index) => {
                        // Define role colors based on role name
                        const getRoleColor = (roleName: string) => {
                          const roleLower = roleName.toLowerCase();
                          if (roleLower.includes('super admin')) {
                            return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
                          } else if (roleLower.includes('admin')) {
                            return 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200';
                          } else if (roleLower.includes('manager')) {
                            return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
                          } else if (roleLower.includes('hr')) {
                            return 'bg-pink-100 text-pink-800 hover:bg-pink-200 border-pink-200';
                          } else if (roleLower.includes('supervisor')) {
                            return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200';
                          } else if (roleLower.includes('employee')) {
                            return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
                          } else {
                            // Default color for other roles
                            return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
                          }
                        };

                        return (
                          <Badge
                            key={index}
                            variant="secondary"
                            className={`${getRoleColor(role)} border`}
                          >
                            {role}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">No roles assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="px-6">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 