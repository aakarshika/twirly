import React from 'react';
import LottieAnimation from './LottieAnimation';
import loadingBarsAnimation from '../../assets/animations/loadingbars_lottie.json';
const LoadingScreen = ({ 
  message = 'Loading User...', 
  showLogo = false,
  size = 'default' // 'small' | 'default' | 'large'
}) => {
  const sizeClasses = {
    small: 'h-32 w-32',
    default: 'h-48 w-48',
    large: 'h-64 w-64'
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center transition-all duration-300 ease-in-out"
      style={{ 
        backgroundColor: 'var(--color-background)',
        zIndex: 9999 // Ensure it's above everything
      }}
    >
      <div className="text-center animate-fade-in">
        {/* {showLogo && (
          <img 
            src="/public_logo_transparent.png" 
            alt="logo" 
            className="h-24 w-24 mx-auto mb-4 transition-transform duration-300 hover:scale-105" 
          />
        )} */}
        <div className={sizeClasses[size]}>
          <LottieAnimation
            animationData={loadingBarsAnimation}
            loop={true}
            autoplay={true}
            speed={1}
          />
        </div>
        <p 
          className="mt-4 text-lg transition-colors duration-200"
          style={{ color: 'var(--color-text)' }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen; 