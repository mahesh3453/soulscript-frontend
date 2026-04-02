import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';

const Bookmarks = ({ language, userId, bookmarks, setBookmarks }) => {
    const [books, setBooks] = useState([]);
    const [displayMarks, setDisplayMarks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        
        axios.get('http://localhost:5000/api/books')
            .then(res => setBooks(res.data))
            .catch(err => console.error('Failed to load books:', err));
            
        translateBookmarks(bookmarks);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, bookmarks, userId, navigate]);

    const translateBookmarks = async (marks) => {
        if (!marks || marks.length === 0) return;
        try {
            const updated = await Promise.all(
                marks.map(async (v) => {
                    const id = v.bookId || v.bookName || v.book;
                    try {
                        const data = await api.getSpecificVerse(id, v.chapter, v.verse, language);
                        return { ...v, text: data.text, bookName: data.book };
                    } catch (e) {
                        return v;
                    }
                })
            );
            setDisplayMarks(updated);
        } catch (error) {
            console.error('Translation error:', error);
        }
    };

    const handleDelete = async (verse) => {
        try {
            await api.removeBookmark(verse._id);
            setBookmarks(bookmarks.filter(b => b._id !== verse._id));
        } catch(error) {
            console.error(error);
        }
    };

    const goToVerse = (v) => {
        // Use stored bookId, or fall back to looking up abbrev by bookName
        let id = v.bookId;
        const bName = v.bookName || v.book;
        if (!id && bName && books.length > 0) {
            const match = books.find(
                b => b.name.toLowerCase() === bName.toLowerCase()
            );
            if (match) id = match.abbrev;
        }
        if (!id) id = bName; // Ultimate fallback
        if (!id) return;
        if (!id) return; // still nothing we can do
        navigate(`/read/${id.toLowerCase()}/${v.chapter}?verse=${v.verse}`);
    };

    return (
        <div className="collection-page">
            <div className="collection-container">
                <header className="collection-header">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="collection-header-icon collection-header-icon--bookmark"
                    >
                        <Bookmark size={40} fill="currentColor" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="collection-title"
                    >
                        Saved Passages
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="collection-subtitle"
                    >
                        Your collection of bookmarked scriptures
                    </motion.p>
                </header>

                {displayMarks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="collection-empty"
                    >
                        <Bookmark size={56} className="collection-empty-icon" />
                        <p className="collection-empty-text">No bookmarks saved yet.</p>
                        <p className="collection-empty-sub">Open a Bible chapter and bookmark verses to see them here.</p>
                        <Link to="/read" className="collection-empty-btn">
                            Explore the Bible <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="collection-grid">
                        <AnimatePresence>
                            {displayMarks.map((v, index) => (
                                <motion.div
                                    key={v._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="collection-card"
                                >
                                    <div className="collection-card-top">
                                        <div className="collection-card-ref">
                                            <div className="collection-card-icon collection-card-icon--bookmark">
                                                <BookOpen size={14} />
                                            </div>
                                            <h3 className="collection-card-title">
                                                {v.bookName} {v.chapter}:{v.verse}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(v)}
                                            className="collection-card-delete"
                                            title="Remove"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                    <p className="collection-card-text">"{v.text}"</p>
                                    <button
                                        onClick={() => goToVerse(v)}
                                        className="collection-card-goto"
                                    >
                                        Go to Chapter
                                        <ArrowRight size={15} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookmarks;
