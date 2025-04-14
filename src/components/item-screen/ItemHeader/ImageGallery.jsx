import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const ImageGallery = ({ images }) => {
  const { currentTheme } = useTheme();
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
        <span style={{ color: currentTheme.colors.text }}>No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full aspect-square rounded-lg overflow-hidden">
        <img
          src={images[selectedImage]}
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`w-full aspect-square rounded-lg overflow-hidden border-2 ${
                selectedImage === index ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <img
                src={image}
                alt={`Product view ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  if (e.target.src !== 'https://fakeimg.pl/600x400?text=img') {
                    e.target.src = 'https://fakeimg.pl/600x400?text=img';
                  }
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery; 