import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ReadBible from './pages/ReadBible';
import Bookmarks from './pages/Bookmarks';
import Favorites from './pages/Favorites';
import Auth from './pages/Auth';
import api from './services/api';
import './index.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('soul-script-theme');
    return saved ? saved === 'dark' : true;
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Auth & Storage Global States
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('soulscript_userId') || null;
  });
  
  const [bookmarks, setBookmarks] = useState([]);
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    if (userId) {
      api.getBookmarks(userId).then(data => setBookmarks(data)).catch(console.error);
      api.getLikes(userId).then(data => setLikes(data)).catch(console.error);
    } else {
      setBookmarks([]);
      setLikes([]);
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('soulscript_userId');
    setUserId(null);
  };

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
    localStorage.setItem('soul-script-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
        <Navbar 
          darkMode={darkMode} toggleDarkMode={toggleDarkMode} 
          language={language} setLanguage={setLanguage} 
          userId={userId} handleLogout={handleLogout}
        />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home language={language} />} />
            <Route path="/login" element={<Auth setUserId={setUserId} />} />
            <Route path="/read/:bookId?/:chapter?" element={
              <ReadBible 
                language={language} 
                userId={userId} 
                bookmarks={bookmarks} 
                setBookmarks={setBookmarks}
                likes={likes}
                setLikes={setLikes}
              />
            } />
            <Route path="/bookmarks" element={<Bookmarks language={language} userId={userId} bookmarks={bookmarks} setBookmarks={setBookmarks} />} />
            <Route path="/favorites" element={<Favorites language={language} userId={userId} likes={likes} setLikes={setLikes} />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} SoulScript Bible Reader. Built with love and faith.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
