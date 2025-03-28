import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import './Admin.css';

const ResetPassword = ({ onReset }) => {
  const [email, setEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const SECRET = 'labcyber2025';

  const handleSubmit = (e) => {
    e.preventDefault();
    const userKey = `labcyber_user_${email}`;
    if (!localStorage.getItem(userKey)) {
      return setMessage('❌ Email not found.');
    }
    if (newPass !== confirm) {
      return setMessage('❌ Passwords do not match.');
    }

    const encrypted = CryptoJS.AES.encrypt(newPass, SECRET).toString();
    localStorage.setItem(userKey, encrypted);
    setMessage('✅ Password reset successful!');
    if (onReset) onReset(email);
  };

  return (
    <div className="admin-login">
      <div className="admin-login-box">
        <h2>Reset Password</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <input className="admin-input" type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="admin-input" type="password" placeholder="New Password" value={newPass} onChange={e => setNewPass(e.target.value)} />
          <input className="admin-input" type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          <button className="admin-submit" type="submit">Reset</button>
          {message && <p className="error-msg">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
