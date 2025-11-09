// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { NotificationProvider } from "./components/NotificationContext";

// ------------------ AUTH & DASHBOARDS ------------------
import LoginPage from "./components/LoginPage";
import Signup from "./components/SignUp";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";

import AdminProfile from "./components/AdminProfile";
import AdminNotification from "./components/AdminNotification";

import LendDashboard from "./components/LendDashboard";
import BorrowDashboard from "./components/BorrowDashboard";
import ProfilePage from "./components/ProfilePage";
import ToolDescription from "./components/ToolDescription";
import AddTools from "./components/AddTools";
import BorrowedTools from "./components/BorrowedTools";
import TermsPage from "./components/terms";
import UserList from "./components/UserList";

// ------------------ SETTINGS & INFO ------------------
import SettingsPage from "./components/SettingsPage";
import NotificationSettings from "./components/NotificationSettings";
import PrivacySettings from "./components/PrivacySettings";
import Preferences from "./components/Preferences";
import NotificationsPage from "./components/NotificationsPage";
import HelpPage from "./components/HelpPage";
import About from "./components/About";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";




// ------------------ TEMP PLACEHOLDERS ------------------
function LendPage() {
  return <h2>Lend Page</h2>;
}
function BorrowPage() {
  return <h2>Borrow Page</h2>;
}
function MyListPage() {
  return <h2>My List Page</h2>;
}

export default function App() {

  const [user, setUser] = useState(null);
const [isAdmin, setIsAdmin] = useState(false);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const savedIsAdmin = localStorage.getItem("isAdmin") === "true";
  if (savedUser) {
    setUser(savedUser);
    setIsAdmin(savedIsAdmin);
  }
  setLoading(false);
}, []);

const ProtectedRoute = ({ children }) => {
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

  // ✅ Role-based dashboards
  const Dashboard = () => {
    if (!user) return <Navigate to="/login" />;
    return isAdmin ? (
      <AdminDashboard admin={user} />
    ) : (
      <UserDashboard user={user} />
    );
  };

  return (
    <NotificationProvider user={user}>
      <Router>
        <Routes>
          {/* ------------------ AUTH PAGES ------------------ */}
          <Route
            path="/login"
            element={<LoginPage onAuth={setUser} setIsAdmin={setIsAdmin} />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ------------------ DASHBOARD (USER / ADMIN) ------------------ */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ------------------ USER ROUTES ------------------ */}
          <Route
            path="/lend"
            element={
              <ProtectedRoute>
                <LendDashboard lenderId={user?.user_id} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrow"
            element={
              <ProtectedRoute>
                <BorrowDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrowed-tools"
            element={
              <ProtectedRoute>
                <BorrowedTools borrowerId={user?.user_id} />
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
          <Route
            path="/tooldescription"
            element={
              <ProtectedRoute>
                <ToolDescription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addtools"
            element={
              <ProtectedRoute>
                <AddTools lenderId={user?.user_id} />
              </ProtectedRoute>
            }
          />

          {/* ------------------ ADMIN ROUTES ------------------ */}
          {/* ------------------ ADMIN ROUTES ------------------ */}
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard admin={user} />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/profile"
  element={
    <ProtectedRoute>
      <AdminProfile admin={user} />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <ProtectedRoute>
      <UserList />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/notifications"
  element={
    <ProtectedRoute>
      <AdminNotification admin={user} />
    </ProtectedRoute>
  }
/>


          {/* ------------------ SETTINGS ------------------ */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/notifications"
            element={
              <ProtectedRoute>
                <NotificationSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/privacy"
            element={
              <ProtectedRoute>
                <PrivacySettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/preferences"
            element={
              <ProtectedRoute>
                <Preferences />
              </ProtectedRoute>
            }
          />

          {/* ------------------ NOTIFICATIONS & HELP ------------------ */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<About />} />

          {/* ------------------ PLACEHOLDERS ------------------ */}
          <Route path="/lendpage" element={<LendPage />} />
          <Route path="/borrowpage" element={<BorrowPage />} />
          <Route path="/mylist" element={<MyListPage />} />

          {/* ------------------ FALLBACK ------------------ */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}
