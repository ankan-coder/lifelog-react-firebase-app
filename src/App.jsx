// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import JournalPage from "./pages/JournalPage";
import TrackerPage from "./pages/TrackerPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoadingSpinner from "./components/LoadingSpinner";

import { testFirebaseConnection } from "./utils/testFirebaseConnection";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 Testing Firebase connection...");
    testFirebaseConnection();

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <LoadingSpinner message="Checking authentication..." />;
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  // Public Route component (redirects to dashboard if already logged in)
  const PublicRoute = ({ children }) => {
    if (loading) {
      return <LoadingSpinner message="Checking authentication..." />;
    }

    if (user) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <JournalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracker"
          element={
            <ProtectedRoute>
              <TrackerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
