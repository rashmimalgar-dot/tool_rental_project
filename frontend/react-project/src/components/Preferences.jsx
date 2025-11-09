import React, { useState } from "react";

export default function Preferences() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");

  return (
    <div style={{ padding: "20px" }}>
      <h1>App Preferences</h1>

      <div>
        <label>
          Language:
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option>English</option>
            <option>Hindi</option>
            <option>Kannada</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          /> Dark Mode
        </label>
      </div>
    </div>
  );
}