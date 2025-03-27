import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Loader from './components/Loader';
import Menu from './components/Menu';
import Callback from './components/Callback';
import UserDashboard from './components/UserDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get('http://localhost:3001/user', { withCredentials: true });
        setUser(res.data);
        setShowWelcome(true);
      } catch (err) {
        console.log('Not logged in');
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await axios.get('http://localhost:3001/logout', { withCredentials: true });
    setUser(null);
    setAdmin(false);
    setShowWelcome(false);
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
                  <p className="login-info">🔒 Please login with your GitHub account to access the LabCyber dashboard.</p>
                  <a className="hatom-button" href="http://localhost:3001/auth/github">
                    Login with GitHub
                  </a>
                </div>
              )
            }
          />

          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                <UserDashboard user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
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
