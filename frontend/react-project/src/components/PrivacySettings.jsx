// src/components/PrivacySettings.jsx
import React, { useState } from "react";

export default function PrivacySettings() {
  const [privateProfile, setPrivateProfile] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Privacy & Security</h1>

      <div>
        <label>
          <input
            type="checkbox"
            checked={privateProfile}
            onChange={() => setPrivateProfile(!privateProfile)}
          /> Make Profile Private
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={twoFA}
            onChange={() => setTwoFA(!twoFA)}
          /> Enable Two-Factor Authentication (2FA)
        </label>
      </div>
    </div>
  );
}