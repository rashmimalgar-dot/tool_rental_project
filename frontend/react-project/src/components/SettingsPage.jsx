// src/components/SettingsPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Settings.css";
import "./UserDashboard";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Handle Back button
  const handleBack = () => {
    navigate(-1);
  };

  // Handle Sign Out
  const handleSignOut = () => {
    alert("You have been signed out!");
    navigate("/");
  };

  return (
    <div className="settings-container">
      {/* Back Button */}
      <button className="back-btn" onClick={handleBack}>
        &larr; Back
      </button>

      <h1 className="settings-title">Settings</h1>

      {/* Settings Links */}
      <ul className="settings-list">
        <li>
          <Link to="/settings/notifications" className="settings-link">
            Notification Settings
          </Link>
        </li>
        <li>
          <Link to="/settings/privacy" className="settings-link">
            Privacy & Security
          </Link>
        </li>
        <li>
          <Link to="/help" className="settings-link">
            Help & Support
          </Link>
        </li>
        <li>
          <Link to="/about" className="settings-link">
            About / Legal
          </Link>
        </li>
      </ul>

      {/* Sign Out Button */}
      <button className="signout-btn" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
}
