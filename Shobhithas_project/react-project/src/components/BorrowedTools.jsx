import React, { useEffect, useState } from "react";

export default function BorrowedTools({ borrowerId }) {
  const [borrowedTools, setBorrowedTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // ✅ Fetch Borrowed Tools
  const fetchBorrowedTools = async () => {
    try {
      const res = await fetch(`http://localhost:5000/borrowed-tools/${borrowerId}`);
      const data = await res.json();
      setBorrowedTools(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load borrowed tools");
    }
  };

  useEffect(() => {
    if (borrowerId) fetchBorrowedTools();
  }, [borrowerId]);

  // ✅ Submit Review
  const handleSubmitReview = async () => {
    if (!rating || !review.trim()) {
      showToast("Please provide both rating and review");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/submit-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedTool.lender_id,   // lender receiving feedback
          from_user_id: borrowerId,          // borrower giving feedback
          item_id: selectedTool.item_id,
          borrow_id: selectedTool.request_id, // corresponds to tool_requests.request_id
          rating,
          comments: review,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("✅ Review submitted successfully!");
        setSelectedTool(null);
        setRating(0);
        setReview("");
        fetchBorrowedTools(); // refresh list
      } else {
        console.error("❌ Feedback Error:", data);
        showToast(data.error || "Failed to submit review");
      }
    } catch (err) {
      console.error("❌ Server error:", err);
      showToast("Server error while submitting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="borrowed-tools-page" style={{ padding: "30px" }}>
      <h2>📦 Your Borrowed Tools</h2>

      {toast && <div className="toast">{toast}</div>}

      {borrowedTools.length === 0 ? (
        <p>No borrowed tools yet.</p>
      ) : (
        <div className="borrowed-tools-list">
          {borrowedTools.map((t) => (
            <div
              key={t.request_id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                margin: "10px 0",
                borderRadius: "8px",
              }}
            >
              <h3>{t.name}</h3>
              <p>Status: {t.return_status}</p>

              {/* ✅ Show Review Status or Button */}
              {t.return_status === "returned" && (
                <>
                  {!t.has_review ? (
                    <button
                      onClick={() => setSelectedTool(t)}
                      style={{
                        background: "#C9A66B",
                        color: "white",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ✍️ Write Review
                    </button>
                  ) : (
                    <div
                      style={{
                        background: "#f8f8f8",
                        padding: "10px",
                        borderRadius: "8px",
                        marginTop: "8px",
                      }}
                    >
                      <strong>⭐ You’ve already reviewed this tool.</strong>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- Review Modal --- */}
      {selectedTool && (
        <div
          className="review-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="review-modal-content"
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              width: "400px",
            }}
          >
            <h3>Review for {selectedTool.name}</h3>

            <label>⭐ Rating:</label>
            <div>
              {[1, 2, 3, 4, 5].map((r) => (
                <span
                  key={r}
                  style={{
                    fontSize: "24px",
                    cursor: "pointer",
                    color: r <= rating ? "#FFD700" : "#ccc",
                  }}
                  onClick={() => setRating(r)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder="Write your review..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              style={{
                width: "100%",
                height: "80px",
                marginTop: "10px",
                padding: "8px",
              }}
            />

            <div style={{ marginTop: "10px", textAlign: "right" }}>
              <button
                onClick={handleSubmitReview}
                disabled={loading}
                style={{
                  background: loading ? "#999" : "#8B3E2F",
                  color: "white",
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginRight: "10px",
                }}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
              <button
                onClick={() => setSelectedTool(null)}
                style={{
                  background: "#ccc",
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
