import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./components/ConfirmDialog";

import Login from "./components/Login";
import Signup from "./components/Signup";
import AppShell from "./components/AppShell";

import ProductsPage from "./pages/ProductsPage";
import EmployeesPage from "./pages/EmployeesPage";
import TransactionsPage from "./pages/TransactionsPage";
import StockHealthPage from "./pages/StockHealthPage";
import ReportsPage from "./pages/ReportsPage";
import DashboardPage from "./pages/DashboardPage";
import RecipesPage from "./pages/RecipesPage";

import Customers from "./pages/customers";
import Shifts from "./pages/shifts";

function ManagerRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== "manager") return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [backendSlow, setBackendSlow] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setBackendSlow(true), 6000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading…</p>
        {backendSlow && (
          <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", opacity: 0.55 }}>
            The demo backend is waking up — this can take up to a minute on the free tier.
          </p>
        )}
      </div>
    );
  }

  if (!user) {
    return isLogin ? (
      <Login onToggle={() => setIsLogin(false)} />
    ) : (
      <Signup onToggle={() => setIsLogin(true)} />
    );
  }

  return (
    <AppShell>
      <Routes>
        {/* Primary routes — new IA paths */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/reports" element={<ManagerRoute><ReportsPage /></ManagerRoute>} />
        <Route path="/menu" element={<ProductsPage />} />
        <Route path="/menu/recipes" element={<RecipesPage />} />
        <Route path="/sales/transactions" element={<TransactionsPage />} />
        <Route path="/sales/customers" element={<Customers />} />
        <Route path="/inventory" element={<StockHealthPage />} />
        <Route path="/inventory/products"    element={<Navigate to="/inventory" replace />} />
        <Route path="/inventory/items"       element={<Navigate to="/inventory" replace />} />
        <Route path="/inventory/stocks"      element={<Navigate to="/inventory" replace />} />
        <Route path="/inventory/ingredients" element={<Navigate to="/inventory" replace />} />
        <Route path="/team/employees" element={<EmployeesPage />} />
        <Route path="/team/shifts" element={<Shifts />} />

        {/* Legacy redirects — old paths redirect to new paths */}
        <Route path="/products" element={<Navigate to="/menu" replace />} />
        <Route path="/transactions" element={<Navigate to="/sales/transactions" replace />} />
        <Route path="/customers" element={<Navigate to="/sales/customers" replace />} />
        <Route path="/stocks" element={<Navigate to="/inventory/stocks" replace />} />
        <Route path="/ingredients" element={<Navigate to="/inventory/ingredients" replace />} />
        <Route path="/employees" element={<Navigate to="/team/employees" replace />} />
        <Route path="/shifts" element={<Navigate to="/team/shifts" replace />} />
        <Route path="/reports/employee" element={<Navigate to="/reports" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AppContent />
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
