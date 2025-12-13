import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login";
import Pos from "./pages/Pos";
import Product from "./pages/Product";
import Receipt from "./pages/Receipt";
import Report from "./pages/Report";
import AddCustomer from "./pages/AddCustomer";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Import the ProtectedRoute component
import ProtectedRoute from "./components/ProtectedRoute";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Root layout */}
        <Route path="/" element={<App />}>
          {/* Public routes */}
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="pos" element={
            <ProtectedRoute>
              <Pos />
            </ProtectedRoute>
          } />
          
          <Route path="product/:id" element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          } />
          
          <Route path="receipt" element={
            <ProtectedRoute>
              <Receipt />
            </ProtectedRoute>
          } />
          
          <Route path="report" element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          } />
          
          <Route path="add-customer" element={
            <ProtectedRoute>
              <AddCustomer />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);