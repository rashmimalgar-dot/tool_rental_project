import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function BorrowPage() {
  const navigate = useNavigate();
  const [tools, setTools] = useState([]);
  const [userAddress, setUserAddress] = useState("");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef();

  // Fetch tools from backend
  const fetchTools = async () => {
    try {
      const res = await fetch(`http://localhost:5000/get-tools`);
      const data = await res.json();

      const mappedTools = data.map((t) => ({
        id: t.item_id,
        name: t.name,
        location: t.location || "Unknown",
        description: t.description,
        UserGuidelines: t.tool_details || "No guidelines provided",
        rentFee: t.rent_fee,
        availability: t.availability,
        images: t.images || [],
        currentImage: 0, // track current image for carousel
      }));

      setTools(mappedTools);
    } catch (err) {
      console.error("Error fetching tools:", err);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);


  
  // Unique locations for dropdown
  const locations = Array.from(new Set(tools.map((tool) => tool.location)));

  // Filter tools based on search and userAddress
  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase());
    const matchesAddress =
      userAddress === "" || tool.location.toLowerCase().includes(userAddress.toLowerCase());
    return matchesSearch && matchesAddress;
  });

  const handleViewTool = (tool) => {
    navigate("/tooldescription", { state: { tool } });
  };

  const handleSelectLocation = (loc) => {
    setUserAddress(loc);
    setDropdownOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => setDropdownOpen(false), 150);
  };

  // Handle carousel navigation
  const prevImage = (toolId) => {
    setTools((prevTools) =>
      prevTools.map((t) =>
        t.id === toolId
          ? {
              ...t,
              currentImage:
                t.currentImage - 1 < 0 ? t.images.length - 1 : t.currentImage - 1,
            }
          : t
      )
    );
  };

  const nextImage = (toolId) => {
    setTools((prevTools) =>
      prevTools.map((t) =>
        t.id === toolId
          ? {
              ...t,
              currentImage:
                t.currentImage + 1 >= t.images.length ? 0 : t.currentImage + 1,
            }
          : t
      )
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "880px" }}>
        {/* Back Button */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "8px 12px",
              background: "#C9A66B",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ← Back
          </button>
        </div>

        <h1 style={{ textAlign: "center", color: "#8B3E2F", marginBottom: "30px" }}>
          🛠 Borrow Tools
        </h1>

        {/* Address input with dropdown */}
        <div
          style={{
            position: "relative",
            marginBottom: "30px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter your address or select location..."
            value={userAddress}
            onChange={(e) => {
              setUserAddress(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setDropdownOpen(false);
                e.preventDefault();
              }
            }}
            style={{
              padding: "12px",
              width: "300px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              color: "#111",
              background: "#fff",
            }}
          />
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "48px",
                width: "300px",
                maxHeight: "150px",
                overflowY: "auto",
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "8px",
                zIndex: 10,
              }}
            >
              {locations
                .filter((loc) => loc.toLowerCase().includes(userAddress.toLowerCase()))
                .map((loc, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => handleSelectLocation(loc)}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {loc}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "12px",
              width: "300px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              color: "#111",
              background: "#fff",
            }}
          />
        </div>

        {/* Tools Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              style={{
                background: "#fff",
                color: "#111",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "center",
                boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
              }}
            >
              {/* Image Carousel */}
              <div
                style={{
                  height: "120px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "12px",
                  position: "relative",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {tool.images.length > 0 ? (
                  <>
                    <img
                      src={`http://localhost:5000/uploads/${tool.images[tool.currentImage]}`}
                      alt={tool.name}
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                        transition: "transform 0.3s",
                      }}
                    />
                    {tool.images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(tool.id)}
                          style={{
                            position: "absolute",
                            left: "5px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.3)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            cursor: "pointer",
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => nextImage(tool.id)}
                          style={{
                            position: "absolute",
                            right: "5px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.3)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            cursor: "pointer",
                          }}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <span>No images</span>
                )}
              </div>

              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "#8B3E2F",
                }}
              >
                {tool.name}
              </h2>

              <p style={{ fontSize: "14px", marginBottom: "12px", color: "#111" }}>
                <strong>Rent Fee:</strong> ₹{tool.rentFee}
              </p>

              <button
                onClick={() => handleViewTool(tool)}
                style={{
                  padding: "10px 16px",
                  background: "#C9A66B",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
