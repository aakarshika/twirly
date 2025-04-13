import React, { useState } from 'react';
import { COMPARISON_COLOR_SET } from '../../lib/constants';

const ImageLoader = ({ item, index }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div className="relative">
      <div className="relative h-48">
        {!imageError ? (
          <div className="relative w-full h-full">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-400"></div>
              </div>
            )}
            <img 
              src={item.image} 
              alt={item.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
            {/* Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent" style={{ background: COMPARISON_COLOR_SET[index] }}>
              <h3 className="text-xl font-bold text-white line-clamp-1">{item.name}</h3>
              <p className="text-gray-200 text-sm line-clamp-2">{item.description}</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800" style={{ background: COMPARISON_COLOR_SET[index] }}>
            <div className="text-center px-4">
              <h3 className="text-xl font-bold text-gray-300 mb-2">{item.name}</h3>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLoader;
