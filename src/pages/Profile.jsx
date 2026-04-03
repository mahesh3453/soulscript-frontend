import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ userId, handleLogout }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('soulscript_name') || 'Faithful Reader';
  const userEmail = localStorage.getItem('soulscript_email') || 'soul.reader@scripture.com';

  const onLogout = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="profile-page"
    >
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2>Account Settings</h2>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-box">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <h3>{userName}</h3>
          <p>{userEmail}</p>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <Shield size={20} />
            <span>Standard Member</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      
      <div className="app-info-card">
        <p>SoulScript v1.2.0 (Mobile Optimized)</p>
        <p className="pwa-tag">Running as Web Application</p>
      </div>
    </motion.div>
  );
};

export default Profile;
