// src/AdminDashboard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import "./UserList";
import "./AdminNotification";
import "./AdminProfile";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <nav className="top-panel">
        {/* ✅ Fixed route path to /admin/users */}
        <Link to="/admin/users">
          <button className="nav-button">Users</button>
        </Link>

        {/* ✅ Fixed route path to /admin/notifications */}
        <button
          className="nav-button"
          onClick={() => navigate("/admin/notifications")}
        >
          Notifications
        </button>

        {/* ✅ Fixed route path to /admin/profile */}
        <Link to="/admin/profile">
          <button className="nav-button">Profile</button>
        </Link>

        {/* Settings route (can stay global if shared) */}
        <Link to="/settings">
          <button className="nav-button">Settings</button>
        </Link>
      </nav>

      <div className="dashboard-content">
        <h1>Welcome, Admin</h1>
        <p>Select an action from the top panel.</p>
      </div>
    </div>
  );
}
