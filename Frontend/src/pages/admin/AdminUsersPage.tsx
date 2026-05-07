import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  UserX, 
  Mail, 
  Download,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  History,
  Lock,
  ArrowUpRight,
  Shield,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, updateUser, deleteUser, createUser, User } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer 
} from 'recharts';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

const chartData = [
  { name: 'W1', users: 400 },
  { name: 'W2', users: 600 },
  { name: 'W3', users: 500 },
  { name: 'W4', users: 800 },
  { name: 'W5', users: 700 },
  { name: 'W6', users: 1100 },
];

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [addUserRole, setAddUserRole] = useState('user');
  const [addUserStatus, setAddUserStatus] = useState('active');

  const statusFilter = searchParams.get('status') || 'all';
  const roleFilter = searchParams.get('role') || 'all';

  const handleTabChange = (val: string) => {
    if (val === 'staff') {
      searchParams.set('role', 'admin,manager,staff');
    } else {
      searchParams.delete('role');
    }
    setSearchParams(searchParams);
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers', statusFilter, roleFilter],
    queryFn: () => {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (roleFilter !== 'all') filters.role = roleFilter;
      return fetchUsers(filters);
    },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success("User created successfully");
      setIsAddUserOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to create user"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success("User updated successfully");
      setEditingUser(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staffUsers = users.filter(user => user.role !== 'user');
  const activeUsersCount = users.filter(user => user.status === 'active').length;
  
  const currentTab = roleFilter.includes('admin') ? 'staff' : 'all';
  const newThisMonth = users.filter(user => {
    const date = new Date(user.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">Pending</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20">{status || 'Unknown'}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20 gap-1"><Shield className="h-3 w-3" /> Admin</Badge>;
      case 'manager':
        return <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20 hover:bg-sky-500/20 gap-1"><Briefcase className="h-3 w-3" /> Manager</Badge>;
      case 'super-admin':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20 gap-1"><Shield className="h-3 w-3" /> Super Admin</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20">Customer</Badge>;
    }
  };

  const handleToggleStatus = (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    updateMutation.mutate({ id: user.id, data: { status: nextStatus } });
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
      setUserToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Registration Date'];
    const rows = filteredUsers.map(u => [
      u.name,
      u.email,
      u.role,
      u.status,
      format(new Date(u.createdAt), 'yyyy-MM-dd')
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard 
          title="Total Users" 
          value={users.length} 
          icon={<Users className="h-5 w-5 text-primary" />} 
          trend="+12%" 
          bg="primary" 
        />
        <AnalyticsCard 
          title="Active Users" 
          value={activeUsersCount} 
          icon={<UserCheck className="h-5 w-5 text-emerald-500" />} 
          trend="+5%" 
          bg="emerald" 
        />
        <AnalyticsCard 
          title="Total Staff" 
          value={staffUsers.length} 
          icon={<ShieldCheck className="h-5 w-5 text-indigo-500" />} 
          subValue="12 Departments" 
          bg="indigo" 
        />
        <AnalyticsCard 
          title="New this month" 
          value={newThisMonth} 
          icon={<UserPlus className="h-5 w-5 text-amber-500" />} 
          chartData={chartData} 
          bg="amber" 
        />
      </div>

      {/* Main Content Area */}
      <Card className="border-none shadow-sm bg-card overflow-hidden">
        <Tabs value={currentTab} className="w-full">
          <CardHeader className="border-b border-border/50 pb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-xl font-display font-bold text-foreground">User Management</CardTitle>
                <p className="text-sm text-muted-foreground">Manage roles, permissions and account statuses</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
                <Button size="sm" className="gap-2" onClick={() => setIsAddUserOpen(true)}>
                  <Plus className="h-4 w-4" /> Add User
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-card data-[state=active]:shadow-sm" onClick={() => handleTabChange('all')}>All Users</TabsTrigger>
                <TabsTrigger value="staff" className="data-[state=active]:bg-card data-[state=active]:shadow-sm" onClick={() => handleTabChange('staff')}>Staff Members</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Filter Bar */}
            <div className="p-4 border-b border-border/50 bg-muted/5 flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or email..." 
                  className="pl-9 bg-card"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select 
                  value={statusFilter} 
                  onValueChange={(v) => {
                    if (v === 'all') searchParams.delete('status');
                    else searchParams.set('status', v);
                    setSearchParams(searchParams);
                  }}
                >
                  <SelectTrigger className="w-[140px] bg-card">
                    <div className={`h-2 w-2 rounded-full mr-2 ${statusFilter === 'active' ? 'bg-emerald-500' : statusFilter === 'suspended' ? 'bg-rose-500' : statusFilter === 'pending' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={roleFilter} 
                  onValueChange={(v) => {
                    if (v === 'all') searchParams.delete('role');
                    else searchParams.set('role', v);
                    setSearchParams(searchParams);
                  }}
                >
                  <SelectTrigger className="w-[140px] bg-card">
                    <Filter className="h-3.5 w-3.5 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="manager">Managers</SelectItem>
                    <SelectItem value="user">Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-12 flex justify-center"><LoadingSpinner size={32} /></div>
              ) : (
                <>
                  <TabsContent value="all" className="m-0">
                    <UserTable 
                      users={filteredUsers} 
                      onView={setViewingUser} 
                      onEdit={setEditingUser} 
                      onToggleStatus={handleToggleStatus} 
                      onDelete={setUserToDelete} 
                    />
                  </TabsContent>
                  <TabsContent value="staff" className="m-0">
                    <UserTable 
                      users={staffUsers} 
                      onView={setViewingUser} 
                      onEdit={setEditingUser} 
                      onToggleStatus={handleToggleStatus} 
                      onDelete={setUserToDelete} 
                      isStaffView
                    />
                  </TabsContent>
                </>
              )}
            </div>
          </CardContent>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-border/50 bg-muted/5 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} entries
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/20">1</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </Tabs>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={(o) => !o && setViewingUser(null)}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle>User Profile Details</DialogTitle>
            <DialogDescription>Detailed information about the selected user account.</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={viewingUser.photo ? `/img/users/${viewingUser.photo}` : undefined} />
                    <AvatarFallback className="text-xl">{viewingUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">{viewingUser.name}</h4>
                    <p className="text-sm text-muted-foreground">{viewingUser.email}</p>
                    <div className="mt-1 flex gap-2">
                      {getRoleBadge(viewingUser.role)}
                      {getStatusBadge(viewingUser.status)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Info</p>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="text-foreground font-mono">{viewingUser.id.slice(-8)}</span>
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="text-foreground">{format(new Date(viewingUser.createdAt), 'PPP')}</span>
                    <span className="text-muted-foreground">Last Login:</span>
                    <span className="text-foreground">2 hours ago</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                  <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" /> Recent Activity
                  </h5>
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="flex gap-3 text-xs">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-foreground font-medium">Logged in from Chrome on Windows</p>
                          <p className="text-muted-foreground">May {format(new Date(), 'dd')}, 2026 - 10:4{i} AM</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUser(null)}>Close</Button>
            <Button onClick={() => { setEditingUser(viewingUser); setViewingUser(null); }}>Edit Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="bg-card sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account with specific role and status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            createMutation.mutate(data);
          }} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input name="phone" placeholder="+1..." />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input name="email" type="email" placeholder="john@example.com" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input name="password" type="password" required minLength={8} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input name="passwordConfirm" type="password" required minLength={8} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select name="role" value={addUserRole} onValueChange={setAddUserRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Customer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="role" value={addUserRole} /> 
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select name="status" value={addUserStatus} onValueChange={setAddUserStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="status" value={addUserStatus} />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Edit User Account</DialogTitle>
            <DialogDescription>Modify user information and access levels.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input defaultValue={editingUser.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <Input defaultValue={editingUser.email} disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <Select defaultValue={editingUser.role}>
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Customer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select 
                    defaultValue={editingUser.status || (editingUser.active ? "active" : "suspended")}
                    onValueChange={(v) => updateMutation.mutate({ id: editingUser.id, data: { status: v, active: v === 'active' } })}
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={() => setEditingUser(null)} className="gap-2">
              <Lock className="h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(o) => !o && setUserToDelete(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const AnalyticsCard = ({ title, value, icon, trend, subValue, chartData, bg }: any) => (
  <Card className="border-none shadow-sm bg-card hover:shadow-md transition-all group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 bg-${bg}-500/10 rounded-lg group-hover:scale-110 transition-transform`}>
          {React.cloneElement(icon, { className: `h-5 w-5 text-${bg}-500` })}
        </div>
        {trend && (
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">{trend}</Badge>
        )}
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
      </div>
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-foreground">{value.toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        {chartData && (
          <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="users" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const UserTable = ({ users, onView, onEdit, onToggleStatus, onDelete, isStaffView }: any) => {
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20 gap-1"><Shield className="h-3 w-3" /> Admin</Badge>;
      case 'manager':
        return <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20 hover:bg-sky-500/20 gap-1"><Briefcase className="h-3 w-3" /> Manager</Badge>;
      case 'super-admin':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20 gap-1"><Shield className="h-3 w-3" /> Super Admin</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20">Customer</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader className="bg-muted/30">
        <TableRow>
          <TableHead className="w-[280px]">User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Registration</TableHead>
          {isStaffView && <TableHead>Permissions</TableHead>}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No users found.</TableCell>
          </TableRow>
        ) : (
          users.map((user: User) => (
            <TableRow key={user.id} className="hover:bg-muted/30 transition-colors group">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={user.photo ? `/img/users/${user.photo}` : undefined} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm text-foreground">{format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                  <span className="text-xs text-muted-foreground">Joined</span>
                </div>
              </TableCell>
              {isStaffView && (
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px] uppercase py-0 px-1">Orders</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase py-0 px-1">Inventory</Badge>
                  </div>
                </TableCell>
              )}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-lg">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onView(user)}>
                      <Eye className="h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onEdit(user)}>
                      <Edit className="h-4 w-4" /> Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Mail className="h-4 w-4" /> Send Email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className={`gap-2 cursor-pointer ${user.status === 'active' ? 'text-amber-500' : 'text-emerald-500'}`}
                      onClick={() => onToggleStatus(user)}
                    >
                      {user.status === 'active' ? (
                        <><UserX className="h-4 w-4" /> Suspend User</>
                      ) : (
                        <><CheckCircle2 className="h-4 w-4" /> Activate User</>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive cursor-pointer" onClick={() => onDelete(user.id)}>
                      <Trash2 className="h-4 w-4" /> Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default AdminUsersPage;
