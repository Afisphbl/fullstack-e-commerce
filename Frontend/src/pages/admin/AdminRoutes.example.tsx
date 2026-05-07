/**
 * Example: How to integrate Admin Dashboard into your React Router setup
 * 
 * Copy this code into your main App.tsx or routing configuration file
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';

// Example 1: Basic Integration
export function AdminRoutesBasic() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          {/* Add more admin routes here */}
          <Route path="products" element={<div>Products Page</div>} />
          <Route path="orders" element={<div>Orders Page</div>} />
          <Route path="categories" element={<div>Categories Page</div>} />
          <Route path="analytics" element={<div>Analytics Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/products" element={<div>Products Page</div>} />
        <Route path="/about" element={<div>About Page</div>} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Example 2: With Protected Routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = true; // Replace with your auth logic
  const isAdmin = true; // Replace with your role check
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export function AdminRoutesProtected() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
        
        {/* Public Routes */}
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}

// Example 3: Complete App.tsx Integration
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="products" element={<div className="p-8">Products Page - Coming Soon</div>} />
          <Route path="orders" element={<div className="p-8">Orders Page - Coming Soon</div>} />
          <Route path="categories" element={<div className="p-8">Categories Page - Coming Soon</div>} />
          <Route path="analytics" element={<div className="p-8">Analytics Page - Coming Soon</div>} />
          <Route path="settings" element={<div className="p-8">Settings Page - Coming Soon</div>} />
        </Route>

        {/* Your existing routes */}
        <Route path="/" element={<div>Your Home Page</div>} />
        
        {/* 404 */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Quick Start Instructions:
 * 
 * 1. Install required dependencies (if not already installed):
 *    npm install react-router-dom @radix-ui/react-tabs @radix-ui/react-dialog
 *    npm install @radix-ui/react-select @radix-ui/react-dropdown-menu
 *    npm install lucide-react
 * 
 * 2. Copy one of the examples above into your App.tsx
 * 
 * 3. Navigate to http://localhost:5173/admin/users to see the User Management page
 * 
 * 4. Navigate to http://localhost:5173/admin to see the Dashboard
 * 
 * 5. Customize the mock data in UserManagement.tsx with your API calls
 * 
 * 6. Add authentication and authorization as needed
 */

export default App;
