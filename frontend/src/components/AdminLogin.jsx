import React, { useState } from 'react';
import './Admin.css';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'labcyber2025') {
      onLogin();
    } else {
      setError('❌ Incorrect password. Please try again.');
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-box">
        <h2>🔐 Admin Access</h2>
        <p className="admin-desc">Only authorized personnel may access the admin dashboard.</p>
        <form onSubmit={handleSubmit} className="admin-form">
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
          />
          <button type="submit" className="admin-submit">Login</button>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
