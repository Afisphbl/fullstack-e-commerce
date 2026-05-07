# 🎨 Component Showcase

Visual guide to all admin dashboard components with usage examples.

## 📊 StatsCard Component

**Location**: `src/components/admin/StatsCard.tsx`

### Visual Preview
```
┌─────────────────────────────┐
│ Total Users        [👥]     │
│                              │
│ 7                            │
│                              │
│ +12% from last month         │
└─────────────────────────────┘
```

### Usage
```tsx
import StatsCard from '@/components/admin/StatsCard';
import { Users } from 'lucide-react';

<StatsCard
  title="Total Users"
  value={7}
  icon={Users}
  trend="+12%"
  trendLabel="from last month"
/>
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| title | string | Yes | Card title |
| value | number \| string | Yes | Main value to display |
| icon | LucideIcon | Yes | Icon component |
| trend | string | No | Trend indicator (e.g., "+12%") |
| trendLabel | string | No | Trend description |
| className | string | No | Additional CSS classes |

### Variants
```tsx
// Positive trend (green)
<StatsCard value={100} trend="+15%" />

// Negative trend (red)
<StatsCard value={50} trend="-5%" />

// No trend
<StatsCard value={75} />
```

---

## 👤 UserDetailsModal Component

**Location**: `src/components/admin/UserDetailsModal.tsx`

### Visual Preview
```
┌─────────────────────────────────────┐
│ User Details                    [X] │
│ Complete information about user     │
├─────────────────────────────────────┤
│     ┌────────┐                      │
│     │   AS   │  Abdusalem Said      │
│     └────────┘  [Admin] [Active]    │
│                                     │
│ CONTACT INFORMATION                 │
│ 📧 abdusalem@gmail.com              │
│ 📱 +1 234 567 8900                  │
│                                     │
│ ACCOUNT INFORMATION                 │
│ 🛡️ Role: Admin                      │
│ 💼 Department: Management           │
│ 📅 Registration: Jan 15, 2024       │
│ 🕐 Last Login: May 7, 2026 10:30 AM │
└─────────────────────────────────────┘
```

### Usage
```tsx
import UserDetailsModal from '@/components/admin/UserDetailsModal';

const [selectedUser, setSelectedUser] = useState<User | null>(null);
const [isOpen, setIsOpen] = useState(false);

<UserDetailsModal
  user={selectedUser}
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| user | User \| null | Yes | User object to display |
| open | boolean | Yes | Modal open state |
| onOpenChange | (open: boolean) => void | Yes | Callback when modal state changes |

---

## ✏️ EditUserModal Component

**Location**: `src/components/admin/EditUserModal.tsx`

### Visual Preview
```
┌─────────────────────────────────────┐
│ Edit User                       [X] │
│ Update user information             │
├─────────────────────────────────────┤
│ Full Name                           │
│ [John Doe                        ]  │
│                                     │
│ Email                               │
│ [john@example.com                ]  │
│                                     │
│ Phone Number                        │
│ [+1 234 567 8900                 ]  │
│                                     │
│ Role              Status            │
│ [Admin ▼]         [Active ▼]        │
│                                     │
│ Department                          │
│ [Sales ▼]                           │
│                                     │
│              [Cancel] [Save Changes]│
└─────────────────────────────────────┘
```

### Usage
```tsx
import EditUserModal from '@/components/admin/EditUserModal';

<EditUserModal
  user={selectedUser}
  open={isEditModalOpen}
  onOpenChange={setIsEditModalOpen}
  onSave={(updatedUser) => {
    // Handle save
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  }}
/>
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| user | User \| null | Yes | User to edit |
| open | boolean | Yes | Modal open state |
| onOpenChange | (open: boolean) => void | Yes | State change callback |
| onSave | (user: User) => void | Yes | Save callback |

---

## 🗑️ DeleteConfirmModal Component

**Location**: `src/components/admin/DeleteConfirmModal.tsx`

### Visual Preview
```
┌─────────────────────────────────────┐
│ ⚠️ Are you absolutely sure?         │
│                                     │
│ This action cannot be undone. This  │
│ will permanently delete the account │
│ for John Doe and remove all data.   │
│                                     │
│              [Cancel] [Delete User] │
└─────────────────────────────────────┘
```

### Usage
```tsx
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

<DeleteConfirmModal
  open={isDeleteModalOpen}
  onOpenChange={setIsDeleteModalOpen}
  onConfirm={() => {
    // Handle deletion
    deleteUser(selectedUser.id);
  }}
  userName={selectedUser?.name || ''}
