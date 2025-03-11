import React from 'react';
import ReactDOM from 'react-dom/client'; // Update import statement
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root')); // Update rendering method

root.render(
  <Router>
    <App />
  </Router>
);