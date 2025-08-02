// src/components/Header.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <NavLink to="/" className="header-logo-group">
          <img 
            src="/assets/logo.svg" 
            alt="RDL Techworks Logo" 
            className="header-logo-img" 
            width="40"
            height="40"
          />
          <span className="header-brand-name">mosaïque</span>
        </NavLink>
        
        <nav className="header-nav">
          <NavLink to="/product">Product</NavLink>
          <NavLink to="/downloads">Downloads</NavLink>
          <a href="https://github.com/semantic/mosaique" target="_blank" rel="noopener noreferrer" className="github-header-icon">
            <FaGithub size={28} />
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
