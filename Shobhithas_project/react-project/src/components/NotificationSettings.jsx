// src/components/NotificationSettings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiBellOff } from "react-icons/fi";
// Import the new settings functions

// Correct import path:
import { fetchNotifications, markNotificationsAsRead } from './notificationService.jsx'; 

// ... rest of the component code

// --- Utility function placeholder (from service file) ---
const getUserIdFromAuth = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return user.user_id || 1; // Defaulting to 1 for testing
};
// --- END Utility function placeholder ---


export default function NotificationSettings() {
    const navigate = useNavigate();
    const userId = getUserIdFromAuth();

    // Consolidated state object for settings
    const [settings, setSettings] = useState({
        email: true, 
        sms: false, 
        app: true, 
        dnd: false 
    });
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' or 'error'

    // Sample recent notifications
    const notifications = [
        { id: 1, type: "borrow", message: "Your borrowed tool is due tomorrow." },
        { id: 2, type: "system", message: "New version of the app is available." },
        { id: 3, type: "reminder", message: "Don’t forget to update your profile." },
    ];

    // =========================================================
    // 1. FETCH SETTINGS ON MOUNT
    // =========================================================
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setSaveStatus('error');
            console.error("User not logged in.");
            return;
        }

        const loadSettings = async () => {
            try {
                const initialSettings = await fetchSettings();
                setSettings({
                    email: initialSettings.email || false,
                    sms: initialSettings.sms || false,
                    app: initialSettings.app || false,
                    dnd: initialSettings.dnd || false,
                });

            } catch (error) {
                console.error("Error loading settings:", error);
                setSaveStatus('error');
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, [userId]);


    // =========================================================
    // 2. HANDLE CHANGE AND SAVE
    // =========================================================
    const handleChange = async (key) => {
        setSaveStatus(null);
        
        // Optimistic UI update: Toggle the state immediately
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings); 

        try {
            // Call the service to save the changes
            await saveSettings(newSettings);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);

        } catch (error) {
            console.error("Error saving settings:", error);
            // Revert UI on failure
            setSettings(settings); 
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };
    
    const StatusDisplay = () => {
        if (saveStatus === 'success') {
            return <p style={{ color: 'green', textAlign: 'center', fontWeight: 'bold', margin: '15px 0' }}>Settings saved successfully! ✅</p>;
        }
        if (saveStatus === 'error') {
            return <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold', margin: '15px 0' }}>Failed to save settings. ❌</p>;
        }
        return null;
    };
    
    if (loading) {
        return <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px", textAlign: "center" }}>Loading Settings...</div>;
    }


    return (
        <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
            
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    marginBottom: "20px",
                    padding: "8px 14px",
                    background: "#8B3E2F",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                }}
            >
                ← Back
            </button>

            <h1 style={{ textAlign: "center", marginBottom: "5px" }}>Notification Settings</h1>
            
            {StatusDisplay()}

            {/* Toggles */}
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
                <Toggle label="Email Notifications" state={settings.email} handleChange={() => handleChange('email')} />
                <Toggle label="SMS Notifications" state={settings.sms} handleChange={() => handleChange('sms')} />
                <Toggle label="App Notifications" state={settings.app} handleChange={() => handleChange('app')} />
                <Toggle label="Do Not Disturb" state={settings.dnd} handleChange={() => handleChange('dnd')} />
            </div>

            {/* Notification Preview */}
            <h2 style={{ marginBottom: "10px" }}>Recent Notifications</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {notifications.map(n => (
                    <li key={n.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px", background: "#f9f9f9", padding: "8px 12px", borderRadius: "6px" }}>
                        <span style={{ marginRight: "8px" }}>
                            {n.type === "system" ? <FiBellOff color="#888" /> : <FiBell color="#00bfff" />}
                        </span>
                        <span>{n.message}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Toggle component (Modified to accept a single handleChange prop)
function Toggle({ label, state, handleChange }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 15px", background: "#f0f0f0", borderRadius: "8px" }}>
            <span>{label}</span>
            <button
                onClick={handleChange}
                style={{
                    width: "50px",
                    height: "24px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    background: state ? "#00bfff" : "#ccc",
                    position: "relative",
                    transition: "0.3s"
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        top: "2px",
                        left: state ? "26px" : "2px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#fff",
                        transition: "0.3s"
                    }}
                ></span>
            </button>
        </div>
    );
}
