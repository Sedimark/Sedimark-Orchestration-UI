import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; // Make sure this path is correct

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <p className="notfound-message">Page Not Found</p>
      <p className="notfound-description">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="notfound-home-button">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
