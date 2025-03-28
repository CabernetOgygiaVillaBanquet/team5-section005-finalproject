import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Loader from './components/Loader';
import Menu from './components/Menu';
import Callback from './components/Callback';
import UserDashboard from './components/UserDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import LocalLogin from './components/LocalLogin';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import CryptoJS from 'crypto-js';
import './App.css';

const SECRET_KEY = 'labcyber2025';

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeTab, setActiveTab] = useState('github');

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get('http://localhost:3001/user', { withCredentials: true });
        setUser(res.data);
        setShowWelcome(true);
      } catch (err) {
        const encrypted = localStorage.getItem('labcyber_local_user');
        if (encrypted) {
          try {
            const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);
            const localUser = JSON.parse(decrypted);
            setUser(localUser);
            setShowWelcome(true);
          } catch (e) {
            localStorage.removeItem('labcyber_local_user');
          }
        }
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await axios.get('http://localhost:3001/logout', { withCredentials: true }).catch(() => {});
    setUser(null);
    setAdmin(false);
    setShowWelcome(false);
    localStorage.removeItem('labcyber_local_user');
  };

  if (loading) return <Loader />;

  return (
    <div className="hatom-wrapper">
      <Menu onLogout={handleLogout} />
      <div className="hatom-card">
        {user && showWelcome && (
          <div className="welcome-message">
            ✅ Welcome to the <strong>LabCyber Docs Application</strong>!
          </div>
        )}

        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <div className="login-box">
                  <p className="login-info">🔒 Please login to access the LabCyber dashboard.</p>

                  <div className="login-tabs">
                    <button
                      className={activeTab === 'github' ? 'tab active' : 'tab'}
                      onClick={() => setActiveTab('github')}
                    >
                      GitHub Login
                    </button>
                    <button
                      className={activeTab === 'local' ? 'tab active' : 'tab'}
                      onClick={() => setActiveTab('local')}
                    >
                      Local Login
                    </button>
                  </div>

                  {activeTab === 'github' ? (
                    <a className="hatom-button" href="http://localhost:3001/auth/github">
                      Login with GitHub
                    </a>
                  ) : (
                    <LocalLogin
                      onLogin={(localUser) => {
                        setUser(localUser);
                        setShowWelcome(true);
                      }}
                    />
                  )}
                </div>
              )
            }
          />

          <Route path="/register" element={<Register onRegisterSuccess={() => window.location.href = '/login'} />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
          <Route
            path="/dashboard"
            element={user ? <UserDashboard user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={admin ? <AdminDashboard /> : <AdminLogin onLogin={() => setAdmin(true)} />}
          />
          <Route path="/auth/github/callback" element={<Callback />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
