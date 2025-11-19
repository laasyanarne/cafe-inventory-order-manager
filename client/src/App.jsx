import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProductsPage from "./pages/ProductsPage";
import EmployeesPage from "./pages/EmployeesPage";
import Customers from "./Customers"; 
import Shifts from "./shifts";    
import Navbar from "./components/Navbar";

function AppContent() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
  }

  if (!user) {
    return isLogin ? (
      <Login onToggle={() => setIsLogin(false)} />
    ) : (
      <Signup onToggle={() => setIsLogin(true)} />
    );
  }

  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/customers" element={<Customers />} />  
      <Route path="/shifts" element={<Shifts />} />       
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>

    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
