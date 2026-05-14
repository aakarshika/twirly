import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, TrendingUp, MessageSquare, Plus, ThumbsUp } from 'lucide-react';

const FirstTimeDashboard = ({ onComplete }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Your Dashboard! 🎉",
      description: "Let's take a quick tour of what you can do here.",
      icon: "🎯",
      position: "center",
    },
    {
      title: "Create Comparisons",
      description: "Start by creating your first comparison. Compare products, get opinions, and help others make better decisions.",
      icon: <Plus className="w-6 h-6" />,
      position: "top-right",
      action: () => navigate('/new-comparison'),
    },
    {
      title: "Track Your Activity",
      description: "See your votes, reviews, and how others engage with your content.",
      icon: <TrendingUp className="w-6 h-6" />,
      position: "center",
    },
    {
      title: "Engage with Community",
      description: "Vote on comparisons, leave reviews, and help others make informed decisions.",
      icon: <ThumbsUp className="w-6 h-6" />,
      position: "center",
    },
    {
      title: "Share Your Opinions",
      description: "Write reviews and share your experiences with products you've used.",
      icon: <MessageSquare className="w-6 h-6" />,
      position: "center",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed h-full w-full z-50 "
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
    >
    <div
      className="flex min-h-screen items-center justify-center"
    >
      <div
        className="relative max-w-md w-full mx-4 p-6 rounded-xl shadow-2xl transform transition-all duration-300"
        style={{
          backgroundColor: currentTheme.colors.card,
          color: currentTheme.colors.text,
        }}
      >
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-4">{currentStepData.icon}</div>
          <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
          <p className="text-gray-600" style={{ color: currentTheme.colors.textSecondary }}>
            {currentStepData.description}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep
                    ? 'bg-indigo-600'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="flex items-center px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.buttonText,
            }}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default FirstTimeDashboard;
