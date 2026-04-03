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

    const getMoodColor = (mood) => {
        const colors = {
            happy: 'rgba(255, 182, 193, 0.2)',
            sad: 'rgba(173, 216, 230, 0.2)',
            peace: 'rgba(144, 238, 144, 0.2)',
            anxious: 'rgba(255, 200, 150, 0.2)',
            anxiety: 'rgba(255, 200, 150, 0.2)', // Map anxiety to anxious color
            angry: 'rgba(255, 99, 71, 0.2)',
            none: 'transparent'
        };
        return colors[mood?.toLowerCase()] || 'transparent';
    };

    return (
        <div className="chapter-viewer">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="chapter-title"
            >
                {chapterData.book} <span className="chapter-title-num">Chapter {chapterData.chapter}</span>
            </motion.h2>

            <motion.div
                className={`verse-list font-${fontStyle}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {chapterData.verses.map((v) => {
                    const vObj = { book: chapterData.book, chapter: chapterData.chapter, verse: v.verse };
                    const bookmarked = isBookmarked(vObj);
                    const favorited = isFavorite(vObj);
                    const isHighlighted = activeHighlight === v.verse;
                    const moodColor = getMoodColor(v.mood);

                    return (
                        <div
                            key={v.verse}
                            id={`verse-${v.verse}`}
                            className={`verse-row ${isHighlighted ? 'verse-row--highlighted' : ''}`}
                            style={{ backgroundColor: moodColor }}
                        >
                            <div className="verse-num">{v.verse}</div>
                            <div className="verse-content">
                                <p className="verse-body">
                                    {v.text}
                                    {v.mood && v.mood !== 'none' && (
                                        <span className="mood-badge" title={`Mood: ${v.mood}`}>
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
