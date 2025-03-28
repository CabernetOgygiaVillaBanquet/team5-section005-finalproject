import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import './Admin.css';

const Register = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const SECRET = 'labcyber2025';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill all fields');
    if (password !== confirm) return setError('Passwords do not match');

    const encryptedPassword = CryptoJS.AES.encrypt(password, SECRET).toString();
    localStorage.setItem(`labcyber_user_${email}`, encryptedPassword);
    onRegisterSuccess(email);
  };

  return (
    <div className="admin-login">
      <div className="admin-login-box">
        <h2>Create Account</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <input type="email" className="admin-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" className="admin-input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <input type="password" className="admin-input" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          <button className="admin-submit" type="submit">Register</button>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;
