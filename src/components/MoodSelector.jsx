import React, { useState } from 'react';
import {
    Smile, Frown, ShieldAlert, Heart, Zap,
    CloudRain, Sunrise, HandHeart, Users, Dumbbell, Cross, Stethoscope, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const moods = [
    { id: 'happy',      label: 'Happy',      emoji: '😊', icon: <Smile size={22} />,        color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
    { id: 'sad',        label: 'Sad',         emoji: '😔', icon: <Frown size={22} />,        color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'   },
    { id: 'anxiety',    label: 'Anxiety',     emoji: '😰', icon: <ShieldAlert size={22} />,  color: '#fb923c', bg: 'rgba(251,146,60,0.12)'   },
    { id: 'peace',      label: 'Peace',       emoji: '😌', icon: <Heart size={22} />,        color: '#34d399', bg: 'rgba(52,211,153,0.12)'   },
    { id: 'motivation', label: 'Motivation',  emoji: '💪', icon: <Zap size={22} />,          color: '#c084fc', bg: 'rgba(192,132,252,0.12)'  },
    { id: 'fear',       label: 'Fear',        emoji: '😨', icon: <CloudRain size={22} />,    color: '#818cf8', bg: 'rgba(129,140,248,0.12)'  },
    { id: 'hope',       label: 'Hope',        emoji: '🙏', icon: <Sunrise size={22} />,      color: '#f472b6', bg: 'rgba(244,114,182,0.12)'  },
    { id: 'gratitude',  label: 'Gratitude',   emoji: '🙌', icon: <HandHeart size={22} />,    color: '#a78bfa', bg: 'rgba(167,139,250,0.12)'  },
    { id: 'loneliness', label: 'Loneliness',  emoji: '🥺', icon: <Users size={22} />,        color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'   },
    { id: 'strength',   label: 'Strength',    emoji: '⚡', icon: <Dumbbell size={22} />,     color: '#facc15', bg: 'rgba(250,204,21,0.12)'   },
    { id: 'faith',      label: 'Faith',       emoji: '✝️', icon: <Cross size={22} />,        color: '#e2b96e', bg: 'rgba(226,185,110,0.12)'  },
    { id: 'healing',    label: 'Healing',     emoji: '❤️', icon: <Stethoscope size={22} />,  color: '#f87171', bg: 'rgba(248,113,113,0.12)'  },
];

const MoodSelector = ({ selectedMood, onMoodSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const activeMoodData = moods.find(m => m.id === selectedMood);

    const handleSelect = (id) => {
        onMoodSelect(id);
        setIsOpen(false);
    };

    return (
        <div className="mood-selector">
            <h2 className="mood-title">How are you feeling today?</h2>
            
            {/* Mobile Chips (Replacing Dropdown) */}
            <div className="mood-chips-mobile">
                <div className="mood-chips-container">
                    {moods.map((mood) => {
                        const isActive = selectedMood === mood.id;
                        return (
                            <button
                                key={mood.id}
                                className={`mood-chip ${isActive ? 'active' : ''}`}
                                onClick={() => onMoodSelect(mood.id)}
                            >
                                <span className="mood-chip-icon">{mood.icon}</span>
                                <span className="mood-chip-label">{mood.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Grid */}
            <div className="mood-grid">
                {moods.map((mood, index) => {
                    const isActive = selectedMood === mood.id;
                    return (
                        <motion.button
                            key={mood.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04, duration: 0.3 }}
                            whileHover={{ scale: 1.04, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            className={`mood-card ${isActive ? 'mood-card--active' : ''}`}
                            onClick={() => onMoodSelect(mood.id)}
                            style={{
                                '--mood-color': mood.color,
                                '--mood-bg':    mood.bg,
                            }}
                        >
                            <span className="mood-card-icon" style={{ color: mood.color }}>
                                {mood.icon}
                            </span>
                            <span className="mood-card-label">{mood.label}</span>
                            {isActive && (
                                <motion.span
                                    layoutId="active-indicator"
                                    className="mood-card-active-dot"
                                    style={{ background: mood.color }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default MoodSelector;