/>
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| open | boolean | Yes | Modal open state |
| onOpenChange | (open: boolean) => void | Yes | State change callback |
| onConfirm | () => void | Yes | Confirm callback |
| userName | string | Yes | User name to display |

---

## 👔 AddStaffModal Component

**Location**: `src/components/admin/AddStaffModal.tsx`

### Visual Preview
```
┌─────────────────────────────────────┐
│ Add New Staff Member            [X] │
│ Create staff account with perms     │
├─────────────────────────────────────┤
│ Full Name *                         │
│ [                                ]  │
│                                     │
│ Email *                             │
│ [                                ]  │
│                                     │
│ Phone Number *                      │
│ [                                ]  │
│                                     │
│ Role *            Department *      │
│ [Staff ▼]         [Sales ▼]         │
│                                     │
│ Permissions                         │
│ ┌─────────────────────────────────┐ │
│ │ ☑ View Users    ☑ Edit Users   │ │
│ │ ☑ Delete Users  ☑ Manage Prod  │ │
│ │ ☑ Manage Orders ☑ View Analytics│ │
│ │ ☑ Manage Inv    ☑ Cust Support │ │
│ └─────────────────────────────────┘ │
│                                     │
│         [Cancel] [Add Staff Member] │
└─────────────────────────────────────┘
```

### Usage
```tsx
import AddStaffModal from '@/components/admin/AddStaffModal';

<AddStaffModal
  open={isAddStaffModalOpen}
  onOpenChange={setIsAddStaffModalOpen}
  onAdd={(newStaff) => {
    // Handle new staff
    setUsers([...users, { ...newStaff, id: generateId() }]);
  }}
/>
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| open | boolean | Yes | Modal open state |
| onOpenChange | (open: boolean) => void | Yes | State change callback |
| onAdd | (staff: NewStaff) => void | Yes | Add callback |

---

## 🏗️ AdminLayout Component

**Location**: `src/components/admin/AdminLayout.tsx`

### Visual Structure
```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR (256px)    │ HEADER (64px)                      │
│                    │ [🔍 Search] [🌙] [🔔] [👤]         │
├────────────────────┼────────────────────────────────────┤
│ [LOGO] VOLTEDGE    │                                    │
│                    │                                    │
│ 📊 Dashboard       │                                    │
│ 👥 Users ◄─────    │        PAGE CONTENT                │
│ 📦 Products        │        (Outlet)                    │
│ 🛒 Orders          │                                    │
│ 🏷️ Categories      │                                    │
│ 📈 Analytics       │                                    │
│ ⚙️ Settings        │                                    │
│                    │                                    │
│ ┌────────────────┐ │                                    │
│ │ [AS] Admin     │ │                                    │
│ │ admin@email    │ │                                    │
│ └────────────────┘ │                                    │
└────────────────────┴────────────────────────────────────┘
```

### Usage
```tsx
import AdminLayout from '@/components/admin/AdminLayout';
import { Outlet } from 'react-router-dom';

// In your routes:
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<Dashboard />} />
  <Route path="users" element={<UserManagement />} />
</Route>
```

### Features
- Fixed sidebar navigation
- Responsive (drawer on mobile)
- Global search bar
- Dark mode toggle
- Notifications dropdown
- User profile menu
- Active route highlighting

---

## 🎴 Badge Component

**Location**: `src/components/ui/badge.tsx`

### Visual Variants
```
[Admin]          - Primary (blue)
[Staff]          - Secondary (gray)
[Customer]       - Outline (border only)
[Active]         - Success (green)
[Suspended]      - Destructive (red)
[Pending]        - Warning (yellow)
```

### Usage
```tsx
import { Badge } from '@/components/ui/badge';

// Role badges
<Badge variant="default">Admin</Badge>
<Badge variant="secondary">Staff</Badge>
<Badge variant="outline">Customer</Badge>

// Status badges
<Badge variant="default">Active</Badge>
<Badge variant="destructive">Suspended</Badge>
<Badge variant="secondary">Pending</Badge>
```

### Variants
| Variant | Use Case | Color |
|---------|----------|-------|
| default | Admin role, Active status | Blue |
| secondary | Staff role, Pending status | Gray |
| outline | Customer role | Border only |
| destructive | Suspended status | Red |

---

## 👤 Avatar Component

**Location**: `src/components/ui/avatar.tsx`

### Visual Examples
```
┌────┐  ┌────┐  ┌────┐
│ AS │  │ JD │  │ BW │
└────┘  └────┘  └────┘
```

### Usage
```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

