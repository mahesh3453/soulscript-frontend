import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import InstallPrompt from './components/InstallPrompt';
import { ChapterSkeleton } from './components/SkeletonVerse';
import { getBookmarks, getLikes } from './services/api';
import './index.css';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const ReadBible = lazy(() => import('./pages/ReadBible'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const Chat = lazy(() => import('./pages/Chat'));

const ErrorFallback = ({ error }) => (
  <div className="error-fallback">
    <h2>Something went wrong</h2>
    <p>{error.message}</p>
    <button onClick={() => window.location.reload()}>Reload App</button>
  </div>
);

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('soul-script-theme');
    return saved ? saved === 'dark' : true;
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('soulscript_userId') || null;
  });
  
  const [bookmarks, setBookmarks] = useState([]);
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    if (userId) {
      getBookmarks(userId).then(data => setBookmarks(data)).catch(console.error);
      getLikes(userId).then(data => setLikes(data)).catch(console.error);
    } else {
      setBookmarks([]);
      setLikes([]);
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('soulscript_userId');
    localStorage.removeItem('soulscript_token');
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
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
          <Navbar 
            darkMode={darkMode} toggleDarkMode={toggleDarkMode} 
            language={language} setLanguage={setLanguage} 
            userId={userId} handleLogout={handleLogout}
          />
          
          <main className="main-content">
            <Suspense fallback={<ChapterSkeleton />}>
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
                <Route path="/profile" element={<Profile userId={userId} handleLogout={handleLogout} />} />
                <Route path="/chat" element={<Chat userId={userId} />} />
              </Routes>
            </Suspense>
          </main>

          <BottomNavbar userId={userId} />
          <InstallPrompt />

          <footer className="footer">
            <p>&copy; {new Date().getFullYear()} SoulScript Bible Reader. Built with love and faith.</p>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
