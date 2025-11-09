// src/AdminProfile.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProfile.css";

export default function AdminProfile({ admin }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  if (!admin) return <p>Loading...</p>;

  const handleLogoutClick = () => {
    setShowPopup(true); // ✅ Show confirmation popup
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const cancelLogout = () => {
    setShowPopup(false);
  };

  return (
    <div className="admin-profile">
      <h2>Admin Profile</h2>

      <div className="profile-card">
        <p>
          <strong>Name:</strong> {admin.full_name || "Admin"}
        </p>
        <p>
          <strong>Email:</strong> {admin.email || "admin@example.com"}
        </p>
        <p>
          <strong>Role:</strong> Administrator
        </p>
      </div>

      <button className="logout-btn" onClick={handleLogoutClick}>
        Logout
      </button>

      {/* ✅ Popup Confirmation Window */}
      {showPopup && (
        <div className="logout-popup-overlay">
          <div className="logout-popup">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="popup-buttons">
              <button className="yes-btn" onClick={confirmLogout}>
                Yes
              </button>
              <button className="no-btn" onClick={cancelLogout}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}