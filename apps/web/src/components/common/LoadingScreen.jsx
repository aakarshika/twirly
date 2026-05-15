import React from 'react';
import LottieAnimation from './LottieAnimation';
import loadingBarsAnimation from '../../assets/animations/loadingbars_lottie.json';

const sizeClasses = {
  small:   'h-32 w-32',
  default: 'h-48 w-48',
  large:   'h-64 w-64',
};

const LoadingScreen = ({ message = 'Loading...', size = 'default' }) => (
  <div
    className="fixed inset-0 flex items-center justify-center z-[9999]"
    style={{ backgroundColor: 'var(--color-background)' }}
  >
    <div className="text-center">
      <div className={sizeClasses[size] ?? sizeClasses.default}>
        <LottieAnimation animationData={loadingBarsAnimation} loop autoplay />
      </div>
      <p className="mt-4 text-lg" style={{ color: 'var(--color-text)' }}>
        {message}
      </p>
    </div>
  </div>
);

export default LoadingScreen;
