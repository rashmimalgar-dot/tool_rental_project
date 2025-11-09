import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css"; // optional styling

export default function LoginPage({ onAuth, setIsAdmin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Email validation (only Gmail allowed)
  function validateEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  }

  // ✅ Password validation (min 6 chars, one uppercase, one number)
  function validatePassword(pw) {
    // FIXED REGEX: you missed the "*" in lookaheads
    return /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(pw);
  }

  // ✅ Password strength indicator
  function checkStrength(pw) {
    if (pw.length < 6) return "Weak";
    if (/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(pw)) return "Strong";
    return "Medium";
  }

  function handlePasswordChange(e) {
    const value = e.target.value;
    setPassword(value);
    setStrength(checkStrength(value));
  }

  // ✅ Handle Login
  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Email must be a valid Gmail address.");
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must have at least 6 characters, one uppercase letter, and one number."
      );
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/login", {
        email,
        password,
      });

      const data = response.data;
      console.log("🔹 Login Response:", data);

      const user = data.user || {};
      const isAdmin = data.is_admin === true;

      // ✅ Save in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAdmin", isAdmin ? "true" : "false");

      // ✅ Update app-level state
      onAuth?.(user);
      setIsAdmin?.(isAdmin);

      // ✅ Redirect
      console.log(
        `✅ ${isAdmin ? "Admin" : "User"} login successful — redirecting to /dashboard`
      );
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      if (err.response) {
        setError(
          err.response.data.error ||
            err.response.data.message ||
            "Login failed."
        );
      } else {
        setError("Server error. Please try again later.");
      }
    }
  }

  return (
    <div className="lp-page">
      <div className="lp-card">
        {/* Optional Logo */}
        <div className="lp-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            width="60"
            height="60"
          >
            <circle cx="32" cy="20" r="12" fill="#A0522D" />
            <path
              fill="#A0522D"
              d="M48 58c0-8.8-7.2-16-16-16s-16 7.2-16 16h32z"
            />
          </svg>
        </div>

        <h2 className="lp-title">
          ToolShare — “Sharing Tools, Building Community”
        </h2>

        <form className="lp-form" onSubmit={handleLogin}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {/* FIXED: Proper JSX string interpolation */}
            {password && (
              <div className={`strength ${strength.toLowerCase()}`}>
                Strength: {strength}
              </div>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          <button className="primary" type="submit">
            Login
          </button>

          <div className="forgot">
            <button
              type="button"
              className="link-like"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>
        </form>

        <div className="signup">
          Don’t have an account?{" "}
          <Link to="/signup" className="link-like">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
