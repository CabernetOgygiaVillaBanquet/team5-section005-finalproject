import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Route, Routes, Navigate } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import Callback from './components/Callback';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await axios.get('http://localhost:3001/user', { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.log('Not logged in');
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await axios.get('http://localhost:3001/logout', { withCredentials: true });
    setUser(null);
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1>Machine Documentation</h1>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <a href="http://localhost:3001/auth/github">Login with GitHub</a>} />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          <Route path="/dashboard" element={
            user ? (
              <>
                <button onClick={handleLogout}>Logout</button>
                <UserDashboard user={user} />
              </>
            ) : (
              <Navigate to="/login" />
            )
          } />
          <Route path="/auth/github/callback" element={<Callback />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;