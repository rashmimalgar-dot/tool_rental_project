// src/components/AdminNotification.jsx
import React, { useState } from "react";
import "./AdminNotification.css";

export default function AdminNotification() {
  const [userEmail, setUserEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:5000/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: userEmail, title, message }),
    });
    const data = await res.json();
    setStatus(data.message);
    setUserEmail("");
    setTitle("");
    setMessage("");
  };

  return (
    <div className="send-notification">
      <h2>Send Notification to User</h2>
      <form onSubmit={handleSend}>
        <input
          type="email"
          placeholder="User Email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Message"
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
        <button type="submit">Send</button>
      </form>
      {status && <p className="status">{status}</p>}
    </div>
  );
}
