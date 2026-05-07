# Admin Dashboard Setup Guide

Complete guide to set up and customize the Admin User Management Dashboard.

## 📦 Installation

### 1. Required Dependencies

Make sure you have these packages installed:

```bash
# Core dependencies (should already be installed)
npm install react react-dom react-router-dom
npm install typescript @types/react @types/react-dom

# UI Component dependencies
npm install @radix-ui/react-tabs
npm install @radix-ui/react-dialog
npm install @radix-ui/react-select
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-alert-dialog
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-avatar
npm install @radix-ui/react-label

# Icons
npm install lucide-react

# Utilities
npm install clsx tailwind-merge
```

### 2. Tailwind CSS Configuration

Ensure your `tailwind.config.js` includes:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
```

### 3. CSS Variables

Add these to your `src/index.css` or `src/App.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## 🚀 Quick Start

### Step 1: Add Routes to Your App

Update your `src/App.tsx`:

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

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Access the Dashboard

Navigate to:
- Dashboard: `http://localhost:5173/admin`
- User Management: `http://localhost:5173/admin/users`

## 🎨 Customization

### Change Color Scheme

Edit the CSS variables in your `index.css`:

```css
:root {
  --primary: 142 76% 36%;  /* Green theme */
  --primary-foreground: 355 100% 97%;
}
```

### Update Mock Data

In `src/pages/admin/UserManagement.tsx`, replace `mockUsers` with your API:

```tsx
const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  // Fetch from your API
  fetch('/api/users')
    .then(res => res.json())
    .then(data => setUsers(data));
}, []);
```

### Add API Integration

```tsx
// Delete user
const handleConfirmDelete = async () => {
  if (selectedUser) {
    await fetch(`/api/users/${selectedUser.id}`, { method: 'DELETE' });
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
  }
};

// Update user
const handleSaveUser = async (updatedUser: User) => {
  await fetch(`/api/users/${updatedUser.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedUser),
  });
  setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
};
```

## 🔐 Add Authentication

### Protected Route Example

```tsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuth(); // Your auth hook
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Use it in routes
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

## 📱 Mobile Responsiveness

The dashboard is fully responsive:
- **Desktop**: Full sidebar + content
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu

Test at different breakpoints:
- `lg`: 1024px (sidebar always visible)
- `md`: 768px (collapsible sidebar)
- `sm`: 640px (mobile view)

## 🌙 Dark Mode

Toggle dark mode programmatically:

```tsx
// In AdminLayout.tsx
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
};

// On mount, check saved preference
useEffect(() => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}, []);
```

## 🧪 Testing

### Test User Actions

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserManagement from './UserManagement';

test('filters users by search query', () => {
  render(<UserManagement />);
  const searchInput = screen.getByPlaceholderText('Search by name or email...');
  fireEvent.change(searchInput, { target: { value: 'John' } });
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

## 📊 Add Real-time Updates

### WebSocket Integration

```tsx
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'USER_UPDATED') {
      setUsers(prev => prev.map(u => 
        u.id === data.user.id ? data.user : u
      ));
    }
  };
  
  return () => ws.close();
}, []);
```

## 🎯 Performance Optimization

### Lazy Load Modals

```tsx
import { lazy, Suspense } from 'react';

const UserDetailsModal = lazy(() => import('./UserDetailsModal'));

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <UserDetailsModal user={selectedUser} />
</Suspense>
```

### Virtualize Large Lists

For 1000+ users, use `react-virtual`:

```bash
npm install @tanstack/react-virtual
```

## 🐛 Troubleshooting

### Issue: Components not styled correctly
**Solution**: Ensure Tailwind CSS is configured and CSS variables are added

### Issue: Icons not showing
**Solution**: Install `lucide-react`: `npm install lucide-react`

### Issue: Modals not opening
**Solution**: Check that Radix UI dialog is installed: `npm install @radix-ui/react-dialog`

### Issue: Dark mode not working
**Solution**: Add `darkMode: ["class"]` to `tailwind.config.js`

## 📚 Additional Resources

- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Router Documentation](https://reactrouter.com/)

## 🤝 Support

For issues or questions:
1. Check the README in `src/pages/admin/README.md`
2. Review the example routes in `AdminRoutes.example.tsx`
3. Inspect browser console for errors

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Tailwind configured
- [ ] CSS variables added
- [ ] Routes configured
- [ ] Development server running
- [ ] Dashboard accessible at `/admin`
- [ ] User management accessible at `/admin/users`
- [ ] Dark mode working
- [ ] Responsive on mobile
- [ ] API integration (optional)
- [ ] Authentication added (optional)

Enjoy your new admin dashboard! 🎉