<Avatar className="h-10 w-10">
  <AvatarImage src={user.avatar} />
  <AvatarFallback className="bg-primary/10 text-primary">
    {getInitials(user.name)}
  </AvatarFallback>
</Avatar>
```

### Sizes
```tsx
// Small (32px)
<Avatar className="h-8 w-8">

// Medium (40px) - Default
<Avatar className="h-10 w-10">

// Large (80px)
<Avatar className="h-20 w-20">
```

---

## 📋 Table Component

**Location**: `src/components/ui/table.tsx`

### Visual Structure
```
┌─────────────────────────────────────────────────────────┐
│ User          │ Contact      │ Role   │ Status │ Actions│
├─────────────────────────────────────────────────────────┤
│ [AS] John Doe │ +1 234...    │ Admin  │ Active │   ⋮   │
│ john@email    │              │        │        │       │
├─────────────────────────────────────────────────────────┤
│ [JD] Jane Doe │ +1 234...    │ Staff  │ Active │   ⋮   │
│ jane@email    │              │        │        │       │
└─────────────────────────────────────────────────────────┘
```

### Usage
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>User</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.role}</TableCell>
        <TableCell>{user.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 🗂️ Tabs Component

**Location**: `src/components/ui/tabs.tsx`

### Visual Structure
```
┌─────────────────────────────────────┐
│ [All Users] [Staff Members]         │
├─────────────────────────────────────┤
│                                     │
│         Tab Content Here            │
│                                     │
└─────────────────────────────────────┘
```

### Usage
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="all">
  <TabsList>
    <TabsTrigger value="all">All Users</TabsTrigger>
    <TabsTrigger value="staff">Staff Members</TabsTrigger>
  </TabsList>
  
  <TabsContent value="all">
    {/* All users content */}
  </TabsContent>
  
  <TabsContent value="staff">
    {/* Staff only content */}
  </TabsContent>
</Tabs>
```

---

## 🎛️ Dropdown Menu Component

**Location**: `src/components/ui/dropdown-menu.tsx`

### Visual Structure
```
      [⋮]
       ↓
┌─────────────────────┐
│ Actions             │
├─────────────────────┤
│ 👁 View Details     │
│ ✏️ Edit User        │
│ 🚫 Suspend Account  │
│ ✉️ Send Message     │
├─────────────────────┤
│ 🗑️ Delete User      │
└─────────────────────┘
```

### Usage
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleView}>
      <Eye className="mr-2 h-4 w-4" />
      View Details
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleEdit}>
      <Edit className="mr-2 h-4 w-4" />
      Edit User
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 🔍 Search & Filter Bar

### Visual Structure
```
┌─────────────────────────────────────────────────────────┐
│ [🔍 Search by name or email...]  [All Status ▼] [All Roles ▼] │
└─────────────────────────────────────────────────────────┘
```

### Usage
```tsx
<div className="flex gap-2">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
    <Input
      placeholder="Search by name or email..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-9"
    />
  </div>
  
  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-[140px]">
      <SelectValue placeholder="All Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Status</SelectItem>
      <SelectItem value="Active">Active</SelectItem>
      <SelectItem value="Suspended">Suspended</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## 🎨 Color System

### Primary Colors
```css
Primary:     #3B82F6  (Blue)
Success:     #10B981  (Green)
Warning:     #F59E0B  (Yellow)
Danger:      #EF4444  (Red)
Muted:       #6B7280  (Gray)
```

### Usage in Components
```tsx
// Primary (Admin, Active)
className="bg-primary text-primary-foreground"

// Success (positive trends)
className="text-green-600"

// Danger (Suspended, Delete)
className="bg-destructive text-destructive-foreground"

// Muted (secondary text)
className="text-muted-foreground"
```

---

## 📱 Responsive Utilities

### Breakpoint Classes
```tsx
// Mobile first approach
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

// Hide on mobile
className="hidden lg:block"

// Show only on mobile
className="lg:hidden"

// Responsive padding
className="p-4 md:p-6 lg:p-8"
```

---

## 🎯 Common Patterns

### Loading State
```tsx
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
) : (
  <UserTable users={users} />
)}
```

### Empty State
```tsx
{users.length === 0 ? (
  <div className="text-center p-8">
    <Users className="h-12 w-12 mx-auto text-muted-foreground" />
    <h3 className="mt-4 text-lg font-semibold">No users found</h3>
    <p className="text-muted-foreground">Try adjusting your filters</p>
  </div>
) : (
  <UserTable users={users} />
)}
```

### Error State
```tsx
{error ? (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
) : (
  <UserTable users={users} />
)}
```

---

This showcase provides visual examples and code snippets for all major components in the admin dashboard!
