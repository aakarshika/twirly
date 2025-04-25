import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ItemGallery = ({ itemId }) => {
  const { theme } = useTheme();
  const [currentImage, setCurrentImage] = useState(0);
  // This would be fetched from your API
  const images = [
    'https://via.placeholder.com/800x600',
    'https://via.placeholder.com/800x600',
    'https://via.placeholder.com/800x600',
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="relative aspect-square">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={images[currentImage]}
            alt={`Item ${currentImage + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={prevImage}
          className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextImage}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Thumbnails */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-2 h-2 rounded-full ${
                currentImage === index
                  ? theme === 'dark'
                    ? 'bg-white'
                    : 'bg-gray-900'
                  : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemGallery; 