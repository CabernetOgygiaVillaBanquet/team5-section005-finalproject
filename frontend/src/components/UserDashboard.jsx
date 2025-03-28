import React from 'react';
import UploadForm from './UploadFrom';
import './UserDashboard.css';

function UserDashboard({ user }) {
  const displayName =
    user.displayName || user.name || user.username || user.email || 'User';

  const avatarUrl =
    user.photos?.[0]?.value || user.avatar_url || null;

  const profileUrl =
    user.profileUrl || user.html_url || null;

  return (
    <div className="user-dashboard">
      <h2>Welcome, {displayName}</h2>

      {avatarUrl && (
        <img src={avatarUrl} alt="User Avatar" className="user-avatar" />
      )}

      {user.username && (
        <p>
          <strong>Username:</strong> {user.username}
        </p>
      )}

      {user.email && (
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      )}

      {profileUrl && (
        <p>
          <strong>Profile:</strong>{' '}
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            {profileUrl}
          </a>
        </p>
      )}

      <UploadForm token={user.token} />
    </div>
  );
}

export default UserDashboard;
