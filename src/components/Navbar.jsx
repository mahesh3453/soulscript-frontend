import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon, BookOpen, Heart, Bookmark, Home as HomeIcon, User as UserIcon, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ darkMode, toggleDarkMode, language, setLanguage, userId, handleLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="logo" onClick={closeMobileMenu}>
          <BookOpen size={22} className="logo-icon" />
          <span className="logo-text">SoulScript</span>
        </NavLink>

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            <HomeIcon size={18} className="nav-icon" />
            <span className="nav-label">Moods</span>
          </NavLink>
          <NavLink to="/read" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            <BookOpen size={18} className="nav-icon" />
            <span className="nav-label">Read</span>
          </NavLink>
          <NavLink to="/bookmarks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            <Bookmark size={18} className="nav-icon" />
            <span className="nav-label">Bookmarks</span>
          </NavLink>
          <NavLink to="/favorites" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            <Heart size={18} className="nav-icon" />
            <span className="nav-label">Favorites</span>
          </NavLink>
        </div>

        <div className="nav-controls">
          <div className="lang-toggle-container">
            <button 
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <span className="lang-divider">|</span>
            <button 
              className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
              onClick={() => setLanguage('hi')}
            >
              HI
            </button>
          </div>

          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {userId ? (
            <button className="auth-nav-btn logout" onClick={() => { handleLogout(); closeMobileMenu(); }} title="Logout">
              <LogOut size={16} /> <span className="auth-nav-text">Logout</span>
            </button>
          ) : (
            <NavLink to="/login" className="auth-nav-btn login" title="Login" onClick={closeMobileMenu}>
              <UserIcon size={16} /> <span className="auth-nav-text">Login</span>
            </NavLink>
          )}

          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
