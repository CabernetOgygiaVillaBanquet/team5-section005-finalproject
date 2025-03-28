import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import './Admin.css';

const SECRET = 'labcyber2025';

const LocalLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    const stored = localStorage.getItem(`labcyber_user_${email}`);
    if (!stored) return setError('User not found.');

    try {
      const decrypted = CryptoJS.AES.decrypt(stored, SECRET).toString(CryptoJS.enc.Utf8);
      if (decrypted !== password) return setError('Incorrect password.');

      const userData = { name: email.split('@')[0], email };
      if (remember) {
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(userData), SECRET).toString();
        localStorage.setItem('labcyber_local_user', encrypted);
      }

      onLogin(userData);
    } catch (err) {
      setError('Login failed.');
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-box">
        <h2>Email Login</h2>
        <form onSubmit={handleLogin} className="admin-form">
          <input
            className="admin-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="admin-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <label htmlFor="remember" style={{ fontSize: '0.9rem', color: '#ccc' }}>Remember Me</label>
          </div>
          <button type="submit" className="admin-submit">Login</button>
          {error && <p className="error-msg">{error}</p>}
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#ccc' }}>
          <a href="/register" style={{ color: '#c1ff12' }}>Create an account</a> ·
          <a href="/reset" style={{ color: '#c1ff12', marginLeft: '8px' }}>Forgot password?</a>
        </p>
      </div>
    </div>
  );
};

export default LocalLogin;
