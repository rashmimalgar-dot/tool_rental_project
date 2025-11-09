import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./ToolDescription.css";
import { requestTool } from './notificationService.jsx'; // Corrected path to local service file

// Placeholder function to get the current user ID for checking borrower status
const getUserIdFromAuth = () => {
    // IMPORTANT: Ensure this reflects your actual auth solution
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return user.user_id || null; 
};

export default function ToolDescription() {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    // Use useParams() to safely get ID from URL if state is missing
    const { itemId } = useParams(); 
    
    const borrowerId = getUserIdFromAuth();
    
    // State variables
    const [tool, setTool] = useState(state?.tool);
    const [lender, setLender] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [requestStatus, setRequestStatus] = useState('idle'); // idle, loading, success, error
    const [currentImage, setCurrentImage] = useState(0); 

    // Fetch the latest tool + lender info from backend
    useEffect(() => {
        // Use the ID from state first, then from URL params as fallback
        const idToFetch = tool?.id || itemId;
        if (!idToFetch) {
            setError("No tool ID provided.");
            setLoading(false);
            return;
        }

        const fetchTool = async () => {
            try {
                // ⭐ CRITICAL FIX: Ensure the API URL includes the full base URL
                const res = await fetch(`http://localhost:5000/get-tool/${idToFetch}`);
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Server responded with an error.");
                }
                const data = await res.json();

                // Clean up and standardize data fields
                setTool({
                    ...data,
                    id: data.item_id, // Ensure we use item_id as the primary ID
                    item_id: data.item_id,
                    lender_id: data.lender_id,
                    description: data.description || "No description provided",
                    guidelines: data.tool_details || "No guidelines available", // Mapping tool_details to guidelines
                    rent_fee: data.rent_fee ?? null,
                    deposit_fee: data.deposit_fee ?? null,
                    availability: data.availability ?? "Unavailable",
                    location: data.location ?? "N/A",
                    images: data.images || [],
                });

                // ⭐ Defensive Check: Ensure data.lender exists before setting state
                if (data.lender) setLender(data.lender);
                
                setCurrentImage(0); 
            } catch (err) {
                console.error("Tool Fetch Error:", err);
                // Propagate the specific server message if possible
                setError(err.message || "Failed to load tool details from the server.");
            } finally {
                setLoading(false);
            }
        };

        fetchTool();
    }, [itemId]); // Dependency changed to only itemId, as tool?.id is derived state

    // =========================================================
    // 1. HANDLE REQUEST LOGIC
    // =========================================================
    const handleRequestTool = async () => {
        if (requestStatus === 'loading' || requestStatus === 'success') return;

        const currentToolId = tool?.item_id;
        const currentLenderId = tool?.lender_id;
        
        // ⭐ EDITED: Provide clearer alert messages based on missing data
        if (!borrowerId) {
            alert("Error: You must be logged in to request a tool.");
            return;
        }

        if (!currentToolId || !currentLenderId) {
            alert("Error: Missing tool data. Please try navigating to this page again.");
            return;
        }

        if (currentLenderId === borrowerId) {
            alert("You cannot request your own tool.");
            return;
        }
        
        const requestMessage = "I would like to borrow your tool for my project."; 

        setRequestStatus('loading');

        try {
            await requestTool(
                currentToolId, 
                currentLenderId, 
                requestMessage
            );
            
            setRequestStatus('success');
            
        } catch (error) {
            setRequestStatus('error');
            console.error("Tool Request Failed:", error);
            alert(`Request Failed: ${error.message}. Check the console and Flask terminal.`);
        }
    };
    // =========================================================
    
    // Carousel handlers (simplified)
    const prevImage = () => {
      setCurrentImage((prev) =>
        prev - 1 < 0 ? tool.images.length - 1 : prev - 1
      );
    };
    const nextImage = () => {
      setCurrentImage((prev) =>
        prev + 1 >= tool.images.length ? 0 : prev + 1
      );
    };


    if (loading) return <p className="tool-page">Loading tool details...</p>;
    if (error) return <p className="tool-page">Error: {error}</p>;
    // ⭐ Defensive Check: If tool object is somehow null after loading, display error
    if (!tool) return <p className="tool-page">Tool details not found.</p>; 

    // Lender info safe fallback
    const lenderName = lender?.name ?? "N/A";
    const lenderContact = lender?.contact ?? "N/A";
    const lenderAddress = lender?.address ?? "N/A";
    const isAvailable = tool.availability.toLowerCase() === "available";
    const isOwner = tool.lender_id === borrowerId;
    const isRequested = requestStatus === 'success';

    let buttonContent;
    if (isOwner) {
        buttonContent = 'Manage Tool (Yours)';
    } else if (isRequested) {
        buttonContent = '✅ Request Sent!';
    } else if (requestStatus === 'loading') {
        buttonContent = 'Sending...';
    } else if (isAvailable) {
        buttonContent = 'Request Tool';
    } else {
        buttonContent = 'Unavailable';
    }
    
    // ⭐ EDITED: Disable button if not logged in (borrowerId is null)
    const isButtonDisabled = requestStatus === 'loading' || isRequested || !isAvailable || isOwner || !borrowerId;


    return (
        <div className="tool-page">
            <div className="tool-container">
                <button onClick={() => navigate(-1)} className="back-btn">← Back</button>

                {/* Tool Info */}
                <div className="tool-header">
                    <div className="tool-image-container" style={{ position: "relative", width: "100%", textAlign: "center" }}>
                        {tool.images && tool.images.length > 0 ? (
                            <>
                                <img
                                    src={`http://localhost:5000/uploads/${tool.images[currentImage]}`}
                                    alt={tool.name}
                                    style={{
                                        maxWidth: "100%", 
                                        height: "auto", 
                                        maxHeight: "500px", 
                                        objectFit: "contain" 
                                    }}
                                />
                                {tool.images.length > 1 && (
                                    <>
                                        <button onClick={prevImage} className="carousel-btn left">‹</button>
                                        <button onClick={nextImage} className="carousel-btn right">›</button>
                                    </>
                                )}
                            </>
                        ) : (
                            <img
                                src="https://via.placeholder.com/500?text=No+Image"
                                alt={tool.name}
                                style={{ maxWidth: "100%", height: "auto" }}
                            />
                        )}
                        <h2 className="tool-name">{tool.name}</h2>
                    </div>
                </div>

                {/* Tool Details */}
                <div className="rental-box">
                    <h3>Tool Details</h3>
                    <p><strong>Description:</strong> {tool.description}</p>
                    <p><strong>Guidelines:</strong> {tool.guidelines}</p>
                    <p><strong>Location:</strong> {tool.location}</p>
                    <p><strong>Status:</strong> {isAvailable ? "Available" : "Not Available"}</p>
                    <p><strong>Deposit Fee:</strong> {tool.deposit_fee != null ? `₹${tool.deposit_fee}` : "N/A"}</p>
                    <p><strong>Rent Fee:</strong> {tool.rent_fee != null ? `₹${tool.rent_fee}` : "N/A"}</p>
                </div>

                {/* Lender Info */}
                <div className="owner-box">
                    <img src="https://via.placeholder.com/65/d8cfc8/4b3621?text=U" alt="Lender Profile" />
                    <div>
                        <h3>{lenderName}</h3>
                        <p>Contact: {lenderContact}</p>
                        <p>Address: {lenderAddress}</p>
                    </div>
                </div>

                {/* Request Button */}
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button
                        className={`request-btn ${isRequested ? 'requested' : ''}`}
                        onClick={handleRequestTool}
                        disabled={isButtonDisabled}
                        style={{
                            cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                            opacity: isButtonDisabled ? 0.7 : 1,
                        }}
                    >
                        {buttonContent}
                    </button>
                    {requestStatus === 'error' && (
                        <p style={{ color: 'red', marginTop: '10px' }}>Request failed. Check console.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
