import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sendCode = async (e) => {
    e?.preventDefault();
    setError("");
    setMessage("");
    if (!email || !email.endsWith("@gmail.com")) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setCodeSent(true);
        setMessage("Verification code sent to your email. (Check spam if not visible.)");
      } else {
        setError(data.error || "Failed to send code.");
      }
    } catch (err) {
      setLoading(false);
      setError("Server error. Make sure backend is running.");
    }
  };

  const verifyCode = async (e) => {
    e?.preventDefault();
    setError("");
    setMessage("");
    if (!code || code.length < 4) {
      setError("Enter the verification code you received.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        // pass email to reset page via location state
        navigate("/reset-password", { state: { email } });
      } else {
        setError(data.error || "Code verification failed.");
      }
    } catch (err) {
      setLoading(false);
      setError("Server error. Make sure backend is running.");
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <h2 className="fp-title">Forgot Password</h2>
        <p className="fp-subtitle">Enter your Gmail to receive a verification code.</p>

        {!codeSent ? (
          <form className="fp-form" onSubmit={sendCode}>
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

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}

            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Code"}
            </button>
          </form>
        ) : (
          <form className="fp-form" onSubmit={verifyCode}>
            <div className="field">
              <label>Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="primary"
                type="submit"
                style={{ flex: 1 }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                className="secondary"
                type="button"
                onClick={() => {
                  // allow user to resend the code
                  setCode("");
                  setCodeSent(false);
                  setMessage("");
                  setError("");
                }}
                disabled={loading}
              >
                Resend
              </button>
            </div>
          </form>
        )}

        <div className="fp-back">
          <button
            className="link-like"
            type="button"
            onClick={() => navigate("/login")}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}