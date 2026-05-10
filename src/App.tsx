/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Dashboard } from "./components/Dashboard";
import { Login } from "./pages/Login";
import { Users } from "./pages/Users";
import { Destinations } from "./pages/Destinations";
import { Packages } from "./pages/Packages";
import { Blogs } from "./pages/Blogs";
import { BlogCategories } from "./pages/BlogCategories";
import { Roles } from "./pages/Roles";
import { Orders } from "./pages/Orders";
import { Payments } from "./pages/Payments";
import { PaymentMethods } from "./pages/PaymentMethods";
import { Profile } from "./pages/Profile";
import { useAuthStore } from "./store/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/destinations" 
            element={
              <ProtectedRoute>
                <Destinations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/packages" 
            element={
              <ProtectedRoute>
                <Packages />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/blog" 
            element={
              <ProtectedRoute>
                <Blogs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/roles" 
            element={
              <ProtectedRoute>
                <Roles />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/blog-categories" 
            element={
              <ProtectedRoute>
                <BlogCategories />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payments" 
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment-methods" 
            element={
              <ProtectedRoute>
                <PaymentMethods />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
