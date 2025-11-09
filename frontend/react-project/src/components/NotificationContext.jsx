// src/components/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// 1. Create the Context
const NotificationContext = createContext();

// Custom hook for easier consumption
export const useNotifications = () => useContext(NotificationContext);

// Function to safely get the user ID (same logic as in ToolDescription)
const getUserIdFromAuth = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return user.user_id || null; 
};

// 2. Create the Provider Component
export function NotificationProvider({ children, user }) {
    const [socket, setSocket] = useState(null);
    // This state will hold all notifications for the logged-in user
    const [notifications, setNotifications] = useState([]); 

    const userId = user?.user_id || getUserIdFromAuth();
    
    // =========================================================
    // SOCKET.IO CONNECTION & REAL-TIME LISTENER
    // =========================================================
    useEffect(() => {
        if (!userId) {
            // Do not connect if no user is logged in
            if (socket) socket.disconnect();
            return;
        }

        // Connect to the Socket.io server (e.g., your Flask backend)
        const newSocket = io('http://localhost:5000'); 
        setSocket(newSocket);

        // 1. ON CONNECT: Tell the server who we are to join the correct room
        newSocket.on('connect', () => {
            console.log('Socket Connected. Joining room:', `user_${userId}`);
            newSocket.emit('join', { user_id: userId });
        });

        // 2. LISTENER: Receive a real-time notification from the lender's action
        newSocket.on('new_notification', (data) => {
            console.log('Real-time Notification Received:', data);
            
            // Add the new notification to the state immediately
            setNotifications(prev => [
                {
                    id: Date.now(), // Generate a unique ID if the backend doesn't provide one
                    type: data.type, // e.g., 'request_accepted'
                    message: data.message,
                    timestamp: new Date().toISOString(),
                    // Include any other relevant data (e.g., toolName)
                    toolName: data.tool_name, 
                    status: 'unread'
                },
                ...prev // Newest notifications first
            ]);
        });

        // 3. CLEANUP: Disconnect socket when component unmounts or user changes
        return () => {
            newSocket.off('connect');
            newSocket.off('new_notification');
            newSocket.disconnect();
        };

    }, [userId]); // Reconnect when the user changes or logs in/out

    // =========================================================
    // NOTIFICATION MANAGEMENT FUNCTIONS
    // =========================================================

    // Function to fetch historical notifications from the database
    const fetchHistoricalNotifications = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:5000/get-notifications/${userId}`);
            const data = await res.json();
            
            // Assuming the backend returns the data in the format needed for state
            setNotifications(data);
        } catch (err) {
            console.error("Failed to fetch historical notifications:", err);
        }
    };
    
    // You'll need an effect to fetch historical data once on load
    useEffect(() => {
        fetchHistoricalNotifications();
    }, [userId]);


    // Context value to be shared
    const contextValue = {
        notifications,
        fetchHistoricalNotifications, // Optional: for refresh button on the page
        // add more actions like markAsRead if needed later
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
}