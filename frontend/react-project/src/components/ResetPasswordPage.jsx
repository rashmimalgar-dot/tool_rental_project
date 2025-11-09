import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResetPasswordPage.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.message) {
        // Show success message
        setMsg("✅ Password reset successful! Redirecting to login...");

        // Redirect to login after 2 seconds
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMsg(data.error);
      }
    } catch {
      setMsg("Server error");
    }
  };

  return (
    <div className="rp-page">
      <div className="rp-card">
        <h2 className="rp-title">Reset Password</h2>
        <p className="rp-subtitle">
          Enter a new password for <strong>{email}</strong>
        </p>

        <form className="rp-form" onSubmit={resetPassword}>
          <div className="field">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <button type="submit" className="primary">
            Reset Password
          </button>
        </form>

        {msg && (
          <div className={msg.includes("✅") ? "success" : "error"}>{msg}</div>
        )}
      </div>
    </div>
  );
}