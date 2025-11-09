import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";
import "./terms.jsx";
import { signupUser } from "../services/api";


export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    dob: "",
    pincode: "",
    city: "",
    area: "",
    password: "",
  });

  const [success, setSuccess] = useState(false); // ✅ success popup state
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function validateForm() {
    const { phone, dob, pincode } = formData;

    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Phone number must be 10 digits");
      return false;
    }

    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18 || (age === 18 && today < new Date(birthDate.setFullYear(today.getFullYear())))) {
      alert("You must be at least 18 years old to register");
      return false;
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      alert("Pincode must be 6 digits");
      return false;
    }

    return true;
  }


async function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    const res = await signupUser({
      username: formData.name,
      full_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      address: formData.address,
      city: formData.city,
      area: formData.area,
      pincode: formData.pincode,
      password: formData.password,
    });

    alert(res.data.message || "Signup successful!");
    navigate("/login");
  } catch (err) {
    alert(err.response?.data?.error || "Signup failed");
  }
}

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2 className="signup-title">Create Your Account</h2>

        <form className="signup-form" onSubmit={handleSubmit}>
          {/* form fields same as before */}
          <div className="field">
            <label>Name</label>
            <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Phone</label>
            <input type="tel" name="phone" placeholder="9876543210" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" name="email" placeholder="yourname@gmail.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Address</label>
            <textarea name="address" placeholder="Enter your address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Pincode</label>
            <input type="text" name="pincode" placeholder="6-digit pincode" value={formData.pincode} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>City</label>
            <input type="text" name="city" placeholder="Enter city" value={formData.city} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Area</label>
            <input type="text" name="area" placeholder="Enter area/locality" value={formData.area} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
          </div>

          <button className="primary" type="submit">Sign Up</button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>

        {/* ✅ Success popup */}
        {success && <div className="success-popup">Account created successfully! </div>}
      </div>
    </div>
  );
}