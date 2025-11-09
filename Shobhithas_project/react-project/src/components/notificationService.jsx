// FILE: notificationService.jsx (Ensure this is in use)

import React from 'react'; // Keep this, even if not strictly needed for this file's logic

// --- Utility function: Must be consistent across all files ---
const getBorrowerData = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return {
        borrowerId: user.user_id || null, 
        borrowerName: user.full_name || 'Anonymous', 
        borrowerPhone: user.phone || 'N/A', 
    };
};
// -----------------------------------------------------------------

/**
 * Sends a request to borrow a tool. (Used by ToolDescription.jsx)
 */
// ⭐ FIX: Added 'export'
export async function requestTool(toolId, lenderId, message) {
    const { borrowerId, borrowerName, borrowerPhone } = getBorrowerData();

    if (!borrowerId) {
        throw new Error("User not authenticated. Cannot send request.");
    }
    
    const requestPayload = {
        item_id: toolId,
        lender_id: lenderId,
        borrower_id: borrowerId, 
        borrower_name: borrowerName,
        borrower_phone: borrowerPhone,
        message: message,
    };

    try {
        const res = await fetch('http://localhost:5000/request-tool', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestPayload),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Failed to send borrow request.');
        }
        return data; 
        
    } catch (error) {
        console.error("API Error in requestTool:", error);
        throw error;
    }
}

/**
 * Fetches all notifications (historical and unread) for the current user. 
 */
// ⭐ FIX: Added 'export'
export async function fetchNotifications() {
    const userId = getBorrowerData().borrowerId;
    if (!userId) return [];
    
    try {
        const res = await fetch(`http://localhost:5000/get-notifications/${userId}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to fetch notifications.');
        }
        
        return data || []; 
    } catch (error) {
        console.error("API Error in fetchNotifications:", error);
        throw error; 
    }
}

/**
 * Sends a request to mark all unread notifications as read.
 */
// ⭐ FIX: Added 'export' - This is the function causing the direct error!
export async function markNotificationsAsRead() {
    const userId = getBorrowerData().borrowerId;
    if (!userId) return;

    try {
        const res = await fetch(`http://localhost:5000/mark-read/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
        });
        
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to mark notification as read.');
        }
        
    } catch (error) {
        console.error("API Error in markNotificationsAsRead:", error);
        throw error;
    }
}


// -----------------------------------------------------------------
// Placeholder functions for NotificationSettings.jsx 
// -----------------------------------------------------------------

// ⭐ FIX: Added 'export'
export async function fetchSettings() {
    const userId = getBorrowerData().borrowerId;
    try {
        const res = await fetch(`http://localhost:5000/settings/notifications/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch settings.");
        return data;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return { email: true, sms: false, app: true, dnd: false }; 
    }
}

// ⭐ FIX: Added 'export'
export async function saveSettings(settings) {
    const userId = getBorrowerData().borrowerId;
    try {
        const res = await fetch('http://localhost:5000/settings/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...settings, user_id: userId }),
        });
        if (!res.ok) throw new Error("Failed to save settings.");
        return true;
    } catch (error) {
        console.error("Error saving settings:", error);
        throw error;
    }
}