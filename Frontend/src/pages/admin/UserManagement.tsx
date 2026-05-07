import { useState } from 'react';
import { Search, Download, Plus, MoreVertical, Mail, Edit, Trash2, Ban, CheckCircle, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/admin/StatsCard';
import UserDetailsModal from '@/components/admin/UserDetailsModal';
import EditUserModal from '@/components/admin/EditUserModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import AddStaffModal from '@/components/admin/AddStaffModal';
import { Users, UserCheck, UserCog as UserCogIcon, TrendingUp } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Staff' | 'Admin';
  status: 'Active' | 'Suspended' | 'Pending';
  avatar?: string;
  registrationDate: string;
  lastLogin: string;
  department?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Abdusalem Said',
    email: 'abdusalem@gmail.com',
    phone: '+1 234 567 8900',
    role: 'Admin',
    status: 'Active',
    avatar: '',
    registrationDate: '2024-01-15',
    lastLogin: '2026-05-07 10:30 AM',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@email.dev',
    phone: '+1 234 567 8901',
    role: 'Customer',
    status: 'Active',
    registrationDate: '2024-02-20',
    lastLogin: '2026-05-06 03:45 PM',
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol@email.dev',
    phone: '+1 234 567 8902',
    role: 'Customer',
    status: 'Pending',
    registrationDate: '2024-03-10',
    lastLogin: '2026-05-05 09:15 AM',
  },
  {
    id: '4',
    name: 'Manager User',
    email: 'manager@email.dev',
    phone: '+1 234 567 8903',
    role: 'Staff',
    status: 'Active',
    department: 'Sales',
    registrationDate: '2024-01-20',
    lastLogin: '2026-05-07 08:00 AM',
  },
  {
    id: '5',
    name: 'Alice Johnson',
    email: 'alice@email.dev',
    phone: '+1 234 567 8904',
    role: 'Customer',
    status: 'Active',
    registrationDate: '2024-04-05',
    lastLogin: '2026-05-04 02:20 PM',
  },
  {
    id: '6',
    name: 'Super Admin',
    email: 'superadmin@email.dev',
    phone: '+1 234 567 8905',
    role: 'Admin',
    status: 'Active',
    registrationDate: '2023-12-01',
    lastLogin: '2026-05-07 11:00 AM',
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const totalStaff = users.filter(u => u.role === 'Staff' || u.role === 'Admin').length;
  const newUsersThisMonth = users.filter(u => {
    const regDate = new Date(u.registrationDate);
    const now = new Date();
    return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
  }).length;

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const staffUsers = filteredUsers.filter(u => u.role === 'Staff' || u.role === 'Admin');
  const customerUsers = filteredUsers.filter(u => u.role === 'Customer');

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' as 'Active' | 'Suspended' }
        : u
    ));
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Registration Date', 'Last Login'];
    const csvData = filteredUsers.map(u => [
      u.name,
      u.email,
      u.phone,
      u.role,
      u.status,
      u.registrationDate,
      u.lastLogin,
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin': return 'default';
      case 'Staff': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Suspended': return 'destructive';
      case 'Pending': return 'secondary';
      default: return 'outline';
    }
  };

  const UserTable = ({ users }: { users: User[] }) => (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registration</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{user.phone}</div>
              </TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(user.status)}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">{new Date(user.registrationDate).toLocaleDateString()}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">{user.lastLogin}</div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                      <UserCog className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                      {user.status === 'Active' ? (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          Suspend Account
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Activate Account
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteUser(user)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage roles, permissions and account statuses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          trend="+12%"
          trendLabel="from last month"
        />
        <StatsCard
          title="Active Users"
          value={activeUsers}
          icon={UserCheck}
          trend="+8%"
          trendLabel="from last month"
        />
        <StatsCard
          title="Total Staff"
          value={totalStaff}
          icon={UserCogIcon}
          trend="+2"
          trendLabel="new this month"
        />
        <StatsCard
          title="New This Month"
          value={newUsersThisMonth}
          icon={TrendingUp}
          trend="+23%"
          trendLabel="from last month"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="staff">Staff Members</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setIsAddStaffModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <TabsContent value="all" className="space-y-4">
          <UserTable users={filteredUsers} />
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <UserTable users={staffUsers} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <UserDetailsModal
        user={selectedUser}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
      <EditUserModal
        user={selectedUser}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={(updatedUser) => {
          setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
          setIsEditModalOpen(false);
        }}
      />
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        userName={selectedUser?.name || ''}
      />
      <AddStaffModal
        open={isAddStaffModalOpen}
        onOpenChange={setIsAddStaffModalOpen}
        onAdd={(newStaff) => {
          setUsers([...users, { ...newStaff, id: Date.now().toString() }]);
          setIsAddStaffModalOpen(false);
        }}
      />
    </div>
  );
}
