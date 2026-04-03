import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Heart, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { addBookmark, removeBookmark, addLike, removeLike } from '../services/api';

const ChapterViewer = ({ chapterData, onUpdate, highlightedVerse, bookId, fontStyle = 'serif', userId, bookmarks, setBookmarks, likes, setLikes }) => {
    const [copiedVerse, setCopiedVerse] = useState(null);
    const [localUpdate, setLocalUpdate] = useState(0);
    // Track which verse is actively glowing so we can fade it out after 3s
    const [activeHighlight, setActiveHighlight] = useState(null);
    const highlightTimerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!highlightedVerse || !chapterData) return;

        // Clear any previous timer
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);

        // Activate the glow immediately
        setActiveHighlight(highlightedVerse);

        // Scroll after a short delay to ensure the DOM is painted
        const scrollTimer = setTimeout(() => {
            const element = document.getElementById(`verse-${highlightedVerse}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        // Fade out the highlight after 3 seconds
        highlightTimerRef.current = setTimeout(() => {
            setActiveHighlight(null);
        }, 3200);

        return () => {
            clearTimeout(scrollTimer);
            clearTimeout(highlightTimerRef.current);
        };
    }, [highlightedVerse, chapterData]);

    if (!chapterData) return (
        <div className="chapter-placeholder">Loading chapter content...</div>
    );

    const handleCopy = (verseText, verseNum) => {
        const fullText = `${chapterData.book} ${chapterData.chapter}:${verseNum} - ${verseText}`;
        navigator.clipboard.writeText(fullText);
        setCopiedVerse(verseNum);
        setTimeout(() => setCopiedVerse(null), 2000);
    };

    const isBookmarked = (verseObj) => {
        return bookmarks?.some(b => b.book === verseObj.book && b.chapter === verseObj.chapter && b.verse === verseObj.verse);
    };

    const isFavorite = (verseObj) => {
        return likes?.some(l => l.book === verseObj.book && l.chapter === verseObj.chapter && l.verse === verseObj.verse);
    };

    const toggleBookmark = async (verse) => {
        if (!userId) return navigate('/login');
        const payload = { userId, bookId, book: chapterData.book, chapter: chapterData.chapter, verse: verse.verse, text: verse.text };
        try {
            const existing = bookmarks?.find(b => b.book === payload.book && b.chapter === payload.chapter && b.verse === payload.verse);
            if (existing) {
                await removeBookmark(existing._id);
                setBookmarks(bookmarks.filter(b => b._id !== existing._id));
            } else {
                const added = await addBookmark(payload);
                setBookmarks([...(bookmarks || []), added]);
            }
            // Trigger local update manually if needed by parent
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleFavorite = async (verse) => {
        if (!userId) return navigate('/login');
        const payload = { userId, bookId, book: chapterData.book, chapter: chapterData.chapter, verse: verse.verse };
        try {
            const existing = likes?.find(l => l.book === payload.book && l.chapter === payload.chapter && l.verse === payload.verse);
            if (existing) {
                await removeLike(existing._id);
                setLikes(likes.filter(l => l._id !== existing._id));
            } else {
                const added = await addLike(payload);
                setLikes([...(likes || []), added]);
            }
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    const getMoodStyle = (mood) => {
        const styles = {
            happy:      { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', rowBg: 'rgba(251,191,36,0.05)' },
            sad:        { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', rowBg: 'rgba(96,165,250,0.05)' },
            anxiety:    { color: '#fb923c', bg: 'rgba(251,146,60,0.12)', rowBg: 'rgba(251,146,60,0.05)' },
            peace:      { color: '#34d399', bg: 'rgba(52,211,153,0.12)', rowBg: 'rgba(52,211,153,0.05)' },
            motivation: { color: '#c084fc', bg: 'rgba(192,132,252,0.12)', rowBg: 'rgba(192,132,252,0.05)' },
            fear:       { color: '#818cf8', bg: 'rgba(129,140,248,0.12)', rowBg: 'rgba(129,140,248,0.05)' },
            hope:       { color: '#f472b6', bg: 'rgba(244,114,182,0.12)', rowBg: 'rgba(244,114,182,0.05)' },
            gratitude:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', rowBg: 'rgba(167,139,250,0.05)' },
            loneliness: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', rowBg: 'rgba(56,189,248,0.05)' },
            strength:   { color: '#facc15', bg: 'rgba(250,204,21,0.12)', rowBg: 'rgba(250,204,21,0.05)' },
            faith:      { color: '#e2b96e', bg: 'rgba(226,185,110,0.12)', rowBg: 'rgba(226,185,110,0.05)' },
            healing:    { color: '#f87171', bg: 'rgba(248,113,113,0.12)', rowBg: 'rgba(248,113,113,0.05)' },
            none:       { color: 'transparent', bg: 'transparent', rowBg: 'transparent' }
        };
        return styles[mood?.toLowerCase()] || styles.none;
    };

    return (
        <div className="chapter-viewer">
            {chapterData.book === "Verses for Mood" ? (
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="chapter-title"
                >
                    Mood: <span className="chapter-title-num">{chapterData.chapter}</span>
                </motion.h2>
            ) : (
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="chapter-title"
                >
                    {chapterData.book} <span className="chapter-title-num">Chapter {chapterData.chapter}</span>
                </motion.h2>
            )}

            <motion.div
                className={`verse-list font-${fontStyle}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {chapterData.verses.map((v, i) => {
                    const isMoodFilter = chapterData.book === "Verses for Mood";
                    const vObj = { 
                        book: v.book || chapterData.book, 
                        chapter: v.chapter || chapterData.chapter, 
                        verse: v.verse 
                    };
                    const bookmarked = isBookmarked(vObj);
                    const favorited = isFavorite(vObj);
                    const isHighlighted = activeHighlight === v.verse;
                    const moodStyle = getMoodStyle(v.mood);

                    return (
                        <div
                            key={`${vObj.book}-${vObj.chapter}-${vObj.verse}-${i}`}
                            id={`verse-${v.verse}`}
                            className={`verse-row ${isHighlighted ? 'verse-row--highlighted' : ''}`}
                            style={{ backgroundColor: moodStyle.rowBg }}
                        >
                            <div className="verse-num">
                                {isMoodFilter ? (
                                    <div className="verse-ref-small">
                                        {v.book.substring(0, 3)} {v.chapter}:{v.verse}
                                    </div>
                                ) : (
                                    v.verse
                                )}
                            </div>
                            <div className="verse-content">
                                <p className="verse-body">
                                    {v.text}
                                    {v.mood && v.mood !== 'none' && (
                                        <span 
                                            className="mood-badge" 
                                            title={`Mood: ${v.mood}`}
                                            style={{ 
                                                color: moodStyle.color, 
                                                backgroundColor: moodStyle.bg,
                                                borderColor: moodStyle.color,
                                                border: "1px solid"
                                            }}
                                        >
                                            {v.mood}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="verse-actions">
                                <button
                                    onClick={() => toggleBookmark(v)}
                                    className={`verse-action-btn ${bookmarked ? 'verse-action-btn--bookmarked' : ''}`}
                                    title={bookmarked ? "Remove Bookmark" : "Add Bookmark"}
                                >
                                    <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={() => toggleFavorite(v)}
                                    className={`verse-action-btn ${favorited ? 'verse-action-btn--favorited' : ''}`}
                                    title={favorited ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                    <Heart size={15} fill={favorited ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={() => handleCopy(v.text, v.verse)}
                                    className="verse-action-btn"
                                    title="Copy Verse"
                                >
                                    {copiedVerse === v.verse
                                        ? <CheckCircle size={15} className="verse-action-btn--copied" />
                                        : <Copy size={15} />
                                    }
                                </button>
                            </div>
                        </div>
                    );
                })}
                {chapterData.verses.length === 0 && (
                    <div className="no-verses-found">No verses found for this mood</div>
                )}
            </motion.div>
        </div>
    );
};

export default ChapterViewer;
