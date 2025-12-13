import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("access");
    return !!token; // Returns true if token exists
  };

  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;