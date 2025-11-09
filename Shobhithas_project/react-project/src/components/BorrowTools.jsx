import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ToolsPage() {
  const navigate = useNavigate();

  const tools = [
    { id: 1, name: "Ladder (10 ft)", location: "Vijayanagar, Mysuru", image: "/vite.svg" },
    { id: 2, name: "Electric Drill", location: "Ashokapuram, Mysuru", image: "/vite.svg" },
    { id: 3, name: "Hammer", location: "Chamundi Hill, Mysuru", image: "/vite.svg" },
    { id: 4, name: "Painting Brush Set", location: "Gokulam, Mysuru", image: "/vite.svg" },
    { id: 5, name: "Tool Kit (24 pcs)", location: "Raja Rajeshwari Nagar, Mysuru", image: "/vite.svg" },
    { id: 6, name: "Electric Screwdriver", location: "Saraswathipuram, Mysuru", image: "/vite.svg" },
    { id: 7, naame: "Paint Roller", location: "Jayalakshmipuram, Mysuru", image: "/vite.svg" },
    { id: 8, name: "Drill Bits Set", location: "Yadavagiri, Mysuru", image: "/vite.svg" },
    { id: 9, name: "Measuring Tape", location: "Krishna Raja Puram, Mysuru", image: "/vite.svg" },
    { id: 10, name: "Chainsaw", location: "Vidyaranyapuram, Mysuru", image: "/vite.svg" },
    { id: 11, name: "Step Ladder", location: "Hebbal, Mysuru", image: "/vite.svg" },
    { id: 12, name: "Electric Sander", location: "Mysore Palace Road, Mysuru", image: "/vite.svg" },
    { id: 13, name: "Shovel", location: "Hinkal, Mysuru", image: "/vite.svg" },
    { id: 14, name: "Wheelbarrow", location: "R.S. Naidu Nagar, Mysuru", image: "/vite.svg" },
    { id: 15, name: "Paint Sprayer", location: "V.V. Mohalla, Mysuru", image: "/vite.svg" },
  ];

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || tool.location.includes(filter);
    return matchesSearch && matchesFilter;
  });

  // Redirect to Tool Description
  const handleViewTool = (tool) => {
    navigate(`/tools/${tool.id}`, { state: { tool } });
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
        <h1
          style={{
            textAlign: "center",
            color: "#2563eb",
            marginBottom: "30px",
          }}
        >
          🛠 Available Tools
        </h1>

        {/* Search + Filter */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "30px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "12px",
              width: "240px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              color: "#111",
              background: "#fff",
            }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              color: "#111",
              background: "#fff",
            }}
          >
            <option value="All">All Locations</option>
            <option value="Vijayanagar">Vijayanagar</option>
            <option value="Ashokapuram">Ashokapuram</option>
            <option value="Chamundi Hill">Chamundi Hill</option>
            <option value="Gokulam">Gokulam</option>
            <option value="Raja Rajeshwari Nagar">Raja Rajeshwari Nagar</option>
            <option value="Saraswathipuram">Saraswathipuram</option>
            <option value="Jayalakshmipuram">Jayalakshmipuram</option>
            <option value="Yadavagiri">Yadavagiri</option>
            <option value="Krishna Raja Puram">Krishna Raja Puram</option>
            <option value="Vidyaranyapuram">Vidyaranyapuram</option>
            <option value="Hebbal">Hebbal</option>
            <option value="Mysore Palace Road">Mysore Palace Road</option>
            <option value="Hinkal">Hinkal</option>
            <option value="R.S. Naidu Nagar">R.S. Naidu Nagar</option>
            <option value="V.V. Mohalla">V.V. Mohalla</option>
          </select>
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
              <div
                style={{
                  height: "120px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <img
                  src={tool.image}
                  alt={tool.name}
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100px",
                    objectFit: "contain",
                  }}
                />
              </div>

              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "#2563eb",
                }}
              >
                {tool.name}
              </h2>
              <p style={{ fontSize: "14px", marginBottom: "12px", color: "#111" }}>
                {tool.location}
              </p>

              <button
                onClick={() => handleViewTool(tool)}
                style={{
                  padding: "10px 16px",
                  background: "#10b981",
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
