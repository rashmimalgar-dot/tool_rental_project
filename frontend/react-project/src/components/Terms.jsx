import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TermsPage() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleAccept = () => {
    if (agreed) {
      alert("Thank you for accepting the Terms & Conditions!");
      navigate("/login");
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        padding: "20px",
        background: "#f5f2ef", // light brownish background
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#4b2e1f" }}>
        Terms and Conditions
      </h2>

      {/* Scrollable Terms */}
      <div
        style={{
          maxHeight: "300px",
          overflowY: "scroll",
          padding: "15px",
          border: "1px solid #d2b48c", // tan border
          background: "#fffaf5", // soft off-white brown
          marginBottom: "15px",
          color: "#3e2c23", // readable brown
        }}
      >
        <h3>1. Acceptance of Terms</h3>
        <p>
          By registering on our platform and using our services, you agree to comply with these Terms and Conditions.
        </p>

        <h3>2. Eligibility</h3>
        <p>Users must be at least 18 years old and provide accurate details during registration.</p>

        <h3>3. User Responsibilities</h3>
        <ul>
          <li>Borrowers must return tools on time in the same condition.</li>
          <li>Lenders must ensure tools are safe and usable.</li>
          <li>Users are responsible for any damage, misuse, or loss.</li>
        </ul>

        <h3>4. Liability</h3>
        <p>The platform is not responsible for damages, disputes, or accidents caused during tool use.</p>

        <h3>5. Privacy</h3>
        <p>User data will be used only for community lending and will not be shared without consent.</p>

        <h3>6. Account Suspension</h3>
        <p>The platform may suspend accounts that violate these terms.</p>

        <h3>7. Governing Law</h3>
        <p>These Terms are governed by the laws of India.</p>
      </div>

      {/* Checkbox */}
      <div style={{ marginBottom: "15px", color: "#3e2c23" }}>
        <input
          type="checkbox"
          id="agree"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <label htmlFor="agree" style={{ marginLeft: "8px" }}>
          I have read and agree to the Terms and Conditions
        </label>
      </div>

      {/* Accept Button */}
      <button
        onClick={handleAccept}
        disabled={!agreed}
        style={{
          width: "100%",
          padding: "12px",
          background: agreed ? "#8b5e3c" : "#d2b48c", // brown and light tan
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: agreed ? "pointer" : "not-allowed",
          fontSize: "16px",
        }}
      >
        Accept & Continue
      </button>
    </div>
  );
}