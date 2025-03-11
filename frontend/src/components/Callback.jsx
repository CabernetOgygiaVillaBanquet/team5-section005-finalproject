import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await axios.get('http://localhost:3001/user', { withCredentials: true });
        if (response.data) {
          navigate('/dashboard'); // Navigate to the dashboard
        } else {
          navigate('/login'); // Navigate to login if user data is not found
        }
      } catch (error) {
        console.error('Error fetching user data', error);
        navigate('/login'); // Navigate to login on error
      }
    }
    fetchUser();
  }, [navigate]);

  return <p>Loading...</p>;
}

export default Callback;