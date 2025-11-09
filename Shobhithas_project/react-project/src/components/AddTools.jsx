import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddTools.css";

export default function AddTools({ lenderId }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [rentFee, setRentFee] = useState("");
  const [depositFee, setDepositFee] = useState("");
  const [availability, setAvailability] = useState("available"); // Corrected to lowercase 'available'
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([]);
  const [toast, setToast] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!lenderId) {
        alert("Authentication error: Cannot determine the lender ID. Please log in again.");
        return;
    }

    if (!name || !description || !guidelines || !rentFee || !depositFee) {
      alert("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("guidelines", guidelines);
    formData.append("rent_fee", rentFee);
    formData.append("deposit_fee", depositFee);
    formData.append("availability", availability);
    formData.append("location", location);
    
    // ⭐ CRITICAL FIX: Pass the lenderId prop directly
    formData.append("lender_id", lenderId); 

    // limit to max 3 images
    images.slice(0, 3).forEach((img) => formData.append("images", img));

    try {
      const res = await fetch("http://localhost:5000/add-tool", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setToast(true);
        setTimeout(() => {
          setToast(false);
          // Navigate back to the Lend Dashboard and pass the new tool data
          navigate("/lend", { state: { newTool: data } });
        }, 1000);
      } else {
        alert(data.error || "Failed to add tool");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  return (
    <div className="addtools-container">
      <h2>Add a New Tool (Lender ID: {lenderId || "Missing"})</h2> 
      
      <form className="addtools-form" onSubmit={handleSubmit}>
        {/* ... (rest of your form inputs are unchanged) ... */}
        <input
          type="text"
          placeholder="Tool Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Tool Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <textarea
          placeholder="User Guidelines"
          value={guidelines}
          onChange={(e) => setGuidelines(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Rental Fee"
          value={rentFee}
          onChange={(e) => setRentFee(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Deposit Fee"
          value={depositFee}
          onChange={(e) => setDepositFee(e.target.value)}
          required
        />
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          required
        >
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <input
          type="text"
          placeholder="Enter Address / Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files))}
        />
        <button type="submit">Submit</button>
      </form>

      {/* Preview Images */}
      {images.length > 0 && (
        <div className="preview">
          <h4>Preview (max 3 images):</h4>
          {images.slice(0, 3).map((img, index) => {
            const objectUrl = URL.createObjectURL(img);
            return (
              <img
                key={index}
                src={objectUrl}
                alt={`Tool Preview ${index + 1}`}
                style={{ width: "100px", margin: "5px" }}
                onLoad={() => URL.revokeObjectURL(objectUrl)}
              />
            );
          })}
        </div>
      )}

      {toast && <div className="toast">Tool "{name}" added successfully!</div>}
    </div>
  );
}