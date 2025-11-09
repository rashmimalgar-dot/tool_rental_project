import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./LendDashboard.css";

export default function LendDashboard({ lenderId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const notificationsRef = useRef(null);
  const [reviews, setReviews] = useState([]);
const [selectedToolReviews, setSelectedToolReviews] = useState(null);
const [loadingReviews, setLoadingReviews] = useState(false);


  const [tools, setTools] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [editTool, setEditTool] = useState(null);

  console.log("📦 Lender ID from LendDashboard:", lenderId);

  const showToast = (message, duration = 3000) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), duration);
  };

  // --- Fetch Borrow Requests ---
  const fetchBorrowRequests = async (id) => {
    const userId = id || 1;
    try {
      const res = await fetch(`http://localhost:5000/get-borrow-requests/${userId}`);
      const data = await res.json();

      const mappedRequests = data.map((req) => ({
        id: req.request_id,
        toolId: req.item_id,
        borrowerId: req.borrower_id,
        borrower: req.borrower_name || "Unknown Borrower",
        phone: req.borrower_phone || "N/A",
        status: req.status || "pending",
        message: req.message || "",
        returnStatus: req.return_status || "not_returned",
      }));

      setNotifications(mappedRequests);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch borrow requests");
    }
  };

  // --- Fetch Tools ---
  const fetchTools = async (id) => {
    const userId = id || 1;
    try {
      const res = await fetch(`http://localhost:5000/get-tools/${userId}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Backend did not return an array for tools:", data);
        setTools([]);
        return;
      }

      const mappedTools = data.map((t) => ({
        id: t.item_id,
        name: t.name,
        description: t.description,
        UserGuidelines: t.tool_details,
        rentFee: t.rent_fee,
        depositFee: t.deposit_fee,
        availability: t.availability,
        images: t.images || [],
      }));
      setTools(mappedTools);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch tools");
      setTools([]);
    }
  };
  const fetchToolReviews = async (toolId, toolName) => {
  setLoadingReviews(true);
  try {
    const res = await fetch(`http://localhost:5000/get-feedback/${toolId}`);
    const data = await res.json();

    if (res.ok) {
      setReviews(data);
      setSelectedToolReviews({ name: toolName, id: toolId });
    } else {
      console.error("Error fetching reviews:", data);
      showToast(data.error || "Failed to fetch reviews");
    }
  } catch (err) {
    console.error("Server Error:", err);
    showToast("Server error while fetching reviews");
  } finally {
    setLoadingReviews(false);
  }
};

  // --- useEffect for initial data ---
  useEffect(() => {
    const userId = lenderId;
    console.log("📢 Lender ID in LendDashboard:", lenderId);

    if (!userId) {
      console.warn("Lender ID is missing. Cannot fetch tools.");
      return;
    }

    fetchTools(userId);
    fetchBorrowRequests(userId);

    if (location.state?.newTool) {
      showToast(`✅ Tool "${location.state.newTool.name}" added successfully!`);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [lenderId, navigate, location.pathname, location.state?.newTool]);

  // --- Handle Borrow Request Action ---
  const handleRequestAction = async (requestId, action) => {
    console.log("🧾 Action received:", action);

    if (!lenderId) {
      console.error("❌ Missing lenderId in frontend!");
      showToast("Unable to process request: lender ID not found.");
      return;
    }

    const actionType = action.toLowerCase();

    if (!["accept", "reject"].includes(actionType)) {
      console.error("❌ Invalid action type:", actionType);
      showToast("Invalid action type.");
      return;
    }

    // ✅ Ask lender for a custom message
    const customMessage = window.prompt(
      `Enter a message to send to the borrower when you ${actionType} this request:`
    );

    if (customMessage === null) {
      return; // user pressed cancel
    }

    try {
      console.log("📤 Sending payload:", {
        action: actionType,
        lender_id: lenderId,
        message: customMessage,
      });

      const res = await fetch(
        `http://localhost:5000/handle-borrow-request/${requestId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: actionType,
            lender_id: lenderId,
            message: customMessage,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        showToast(`✅ Request ${actionType}ed successfully!`);
        fetchBorrowRequests(lenderId);
      } else {
        console.error("Server Error:", data);
        showToast(data.error || `Failed to ${actionType} request.`);
      }
    } catch (err) {
      console.error("Network Error:", err);
      showToast("Error connecting to server.");
    }
  };

  // --- Handle Tool Return Confirmation ---
  const handleMarkReturned = async (requestId) => {
    if (!window.confirm("Has the borrower returned the tool?")) return;

    try {
      const res = await fetch(`http://localhost:5000/mark-returned/${requestId}`, {
        method: "PUT",
      });

      const data = await res.json();

      if (res.ok) {
        showToast("✅ Tool marked as returned!");
        fetchBorrowRequests(lenderId);
      } else {
        console.error("Server Error:", data);
        showToast(data.error || "Failed to mark as returned.");
      }
    } catch (err) {
      console.error("Network Error:", err);
      showToast("Error connecting to server.");
    }
  };

  // --- Remove Tool ---
  const handleRemoveClick = async (tool) => {
    if (!window.confirm(`Are you sure you want to delete "${tool.name}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/delete-tool/${tool.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setTools((prev) => prev.filter((t) => t.id !== tool.id));
        showToast(`Tool "${tool.name}" removed successfully`);
      } else {
        alert(data.error || "Failed to delete tool");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  // --- Edit Handlers ---
  const handleEditClick = (tool) => setEditTool({ ...tool });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTool) return;

    try {
      const formData = new FormData();
      formData.append("name", editTool.name);
      formData.append("description", editTool.description);
      formData.append("guidelines", editTool.UserGuidelines);
      formData.append("rent_fee", editTool.rentFee);
      formData.append("deposit_fee", editTool.depositFee);
      formData.append("availability", editTool.availability);

      const res = await fetch(`http://localhost:5000/update-tool/${editTool.id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setTools((prev) => prev.map((t) => (t.id === editTool.id ? editTool : t)));
        setEditTool(null);
        showToast(`Tool "${editTool.name}" updated successfully!`);
      } else {
        const data = await res.json();
        console.error("Edit Submission Error:", data.error);
        alert(data.error || "Failed to update tool.");
      }
    } catch (err) {
      console.error("Network/Server Error during Edit:", err);
      alert("Error connecting to server for update.");
    }
  };

  return (
    <div className="lend-dashboard">
      <nav className="top-panel">
        <button className="nav-button" onClick={() => navigate("/dashboard")}>
          ← Home
        </button>
        <button
          className="nav-button"
          onClick={() => {
            setShowNotifications(true);
            setTimeout(
              () => notificationsRef.current?.scrollIntoView({ behavior: "smooth" }),
              100
            );
          }}
        >
          Notifications ({notifications.filter((n) => n.status === "pending").length})
        </button>
        <Link to="/addtools">
          <button className="nav-button">+ Add Tool</button>
        </Link>
      </nav>

      {toast.show && <div className="toast">{toast.message}</div>}

      <div className="dashboard-content">
        <h2>Your Lendable Tools (Lender ID: {lenderId || "Missing"})</h2>

        {tools.length === 0 && (
          <p className="no-tools-message">
            You currently have no tools listed. Add one to get started!
          </p>
        )}
<div className="tool-list">
  {tools.map((tool) => (
    <div className="tool-card" key={tool.id}>
      {tool.images && tool.images.length > 0 && (
        <div className="tool-image">
          <img
            src={`http://localhost:5000/uploads/${tool.images[0]}`}
            alt={tool.name}
            style={{
              width: "100%",
              height: "150px",
              objectFit: "cover",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          />
        </div>
      )}

      <h3>{tool.name}</h3>
      <p><strong>Rent Fee:</strong> ₹{tool.rentFee}</p>
      <p><strong>Deposit Fee:</strong> ₹{tool.depositFee}</p>
      <p><strong>Status:</strong> {tool.availability}</p>

      <div className="button-group">
        <button className="edit-btn" onClick={() => handleEditClick(tool)}>Edit</button>
        <button className="remove-btn" onClick={() => handleRemoveClick(tool)}>Remove</button>
        <button
          className="view-reviews-btn"
          onClick={() => fetchToolReviews(tool.id, tool.name)}
        >
          ⭐ View Reviews
        </button>
      </div>
    </div>
  ))}
</div>


        {/* --- Edit Modal --- */}
        {editTool && (
          <div className="edit-modal-overlay">
            <div className="edit-modal-content">
              <h3>Edit Tool: {editTool.name}</h3>
              <form onSubmit={handleEditSubmit}>
                <input
                  type="text"
                  value={editTool.name}
                  onChange={(e) => setEditTool((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Tool Name"
                  required
                />
                <textarea
                  value={editTool.description}
                  onChange={(e) => setEditTool((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  required
                />
                <textarea
                  value={editTool.UserGuidelines}
                  onChange={(e) => setEditTool((prev) => ({ ...prev, UserGuidelines: e.target.value }))}
                  placeholder="User Guidelines"
                  required
                />
                <input
                  type="number"
                  value={editTool.rentFee}
                  onChange={(e) => setEditTool((prev) => ({ ...prev, rentFee: e.target.value }))}
                  placeholder="Rent Fee"
                  required
                />
                <input
                  type="number"
                  value={editTool.depositFee}
                  onChange={(e) => setEditTool((prev) => ({ ...prev, depositFee: e.target.value }))}
                  placeholder="Deposit Fee"
                  required
                />
                <select
                  value={editTool.availability}
                  onChange={(e) => setEditTool((prev) => ({ ...prev, availability: e.target.value }))}
                  required
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                <div className="modal-actions">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" onClick={() => setEditTool(null)} className="cancel-btn">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
{selectedToolReviews && (
  <div className="review-modal-overlay">
    <div className="review-modal-content">
      <h3>⭐ Reviews for {selectedToolReviews.name}</h3>

      {loadingReviews ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p>No reviews available yet.</p>
      ) : (
        reviews.map((r) => (
          <div
            key={r.feedback_id}
            style={{
              background: "#f8f8f8",
              padding: "10px",
              margin: "8px 0",
              borderRadius: "8px",
            }}
          >
            <p><strong>👤 {r.reviewer_name}</strong></p>
            <p>⭐ {r.rating} / 5</p>
            <p>{r.comments}</p>
            <small style={{ color: "#777" }}>
              {new Date(r.created_at).toLocaleString()}
            </small>
          </div>
        ))
      )}

      <div style={{ textAlign: "right", marginTop: "10px" }}>
        <button
          onClick={() => setSelectedToolReviews(null)}
          style={{
            background: "#8B3E2F",
            color: "white",
            padding: "8px 14px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

        {/* --- Notifications Panel --- */}
        {showNotifications && (
          <div className="notifications-panel" ref={notificationsRef}>
            <h3>Your Notifications</h3>
            {notifications.length === 0 ? (
              <p>No new requests.</p>
            ) : (
              notifications.map((n) => (
                <div className="notification-card" key={n.id}>
                  <p><strong>New Tool Request Received! ⚠️</strong></p>
                  <p>
                    {n.borrower} has requested your tool:{" "}
                    <strong>{tools.find((t) => t.id === n.toolId)?.name || "Tool"}</strong>.
                  </p>
                  {n.message && <p><em>Message:</em> "{n.message}"</p>}
                  <p className={`status-${n.status}`}>
                    Status: {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                  </p>

                  {/* Pending requests */}
                  {n.status === "pending" && (
                    <div className="notification-actions">
                      <button
                        onClick={() => handleRequestAction(n.id, "accept", n.borrowerId, n.toolId)}
                        className="accept-btn"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestAction(n.id, "reject", n.borrowerId, n.toolId)}
                        className="reject-btn"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Approved requests */}
                  {n.status === "approved" && n.returnStatus === "not_returned" && (
                    <div className="notification-actions">
                      <button
                        onClick={() => handleMarkReturned(n.id)}
                        className="mark-returned-btn"
                      >
                        ✅ Mark as Returned
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
