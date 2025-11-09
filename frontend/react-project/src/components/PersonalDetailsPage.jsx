// src/PersonalDetails.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PersonalDetailsPage() {
  const navigate = useNavigate();

  // Load user from localStorage (or use defaults)
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profilePicUrl: "",
    password: "" // optional for testing
  });

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const [preview, setPreview] = useState(user.profilePicUrl || "");

  useEffect(() => {
    setPreview(user.profilePicUrl || "");
  }, [user.profilePicUrl]);

  function handleChange(e) {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    // local preview (for real app upload file to server)
    const url = URL.createObjectURL(file);
    setPreview(url);

    // you could upload file here and get a url, but for test we store base64 or url
    const reader = new FileReader();
    reader.onload = () => {
      setUser(prev => ({ ...prev, profilePicUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    if (!user.name.trim()) { alert("Name required"); return false; }
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) { alert("Invalid email"); return false; }
    if (user.phone && !/^\d{7,15}$/.test(user.phone)) { alert("Invalid phone"); return false; }
    return true;
  }

  function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;
    localStorage.setItem("user", JSON.stringify(user));
    alert("Details saved");
    navigate("/settings");
  }

  return (
    <div className="settings-form">
      <h3>Personal Details</h3>
      <form onSubmit={handleSave}>
        <div>
          <label>Name</label><br />
          <input name="name" value={user.name} onChange={handleChange} />
        </div>
        <div>
          <label>Email</label><br />
          <input name="email" value={user.email} onChange={handleChange} />
        </div>
        <div>
          <label>Phone</label><br />
          <input name="phone" value={user.phone} onChange={handleChange} />
        </div>
        <div>
          <label>Address</label><br />
          <textarea name="address" value={user.address} onChange={handleChange} />
        </div>
        <div>
          <label>Profile Picture</label><br />
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {preview && <div><img alt="preview" src={preview} style={{ width: 120, height: 120, objectFit: "cover", marginTop: 8 }} /></div>}
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit">Save</button>
          <button type="button" onClick={() => navigate("/settings")} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}