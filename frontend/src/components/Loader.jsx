import React from 'react';
import './Loader.css';

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="hatom-loader" role="alert" aria-live="assertive">
      <div className="loader-container">
        <div className="ring"></div>
        <div className="center-dot"></div>
        {message && <p className="loading-text">{message}</p>}
      </div>
    </div>
  );
};

export default Loader;