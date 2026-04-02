import React, { useState, useEffect } from 'react';
import MoodSelector from '../components/MoodSelector';
import VerseCard from '../components/VerseCard';
import api from '../services/api';
import { motion } from 'framer-motion';

// Shared font key with the Read Bible page
const FONT_KEY = 'bible_font';

const FONT_OPTIONS = [
    { id: 'serif', label: 'Serif' },
    { id: 'sans',  label: 'Sans'  },
    { id: 'mono',  label: 'Mono'  },
];

const Home = ({ language }) => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [verse, setVerse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fontStyle, setFontStyle] = useState(
        () => localStorage.getItem(FONT_KEY) || 'serif'
    );

    useEffect(() => {
        fetchRandomVerse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-fetch current state when language changes
    useEffect(() => {
        // Skip initial load duplicates
        if (!verse) return;
        
        if (selectedMood) {
            fetchVerseByMood(selectedMood, true); // true to avoid resetting 'selectedMood' if needed, but not strictly required
        } else {
            fetchRandomVerse();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    const handleFontChange = (font) => {
        setFontStyle(font);
        localStorage.setItem(FONT_KEY, font);
    };

    const fetchRandomVerse = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getRandomVerse(language);
            setVerse(data);
            setSelectedMood(null);
        } catch (err) {
            setError('Failing to connect to the Divine (Server Error)');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVerseByMood = async (mood, isLangChange = false) => {
        setLoading(true);
        setError(null);
        if (!isLangChange) setSelectedMood(mood);
        try {
            const data = await api.getVerseByMood(mood, language);
            setVerse(data);
        } catch (err) {
            setError('Heavenly connection lost (Server Error)');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hero-section"
            >
                <h1 className="main-title">SoulScript</h1>
                <p className="subtitle">Let the Word speak to your heart.</p>

                {/* Font picker — compact, top-right aligned */}
                <div className="home-font-picker" role="group" aria-label="Font style">
                    {FONT_OPTIONS.map(({ id, label }) => (
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
            </motion.div>

            <MoodSelector
                selectedMood={selectedMood}
                onMoodSelect={fetchVerseByMood}
            />

            {error && <p className="error-message">{error}</p>}

            <div className="verse-display-area">
                <VerseCard
                    verse={verse}
                    loading={loading}
                    onRefresh={selectedMood ? () => fetchVerseByMood(selectedMood) : fetchRandomVerse}
                    fontStyle={fontStyle}
                />
            </div>
        </div>
    );
};

export default Home;
