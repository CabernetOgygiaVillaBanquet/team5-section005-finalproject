import React, { useState } from 'react';
import './Menu.css';

const Menu = ({ onLogout }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`menu-wrapper ${open ? 'open' : ''}`}>
      <div className="menu-button" onClick={() => setOpen(!open)}>
        <div className="bar top"></div>
        <div className="bar middle"></div>
        <div className="bar bottom"></div>
      </div>

      {open && (
        <nav className="menu-content">
          <a href="/dashboard">Dashboard</a>
          <button className="logout-link" onClick={onLogout}>Logout</button>
        </nav>
      )}
    </div>
  );
};

export default Menu;
