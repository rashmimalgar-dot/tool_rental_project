// src/UserList.jsx
import React, { useEffect, useState } from "react";
import "./UserList.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";


export default function UserList() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch all users from backend
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // ✅ Handle block / unblock / delete actions
  const handleAction = async (user_id, action) => {
    const url = `http://127.0.0.1:5000/api/users/${action}/${user_id}`;

    const method = action === "delete" ? "DELETE" : "PUT";

    await fetch(url, { method });

    // Update the local state immediately
    setUsers((prev) =>
      prev.map((user) =>
        user.user_id === user_id
          ? {
              ...user,
              is_blocked: action === "block" ? 1 : action === "unblock" ? 0 : user.is_blocked,
              is_deleted: action === "delete" ? 1 : user.is_deleted,
            }
          : user
      )
    );
  };

  return (
    

    <div className="user-container">
     <button className="back-btn" onClick={()=>navigate("/admin")}>
        Back
    </button>

      <h2>All Users</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(
            (user) =>
              !user.is_deleted && (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.full_name}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.is_blocked ? "Blocked" : "Active"}</td>
                  <td>
                    {!user.is_blocked ? (
                      <button
                        onClick={() => handleAction(user.user_id, "block")}
                        className="block-btn"
                      >
                        Block
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(user.user_id, "unblock")}
                        className="unblock-btn"
                      >
                        Unblock
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(user.user_id, "delete")}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
          )}
        </tbody>
      </table>
    </div>
  );
}