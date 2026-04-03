import React from 'react';
import { motion } from 'framer-motion';

const SkeletonVerse = () => {
  return (
    <div className="skeleton-verse">
      <div className="skeleton-num"></div>
      <div className="skeleton-content">
        <div className="skeleton-line w-full"></div>
        <div className="skeleton-line w-3/4"></div>
      </div>
    </div>
  );
};

export const ChapterSkeleton = () => {
  return (
    <div className="chapter-skeleton">
      <div className="skeleton-title"></div>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonVerse key={i} />
      ))}
    </div>
  );
};

export default SkeletonVerse;
