import React from 'react';
import { Link } from 'react-router-dom';
import './UserDashboard.css';
import { useNotifications } from './NotificationContext'; 

export default function UserDashboard({ user }) {
  const { unreadCount } = useNotifications(); 
  const isBadgeVisible = unreadCount > 0;

  return (
    <div>
      <nav className="top-panel">
        <div className="left-buttons">
          <Link to="/lend">
            <button className="nav-button">Lend</button>
          </Link>
          <Link to="/borrow">
            <button className="nav-button">Borrow</button>
          </Link>
          <Link to="/borrowed-tools">
            <button className="nav-button borrowed-tools">📋 Borrowed Tools</button>
          </Link>
        </div>

        <div className="right-buttons">
          {/* Notifications */}
          <Link 
            to="/notifications" 
            className="nav-link-with-badge"
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <button className="nav-button">
              Notifications
              {isBadgeVisible && (
                <span className="notification-badge">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </Link>

          <Link to="/settings">
            <button className="nav-button">Settings</button>
          </Link>
          <Link to="/profile">
            <button className="nav-button">Profile</button>
          </Link>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Welcome, {user?.full_name || 'User'}!</h1> 
        <p>Select an action from the top panel.</p>
      </div>
    </div>
  );
}
