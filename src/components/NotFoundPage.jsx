import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import LottieAnimation from './common/LottieAnimation';
import notFoundAnimation from '../assets/animations/pagenotfound_lottie.json';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      <div className="text-center space-y-6 max-w-md">
        {/* Lottie Animation */}
        <div className="w-64 h-64 mx-auto">
          <LottieAnimation
            animationData={notFoundAnimation}
            loop={true}
            autoplay={true}
            speed={1}
          />
        </div>

        {/* Uh oh message */}
        <div className="space-y-2">
          <p className="text-lg" style={{ color: currentTheme.colors.primary }}>
            Looks like you&apos;ve ventured into uncharted territory. Let&apos;s get you back on track!
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
            variant="outline"
            style={{
              borderColor: currentTheme.colors.primary,
              color: currentTheme.colors.primary,
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: currentTheme.colors.primary + '20',
                borderColor: currentTheme.colors.primary,
                color: currentTheme.colors.primary,
              },
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.background,
              '&:hover': {
                backgroundColor: currentTheme.colors.primary + 'E6',
              },
            }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
