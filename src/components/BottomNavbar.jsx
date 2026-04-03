import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Bookmark, Heart, User } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const BottomNavbar = ({ userId }) => {
  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Haptics not available on web
    }
  };

  const navItems = [
    { to: '/', icon: <Home size={22} />, label: 'Home' },
    { to: '/read', icon: <BookOpen size={22} />, label: 'Read' },
    { to: '/bookmarks', icon: <Bookmark size={22} />, label: 'Saved' },
    { to: '/favorites', icon: <Heart size={22} />, label: 'Likes' },
    { to: userId ? '/profile' : '/login', icon: <User size={22} />, label: userId ? 'Me' : 'Login' },
  ];

  return (
    <nav className="bottom-navbar">
      <div className="bottom-navbar-inner">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={triggerHaptic}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavbar;
