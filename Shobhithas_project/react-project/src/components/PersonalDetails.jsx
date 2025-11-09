import React, { useState } from "react";
import "./personal.css";

const countries = ["India", "USA", "Canada", "Australia"];
const states = [
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "California",
  "Texas",
  "Ontario",
  "Queensland",
];

export default function PersonalDetails({ onSubmit }) {
  const initialForm = {
    fullname: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.fullname) newErrors.fullname = "Full Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.phone) newErrors.phone = "Phone number is required";
    else if (form.phone.length !== 10)
      newErrors.phone = "Phone number must be exactly 10 digits";
    if (!form.gender) newErrors.gender = "Please select gender";
    if (!form.dob) newErrors.dob = "Date of Birth is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.country) newErrors.country = "Country is required";
    if (!form.pincode) newErrors.pincode = "Pincode is required";
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      if (onSubmit) onSubmit(form);
      alert("Form submitted successfully ✅");
    }
  }

  return (
    <div className="personal-form">
      <h2>Personal Details</h2>
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input type="text" name="fullname" value={form.fullname} onChange={handleChange} />
        {errors.fullname && <p className="error">{errors.fullname}</p>}

        <label>Email ID</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} />
        {errors.email && <p className="error">{errors.email}</p>}

        <label>Phone Number</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 10) setForm({ ...form, phone: value });
          }}
        />
        {errors.phone && <p className="error">{errors.phone}</p>}

        <label>Gender</label>
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="">-- Select --</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && <p className="error">{errors.gender}</p>}

        <label>Date of Birth</label>
        <input type="date" name="dob" value={form.dob} onChange={handleChange} />
        {errors.dob && <p className="error">{errors.dob}</p>}

        <h3>Address</h3>

        <label>Street</label>
        <input type="text" name="street" value={form.street} onChange={handleChange} />

        <label>City</label>
        <input type="text" name="city" value={form.city} onChange={handleChange} />
        {errors.city && <p className="error">{errors.city}</p>}

        <label>State</label>
        <select name="state" value={form.state} onChange={handleChange}>
          <option value="">-- Select State --</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.state && <p className="error">{errors.state}</p>}

        <label>Country</label>
        <select name="country" value={form.country} onChange={handleChange}>
          <option value="">-- Select Country --</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.country && <p className="error">{errors.country}</p>}

        <label>Pincode</label>
        <input type="text" name="pincode" value={form.pincode} onChange={handleChange} />
        {errors.pincode && <p className="error">{errors.pincode}</p>}

        <button type="submit" className="submit-btn">Save</button>
      </form>
    </div>
  );
}