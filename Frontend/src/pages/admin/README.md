# Admin User Management Dashboard

A modern, professional admin dashboard for managing users and staff in an e-commerce platform.

## Features

### 📊 Analytics Dashboard
- **Total Users**: Track all registered users
- **Active Users**: Monitor currently active accounts
- **Total Staff**: View staff member count
- **New Users This Month**: Track monthly growth

### 👥 User Management
- **Comprehensive User Table** with:
  - Profile pictures with avatar fallbacks
  - Full name and email
  - Phone number
  - Role badges (Customer, Staff, Admin)
  - Status indicators (Active, Suspended, Pending)
  - Registration date
  - Last login timestamp
  
### ⚙️ Admin Actions
- **View Details**: Complete user profile information
- **Edit User**: Update user information, role, and status
- **Suspend/Activate**: Toggle account status
- **Delete User**: Remove users with confirmation modal
- **Send Message**: Direct communication with users
- **Change Roles**: Assign Customer, Staff, or Admin roles
- **Assign Departments**: Sales, Support, Delivery, Inventory, Management

### 👔 Staff Management
- **Separate Staff Tab**: Dedicated view for staff members
- **Add New Staff**: Create staff accounts with permissions
- **Department Assignment**: Organize by department
- **Permission Management**: Granular access control
  - View Users
  - Edit Users
  - Delete Users
  - Manage Products
  - Manage Orders
  - View Analytics
  - Manage Inventory
  - Customer Support

### 🔍 Advanced Filtering
- **Search**: Find users by name or email
- **Role Filter**: Filter by Customer, Staff, or Admin
- **Status Filter**: Filter by Active, Suspended, or Pending
- **Real-time Updates**: Instant filtering results

### 📤 Export Features
- **CSV Export**: Download filtered user data
- **Includes**: Name, Email, Phone, Role, Status, Registration Date, Last Login

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on desktop and tablet
- **Dark Mode Support**: Toggle between light and dark themes
- **Smooth Animations**: Hover effects and transitions
- **Confirmation Modals**: Prevent accidental deletions
- **Toast Notifications**: Real-time feedback
- **Accessible**: WCAG compliant components

## Tech Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful, consistent icons
- **shadcn/ui**: High-quality component library

## Component Structure

```
Frontend/src/
├── pages/admin/
│   └── UserManagement.tsx          # Main page component
├── components/admin/
│   ├── AdminLayout.tsx              # Dashboard layout with sidebar
│   ├── StatsCard.tsx                # Analytics card component
│   ├── UserDetailsModal.tsx         # User details view
│   ├── EditUserModal.tsx            # Edit user form
│   ├── DeleteConfirmModal.tsx       # Delete confirmation
│   └── AddStaffModal.tsx            # Add staff form
└── components/ui/
    ├── table.tsx                    # Table components
    ├── tabs.tsx                     # Tab components
    ├── dialog.tsx                   # Modal dialogs
    ├── select.tsx                   # Dropdown selects
    ├── badge.tsx                    # Status badges
    ├── avatar.tsx                   # User avatars
    └── ... (other UI components)
```

## Usage

### Basic Setup

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import UserManagement from '@/pages/admin/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Customization

#### Update Mock Data
Replace the `mockUsers` array in `UserManagement.tsx` with your API data:

```tsx
const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  fetchUsers().then(setUsers);
}, []);
```

#### Add API Integration
```tsx
const handleDeleteUser = async (userId: string) => {
  await api.deleteUser(userId);
  setUsers(users.filter(u => u.id !== userId));
};
```

## Color Palette

The dashboard uses a professional color scheme:
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)
- **Muted**: Gray (#6B7280)

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- ARIA labels and roles
- Focus indicators
- Color contrast compliance

## Performance

- Lazy loading for modals
- Optimized re-renders with React.memo
- Efficient filtering algorithms
- Virtual scrolling for large datasets (can be added)

## Future Enhancements

- [ ] Real-time notifications with WebSocket
- [ ] Advanced analytics charts
- [ ] Bulk user operations
- [ ] Activity logs and audit trail
- [ ] Email templates
- [ ] Role-based access control (RBAC)
- [ ] Two-factor authentication management
- [ ] User import/export (Excel, JSON)
- [ ] Advanced search with filters
- [ ] User activity timeline

## License

MIT License - feel free to use in your projects!
