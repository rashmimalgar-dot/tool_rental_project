import React, { useState, useEffect } from 'react';
// ⭐ NEW: Import the useNotifications hook to access global state
import { useNotifications } from './NotificationContext';
import { fetchNotifications, markNotificationsAsRead } from './notificationService.jsx'; 
// NOTE: Assuming your styles are kept in the component or a separate CSS file.


const NotificationsPage = () => {
    // 1. ⭐ USE GLOBAL STATE INSTEAD OF LOCAL STATE AND useEffect
    const { notifications: realTimeNotifications } = useNotifications();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [historicalNotifications, setHistoricalNotifications] = useState([]);

    // Combine historical data (fetched once) and real-time data (pushed via socket)
    // NOTE: In a real app, the context would handle the initial fetch, but for safety, 
    // we'll fetch once and combine it with the real-time stream.
    const allNotifications = [...historicalNotifications, ...realTimeNotifications]
        // Filter out duplicates (if necessary, relies on unique IDs)
        .filter((v, i, a) => a.findIndex(t => (t.notification_id === v.notification_id)) === i)
        // Sort by timestamp (newest first)
        .sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp));


    // 2. Fetch historical data on mount and mark all as read
    useEffect(() => {
        const loadNotificationsAndMarkRead = async () => {
            try {
                // Fetch ALL notifications for the borrower
                const data = await fetchNotifications();
                setHistoricalNotifications(data);

                // Mark all notifications as read immediately after fetching/viewing
                await markNotificationsAsRead();
                
            } catch (err) {
                // The error check in your original code expects data.notifications 
                // but fetchNotifications already returns the array or [] on error.
                setError(err.message || "Failed to load notifications.");
            } finally {
                setLoading(false);
            }
        };

        loadNotificationsAndMarkRead();
    }, []); 
    // The dependency array is empty because we want the real-time context 
    // to handle subsequent updates, not re-fetch.


    // --- Your original style functions (for consistency) ---
    const styles = {
        // ... (Keep all your inline styles here) ...
        container: {
            maxWidth: '800px',
            margin: '40px auto',
            padding: '20px',
            backgroundColor: '#f4f7f9',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        header: {
            textAlign: 'center',
            color: '#333',
            marginBottom: '30px',
            borderBottom: '2px solid #ddd',
            paddingBottom: '10px',
        },
        list: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
        },
        item: {
            padding: '15px',
            borderRadius: '6px',
            borderLeft: '5px solid',
            transition: 'transform 0.2s, box-shadow 0.2s',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
        unread: {
            backgroundColor: '#eaf3ff', 
            fontWeight: 500,
        },
        read: {
            opacity: 0.8,
            color: '#555',
            backgroundColor: '#fff',
        },
        headerDetails: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '5px',
        },
        timestamp: {
            fontSize: '0.8em',
            color: '#888',
        },
        emptyState: {
            textAlign: 'center',
            padding: '50px',
            color: '#6c757d',
            fontStyle: 'italic',
            background: '#e9ecef',
            borderRadius: '6px',
        }
    };
    
    // Function to get dynamic style properties based on type
    const getDynamicStyles = (notif) => {
        let borderLeftColor;
        // Use notif.type for success/error/warning
        const type = notif.type ? notif.type.toLowerCase() : 'info'; 
        
        switch (type) {
            case 'success': borderLeftColor = '#28a745'; break;
            case 'request_accepted': borderLeftColor = '#28a745'; break; // ⭐ Highlight the acceptance notification
            case 'warning': borderLeftColor = '#ffc107'; break;
            case 'error': borderLeftColor = '#dc3545'; break;
            case 'info':
            default: borderLeftColor = '#007bff'; break;
        }
        
        // Use a property that indicates if it's read. Assuming 'is_read' is from backend.
        const isRead = notif.is_read || notif.status === 'read'; 

        return {
            ...styles.item,
            borderLeftColor: borderLeftColor,
            ...(isRead ? styles.read : styles.unread)
        };
    };
    // --- End Inline Styles ---


    if (loading) {
        return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading Notifications...</div>;
    }

    if (error) {
        return <div style={{textAlign: 'center', color: 'red', marginTop: '50px'}}>Error: {error}</div>;
    }
    
    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Your Notifications</h2>
            {allNotifications.length === 0 ? (
                <p style={styles.emptyState}>You're all caught up! No notifications.</p>
            ) : (
                <div style={styles.list}>
                    {allNotifications.map((notif) => (
                        <div 
                            // Use notification_id or generate one for real-time messages
                            key={notif.notification_id || notif.id} 
                            style={getDynamicStyles(notif)}
                        >
                            <div style={styles.headerDetails}>
                                <strong>{notif.title || 'New Notification'}</strong>
                                <span style={styles.timestamp}>
                                    {new Date(notif.created_at || notif.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <p style={{margin: 0}}>
                                {/* Message can come from the DB (message) or the Socket (message) */}
                                {notif.message}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;