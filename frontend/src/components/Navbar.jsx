import React, { useState } from 'react';
import LoginModal from './LoginModal';

const Navbar = ({ onLoginClick, onLogout }) => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <nav className="navbar">
        <h2 className="logo">
          <span>no</span>broker
        </h2>

        <div className="nav-actions">
          <button className="login-btn" onClick={() => setShowLogin(true)}>
            Login
          </button>
          {onLogout && (
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      {showLogin && (
        <LoginModal
          mode="login"
          setMode={() => {}}
          close={() => setShowLogin(false)}
          onAuthenticated={user => {
            if (onLoginClick) {
              onLoginClick(user);
            }
            setShowLogin(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;
