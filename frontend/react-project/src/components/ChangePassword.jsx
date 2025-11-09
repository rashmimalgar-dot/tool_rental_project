// src/components/ChangePassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savedPassword, setSavedPassword] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const u = JSON.parse(saved);
      setSavedPassword(u.password || "");
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPass || newPass.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }
    if (newPass !== confirm) {
      alert("Passwords do not match");
      return;
    }
    if (savedPassword && current !== savedPassword) {
      alert("Current password is incorrect");
      return;
    }

    const saved = localStorage.getItem("user");
    const user = saved ? JSON.parse(saved) : {};
    user.password = newPass;
    localStorage.setItem("user", JSON.stringify(user));
    alert("Password changed successfully");
    navigate("/settings");
  };

  // Inline styles
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 16px",
    background: "#ffffff" // plain white background
  };

  const headerStyle = {
    width: "100%",
    maxWidth: "400px",
    marginBottom: "32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };

  const headerTitleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#5C4033" // dark brown
  };

  const headerButtonStyle = {
    fontSize: "16px",
    color: "#8B4513", // saddle brown
    fontWeight: "500",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline"
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    padding: "32px"
  };

  const cardTitleStyle = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#5C4033",
    marginBottom: "24px",
    textAlign: "center"
  };

  const inputGroupStyle = { marginBottom: "20px" };

  const labelStyle = {
    display: "block",
    marginBottom: "4px",
    fontWeight: "500",
    color: "#654321"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #A0522D",
    borderRadius: "12px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    outline: "none",
    fontSize: "14px"
  };

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "24px"
  };

  const saveButtonStyle = {
    flex: 1,
    marginRight: "8px",
    padding: "10px 16px",
    backgroundColor: "#8B4513",
    color: "#ffffff",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s"
  };

  const cancelButtonStyle = {
    flex: 1,
    marginLeft: "8px",
    padding: "10px 16px",
    backgroundColor: "#D2B48C",
    color: "#5C4033",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s"
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <h1 style={headerTitleStyle}>Settings</h1>
        <button style={headerButtonStyle} onClick={() => navigate("/settings")}>
          Back
        </button>
      </header>

      {/* Card */}
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Change Password</h2>
        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Current Password</label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Enter current password"
              style={inputStyle}
            />
          </div>

          {/* New Password */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Enter new password"
              style={inputStyle}
            />
          </div>

          {/* Confirm New Password */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              style={inputStyle}
            />
          </div>

          {/* Buttons */}
          <div style={buttonContainerStyle}>
            <button type="submit" style={saveButtonStyle}>
              Save
            </button>
            <button type="button" style={cancelButtonStyle} onClick={() => navigate("/settings")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
