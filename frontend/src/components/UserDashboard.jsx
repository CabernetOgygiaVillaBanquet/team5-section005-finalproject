import React from 'react';
import UploadForm from './UploadFrom';
import './UserDashboard.css';  // Add a CSS file for styling

function UserDashboard({ user }) {
  return (
    <div className="user-dashboard">
      <h2>Welcome, {user.displayName || user.username}</h2>
      <img src={user.photos[0].value} alt="User Avatar" className="user-avatar" />
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Profile:</strong> <a href={user.profileUrl} target="_blank" rel="noopener noreferrer">{user.profileUrl}</a></p>
      <UploadForm token={user.token} />
    </div>
  );
}

export default UserDashboard;