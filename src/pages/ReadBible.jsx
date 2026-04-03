import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, ArrowUp, ChevronDown } from 'lucide-react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ChapterViewer from '../components/ChapterViewer';
import { getBooks, getChapter, getChaptersCount, getVersesListByMood } from '../services/api';

const ReadBible = ({ language, userId, bookmarks, likes, setBookmarks, setLikes }) => {
    const { bookId: urlBookId, chapter: urlChapter } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const highlightedVerse = parseInt(searchParams.get('verse')) || null;
    
    const [currentBookIdx, setCurrentBookIdx] = useState(null);
    const [currentChapter, setCurrentChapter] = useState(null);
    const [bookId, setBookId] = useState(null);
    const [chaptersCount, setChaptersCount] = useState(0);
    
    const [chapterData, setChapterData] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [fontStyle, setFontStyle] = useState(
        () => localStorage.getItem('bible_font') || 'serif'
    );
    const [selectedMood, setSelectedMood] = useState('all');

    const handleFontChange = (font) => {
        setFontStyle(font);
        localStorage.setItem('bible_font', font);
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const data = await getBooks();
                setBooks(data);
            } catch (err) {
                console.error('Error fetching books:', err);
            }
        };
        fetchBooks();
    }, []);

    useEffect(() => {
        if (books.length > 0) {
            let activeBook;
            if (urlBookId) {
                activeBook = books.find(b => b.abbrev.toLowerCase() === urlBookId.toLowerCase());
            }
            
            if (activeBook) {
                setCurrentBookIdx(activeBook.index);
                setBookId(activeBook.abbrev);
                setCurrentChapter(urlChapter ? parseInt(urlChapter) : 1);
            } else if (!urlBookId) {
                setCurrentBookIdx(0);
                setBookId('gn');
                setCurrentChapter(1);
                navigate('/read/gn/1', { replace: true });
            }
        }
    }, [urlBookId, urlChapter, books, navigate]);

    useEffect(() => {
        if (selectedMood === 'all') {
            if (currentBookIdx !== null && currentChapter !== null) {
                fetchChapter(currentBookIdx, currentChapter);
                fetchChaptersCount(currentBookIdx);
            }
        } else {
            fetchMoodVerses(selectedMood);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBookIdx, currentChapter, language, selectedMood]);

    const fetchMoodVerses = async (mood) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getVersesListByMood(mood, language);
            setChapterData(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching mood verses:', err);
            setError('Failed to load verses for this mood.');
            setLoading(false);
        }
    };

    const fetchChapter = async (bookIdx, chapter) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getChapter(bookIdx, chapter, language);
            setChapterData(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching chapter:', err);
            setError('Failed to load chapter content.');
            setLoading(false);
        }
    };

    const fetchChaptersCount = async (bookIdx) => {
        try {
            const data = await getChaptersCount(bookIdx);
            setChaptersCount(data.count);
        } catch (err) {
            console.error('Error fetching chapter count:', err);
        }
    };

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 500);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleBookChange = (e) => {
        const newBookIdx = parseInt(e.target.value);
        const book = books.find(b => b.index === newBookIdx);
        if (book) {
            setSelectedMood('all');
            navigate(`/read/${book.abbrev.toLowerCase()}/1`);
        }
    };

    const handleChapterChange = (e) => {
        const newChapter = parseInt(e.target.value);
        setSelectedMood('all');
        navigate(`/read/${bookId}/${newChapter}`);
    };

    const handleMoodChange = (e) => {
        setSelectedMood(e.target.value);
    };

    const nextChapter = async () => {
        if (currentChapter < chaptersCount) {
            navigate(`/read/${bookId}/${currentChapter + 1}`);
        } else if (currentBookIdx < 65) {
            const nextBook = books.find(b => b.index === currentBookIdx + 1);
            if (nextBook) {
                navigate(`/read/${nextBook.abbrev.toLowerCase()}/1`);
            }
        }
    };

    const prevChapter = () => {
        if (currentChapter > 1) {
            navigate(`/read/${bookId}/${currentChapter - 1}`);
        } else if (currentBookIdx > 0) {
            const prevBook = books.find(b => b.index === currentBookIdx - 1);
            if (prevBook) {
                navigate(`/read/${prevBook.abbrev.toLowerCase()}/1`);
            }
        }
    };


    return (
        <div className="reader-page">
            <div className="reader-bg-orb reader-bg-orb-1"></div>
            <div className="reader-bg-orb reader-bg-orb-2"></div>

            <div className="reader-container">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="reader-nav-card"
                >
                    <div className="reader-nav-header">
                        <div className="reader-nav-title-row">
                            <div className="reader-nav-icon-wrap">
                                <BookOpen size={20} />
                            </div>
                            <h2 className="reader-nav-title">Scripture Navigator</h2>
                            <Sparkles size={16} className="reader-sparkle" />

                            {/* Font picker */}
                            <div className="font-picker" role="group" aria-label="Font style">
                                {[
                                    { id: 'serif', label: 'Serif' },
                                    { id: 'sans',  label: 'Sans'  },
                                    { id: 'mono',  label: 'Mono'  },
                                ].map(({ id, label }) => (
                                    <button
                                        key={id}
                                        onClick={() => handleFontChange(id)}
                                        className={`font-pill ${fontStyle === id ? 'font-pill--active' : ''}`}
                                        title={`Switch to ${label} font`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {currentBookIdx === null ? (
                        <div className="reader-selector-loading">
                            <div className="mini-spinner"></div>
                            <span>Loading navigator...</span>
                        </div>
                    ) : (
                        <div className="reader-selectors">
                            <div className="reader-select-group">
                                <label className="reader-select-label">Book</label>
                                <div className="reader-select-wrap">
                                    <select
                                        value={currentBookIdx}
                                        onChange={handleBookChange}
                                        className="reader-select"
                                    >
                                        {books.map(book => (
                                            <option key={book.index} value={book.index}>
                                                {book.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="reader-select-icon" />
                                </div>
                            </div>

                            <div className="reader-select-group reader-select-group--sm">
                                <label className="reader-select-label">Chapter</label>
                                <div className="reader-select-wrap">
                                    <select
                                        value={currentChapter || 1}
                                        onChange={handleChapterChange}
                                        className="reader-select"
                                    >
                                        {Array.from({ length: chaptersCount }, (_, i) => i + 1).map(ch => (
                                            <option key={ch} value={ch}>{ch}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="reader-select-icon" />
                                </div>
                            </div>

                            <div className="reader-select-group">
                                <label className="reader-select-label">Mood Filter</label>
                                <div className="reader-select-wrap">
                                    <select
                                        value={selectedMood}
                                        onChange={handleMoodChange}
                                        className="reader-select"
                                    >
                                        <option value="all">None (Show Chapter)</option>
                                        <option value="happy">Happy</option>
                                        <option value="sad">Sad</option>
                                        <option value="peace">Peace</option>
                                        <option value="anxiety">Anxiety</option>
                                        <option value="fear">Fear</option>
                                        <option value="hope">Hope</option>
                                        <option value="gratitude">Gratitude</option>
                                        <option value="loneliness">Loneliness</option>
                                        <option value="strength">Strength</option>
                                        <option value="faith">Faith</option>
                                        <option value="healing">Healing</option>
                                    </select>
                                    <ChevronDown size={18} className="reader-select-icon" />
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="reader-loading"
                        >
                            <div className="reader-spinner-wrap">
                                <div className="reader-spinner reader-spinner-1"></div>
                                <div className="reader-spinner reader-spinner-2"></div>
                            </div>
                            <p className="reader-loading-text">Preparing the scriptures...</p>
                            <p className="reader-loading-sub">Loading chapter content</p>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="reader-error"
                        >
                            <div className="reader-error-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="reader-error-text">{error}</p>
                            <p className="reader-error-sub">Please check your connection and try again</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`${currentBookIdx}-${currentChapter}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <div className="chapter-viewer-card">
                                <ChapterViewer
                                    chapterData={chapterData}
                                    onUpdate={() => setUpdateTrigger(prev => prev + 1)}
                                    highlightedVerse={highlightedVerse}
                                    bookId={bookId}
                                    fontStyle={fontStyle}
                                    userId={userId}
                                    bookmarks={bookmarks}
                                    setBookmarks={setBookmarks}
                                    likes={likes}
                                    setLikes={setLikes}
                                />
                            </div>

                            <div className="reader-nav-buttons">
                                <button
                                    onClick={prevChapter}
                                    disabled={currentBookIdx === 0 && currentChapter === 1}
                                    className="reader-btn reader-btn--prev"
                                >
                                    <ChevronLeft size={20} />
                                    <span>Previous Chapter</span>
                                </button>

                                <div className="reader-nav-divider"></div>

                                <button
                                    onClick={nextChapter}
                                    disabled={currentBookIdx === 65 && currentChapter === 22}
                                    className="reader-btn reader-btn--next"
                                >
                                    <span>Next Chapter</span>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToTop}
                        className="scroll-top-btn"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp size={24} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReadBible;