import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCcw } from 'lucide-react';

const VerseCard = ({ verse, onRefresh, loading, fontStyle = 'serif' }) => {
  return (
    <div className="verse-card-container">
      <AnimatePresence mode="wait">
        {verse && (
          <motion.div
            key={`${verse.book}-${verse.chapter}-${verse.verse}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="verse-card"
          >
            <div className="card-header">
              <Quote size={32} className="quote-icon" />
            </div>
            <div className="card-body">
              <p className={`verse-text font-${fontStyle}`}>{verse.text}</p>
            </div>
            <div className="card-footer">
              <span className="verse-reference">
                {verse.book} {verse.chapter}:{verse.verse}
              </span>
              <button 
                className={`refresh-btn ${loading ? 'spinning' : ''}`} 
                onClick={onRefresh}
                disabled={loading}
                aria-label="Get another verse"
              >
                <RefreshCcw size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerseCard;
