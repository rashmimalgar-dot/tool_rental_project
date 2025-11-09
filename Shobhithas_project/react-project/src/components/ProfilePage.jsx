import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileDashboard() {
  const navigate = useNavigate();

  // ✅ Load user info from localStorage when the component mounts
  const [user, setUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setEditData(storedUser);
    } else {
      // If no user in storage, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  // ✅ Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save profile updates locally
  const handleSaveChanges = () => {
    setUser(editData);
    localStorage.setItem("user", JSON.stringify(editData));
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  // ✅ Logout flow
  const confirmLogout = () => setShowLogoutModal(true);
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    setShowLogoutModal(false);
    navigate("/login");
  };
  const cancelLogout = () => setShowLogoutModal(false);

  // ✅ Basic input styling
  const inputStyle = {
    display: "block",
    width: "100%",
    marginBottom: "12px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #3E2F1C",
    color: "#3E2F1C",
    background: "#FFF9F3",
    fontSize: "14px",
  };

  if (!user) return null; // Wait until user data loads

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5EFE6",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Top Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#3E2F1C",
          color: "#FFF9F3",
          padding: "16px 32px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginRight: "16px",
              background: "transparent",
              border: "none",
              color: "#FFF9F3",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            &larr; Back
          </button>
          <span style={{ fontSize: "20px", fontWeight: "600" }}>👤 Profile</span>
        </div>
        <button
          onClick={confirmLogout}
          style={{
            background: "#3E2F1C",
            color: "#FFF9F3",
            border: "1px solid #FFF9F3",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </nav>

      {/* Profile Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flex: 1,
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            background: "#FFF9F3",
            color: "#3E2F1C",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "24px",
            width: "90%",
            maxWidth: "600px",
          }}
        >
          <h3 style={{ color: "#3E2F1C", marginBottom: "16px" }}>
            User Details
          </h3>

          {!isEditing ? (
            <>
              <p>
                <strong>Full Name:</strong> {user.full_name || "—"}
              </p>
              <p>
                <strong>Email:</strong> {user.email || "—"}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone || "—"}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {user.dob
                  ? new Date(user.dob).toLocaleDateString("en-GB")
                  : "—"}
              </p>
              <p>
                <strong>Address:</strong> {user.address || "—"}
              </p>
              <p>
                <strong>City:</strong> {user.city || "—"}
              </p>
              <p>
                <strong>Area:</strong> {user.area || "—"}
              </p>
              <p>
                <strong>Pincode:</strong> {user.pincode || "—"}
              </p>

              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "10px 16px",
                  background: "#3E2F1C",
                  color: "#FFF9F3",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "12px",
                }}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                name="full_name"
                value={editData.full_name || ""}
                onChange={handleEditChange}
                placeholder="Full Name"
                style={inputStyle}
              />
              <input
                type="email"
                name="email"
                value={editData.email || ""}
                onChange={handleEditChange}
                placeholder="Email"
                style={inputStyle}
              />
              <input
                type="text"
                name="phone"
                value={editData.phone || ""}
                onChange={handleEditChange}
                placeholder="Phone"
                style={inputStyle}
              />
              <input
                type="date"
                name="dob"
                value={editData.dob || ""}
                onChange={handleEditChange}
                style={inputStyle}
              />
              <input
                type="text"
                name="address"
                value={editData.address || ""}
                onChange={handleEditChange}
                placeholder="Address"
                style={inputStyle}
              />
              <input
                type="text"
                name="city"
                value={editData.city || ""}
                onChange={handleEditChange}
                placeholder="City"
                style={inputStyle}
              />
              <input
                type="text"
                name="area"
                value={editData.area || ""}
                onChange={handleEditChange}
                placeholder="Area"
                style={inputStyle}
              />
              <input
                type="text"
                name="pincode"
                value={editData.pincode || ""}
                onChange={handleEditChange}
                placeholder="Pincode"
                style={inputStyle}
              />

              <button
                onClick={handleSaveChanges}
                style={{
                  padding: "10px 16px",
                  background: "#3E2F1C",
                  color: "#FFF9F3",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "12px",
                }}
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#FFF9F3",
              padding: "32px",
              borderRadius: "16px",
              textAlign: "center",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            <p
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#3E2F1C",
                marginBottom: "24px",
              }}
            >
              Are you sure you want to logout?
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  background: "#3E2F1C",
                  color: "#FFF9F3",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "16px",
                }}
              >
                Logout
              </button>
              <button
                onClick={cancelLogout}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  background: "#C1A57B",
                  color: "#3E2F1C",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "16px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
