# 🚀 Quick Start - Admin Dashboard

Get your admin dashboard running in 5 minutes!

## ⚡ Super Quick Start

```bash
# 1. Navigate to Frontend directory
cd Frontend

# 2. Install dependencies (if not already done)
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:5173/admin/users
```

## 📝 Add Routes to Your App

Open `Frontend/src/App.tsx` and add:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## 🎯 Access the Dashboard

Once running, visit:

- **Dashboard**: http://localhost:5173/admin
- **User Management**: http://localhost:5173/admin/users

## ✨ What You Get

### Dashboard Page (`/admin`)
- 4 analytics cards (Total Revenue, Orders, Products, Users)
- Recent orders table
- Top products widget
- Fully responsive layout

### User Management Page (`/admin/users`)
- Complete user table with avatars
- Search by name or email
- Filter by role (Customer, Staff, Admin)
- Filter by status (Active, Suspended, Pending)
- View user details modal
- Edit user modal
- Delete confirmation modal
- Add staff modal with permissions
- Export to CSV
- Dark mode support

## 🎨 Features to Try

1. **Search**: Type in the search box to filter users
2. **Filter**: Use dropdowns to filter by role or status
3. **View Details**: Click ⋮ menu → "View Details"
4. **Edit User**: Click ⋮ menu → "Edit User"
5. **Toggle Status**: Click ⋮ menu → "Suspend Account" or "Activate Account"
6. **Delete User**: Click ⋮ menu → "Delete User" → Confirm
7. **Add Staff**: Click "Add Staff" button → Fill form → Submit
8. **Export CSV**: Click "Export CSV" button
9. **Dark Mode**: Click 🌙 icon in header
10. **Tabs**: Switch between "All Users" and "Staff Members"

## 📱 Test Responsiveness

- **Desktop**: Full sidebar + all features
- **Tablet**: Collapsible sidebar
- **Mobile**: Drawer menu + horizontal scroll table

Resize your browser to see responsive behavior!

## 🎨 Customize Colors

Edit `Frontend/src/index.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Blue (default) */
  /* Change to: */
  --primary: 142 76% 36%;        /* Green */
  --primary: 262 83% 58%;        /* Purple */
  --primary: 346 77% 50%;        /* Red */
}
```

## 🔌 Connect to Your API

Replace mock data in `UserManagement.tsx`:

```tsx
// Remove this:
const [users, setUsers] = useState<User[]>(mockUsers);

// Add this:
const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  fetch('/api/users')
    .then(res => res.json())
    .then(data => setUsers(data));
}, []);
```

## 🔐 Add Authentication

Wrap admin routes with protection:

```tsx
function ProtectedRoute({ children }) {
  const isAdmin = true; // Replace with your auth check
  
  if (!isAdmin) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Use it:
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route path="users" element={<UserManagement />} />
</Route>
```

## 📚 Documentation

- **Setup Guide**: `ADMIN_SETUP.md` - Complete installation and configuration
- **Features**: `ADMIN_FEATURES.md` - Full feature list and examples
- **Design Specs**: `src/pages/admin/DESIGN_SPECS.md` - Visual design details
- **Component Docs**: `src/pages/admin/README.md` - Component documentation
- **Route Examples**: `src/pages/admin/AdminRoutes.example.tsx` - Integration examples

## 🐛 Troubleshooting

### Issue: Page is blank
**Solution**: Make sure routes are added to App.tsx

### Issue: Styles not working
**Solution**: Check that Tailwind CSS is configured in `tailwind.config.js`

### Issue: Icons not showing
**Solution**: `lucide-react` should already be installed (check package.json)

### Issue: Components not found
**Solution**: Check that all files are in correct directories

## ✅ Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)
- [ ] Routes added to App.tsx
- [ ] Can access `/admin` page
- [ ] Can access `/admin/users` page
- [ ] Search works
- [ ] Filters work
- [ ] Modals open correctly
- [ ] Dark mode toggles
- [ ] Responsive on mobile

## 🎉 You're Done!

Your admin dashboard is ready to use. Now you can:

1. **Customize** the design and colors
2. **Connect** to your backend API
3. **Add** authentication
4. **Extend** with more features

## 💡 Next Steps

1. Replace mock data with real API calls
2. Add authentication and authorization
3. Implement real-time updates with WebSocket
4. Add more admin pages (Products, Orders, etc.)
5. Customize the design to match your brand
6. Add analytics charts with Recharts
7. Implement bulk operations
8. Add email notifications

## 📞 Need Help?

Check the documentation files:
- `ADMIN_SETUP.md` - Detailed setup instructions
- `ADMIN_FEATURES.md` - Complete feature list
- `src/pages/admin/README.md` - Component documentation

---

**Happy coding!** 🚀

Built with ❤️ using React, TypeScript, Tailwind CSS, and shadcn/ui
