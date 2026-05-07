import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface NewStaff {
  name: string;
  email: string;
  phone: string;
  role: 'Staff' | 'Admin';
  status: 'Active' | 'Pending';
  department: string;
  registrationDate: string;
  lastLogin: string;
  permissions: string[];
}

interface AddStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (staff: NewStaff) => void;
}

const availablePermissions = [
  { id: 'view_users', label: 'View Users' },
  { id: 'edit_users', label: 'Edit Users' },
  { id: 'delete_users', label: 'Delete Users' },
  { id: 'manage_products', label: 'Manage Products' },
  { id: 'manage_orders', label: 'Manage Orders' },
  { id: 'view_analytics', label: 'View Analytics' },
  { id: 'manage_inventory', label: 'Manage Inventory' },
  { id: 'customer_support', label: 'Customer Support' },
];

export default function AddStaffModal({ open, onOpenChange, onAdd }: AddStaffModalProps) {
  const [formData, setFormData] = useState<Partial<NewStaff>>({
    role: 'Staff',
    status: 'Active',
    permissions: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: NewStaff = {
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      role: formData.role || 'Staff',
      status: formData.status || 'Active',
      department: formData.department || '',
      registrationDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      permissions: formData.permissions || [],
    };
    onAdd(newStaff);
    setFormData({ role: 'Staff', status: 'Active', permissions: [] });
  };

  const handlePermissionToggle = (permissionId: string) => {
    const currentPermissions = formData.permissions || [];
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];
    setFormData({ ...formData, permissions: newPermissions });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Create a new staff account with specific permissions and department assignment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Full Name *</Label>
              <Input
                id="staff-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-email">Email *</Label>
              <Input
                id="staff-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-phone">Phone Number *</Label>
              <Input
                id="staff-phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff-role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as 'Staff' | 'Admin' })}
                >
                  <SelectTrigger id="staff-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff-department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger id="staff-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Delivery">Delivery</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/50">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={formData.permissions?.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                    />
                    <label
                      htmlFor={permission.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Staff Member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
