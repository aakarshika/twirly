import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { useEffect } from 'react';
const categoriesAll = [
  { id: '1', name: 'Technology', icon: '💻' },
  { id: '2', name: 'Fashion', icon: '👗' },
  { id: '3', name: 'Home & Living', icon: '🏠' },
  { id: '4', name: 'Beauty', icon: '💄' },
  { id: '5', name: 'Food & Beverages', icon: '🍽️' },
  { id: '6', name: 'Sports', icon: '⚽' },
  { id: '7', name: 'Books', icon: '📚' },
  { id: '8', name: 'Gaming', icon: '🎮' },
];

const notificationsAll = [
  { id: 'new-comparisons', name: 'New comparisons in my categories' },
  { id: 'votes', name: 'When someone votes on my comparisons' },
  { id: 'comments', name: 'When someone comments on my comparisons' },
  { id: 'trending', name: 'Trending comparisons' },
  { id: 'weekly-digest', name: 'Weekly digest' },
];

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const totalSteps = 4;
  const [preferences, setPreferences] = useState(null);
  const [categoryPreferences, setCategoryPreferences] = useState(null);
  const [notificationPreferences, setNotificationPreferences] = useState(null);
  const [notif, setNotif] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [username, setUsername] = useState('');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [allCategories, setAllCategories] = useState([]);

  const fetchPreferences = async () => {
    const prefs = await userService.getUserPreferences(user.id);
    const notif = await userService.getUserNotificationSettings(user.id);
    const cats = await userService.getUserCategoryPreferences(user.id);
      setPreferences(prefs);
      setNotificationPreferences(notif);
      setCategoryPreferences(cats);
      setSelectedCategories(cats.map(cat => cat.category_id+''));
      setSelectedNotifications(notif.notifications);
      setNotif(notif);
      
      if (prefs.display_name && cats && cats.length > 0 && notif && notif.created_at !== notif.updated_at) {
        setOnboardingComplete(true);
      }
      else if (prefs.display_name && cats && cats.length > 0) {
        setCurrentStep(4);
      } else if (prefs.display_name) {
        setUsername(prefs.display_name);
        setCurrentStep(3);
      }
    console.log(prefs);
  };
  useEffect(() => {
    fetchPreferences();
  }, [user]);

  useEffect(() => {
    if (onboardingComplete) {
      console.log('onboardingComplete');
      navigate('/dashboard');
    }
  }, [onboardingComplete]);

  const fetchAllCategories = async () => {
    const cats = await userService.getAllCategories();
    setAllCategories(cats);
  };

  useEffect(() => {
    fetchAllCategories();
  }, [user]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNotificationToggle = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const validateUsername = async () => {
    if (!username) {
      setError('Username is required');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    try {
      const isAvailable = await userService.checkUsernameAvailability(username);
      if (!isAvailable) {
        setError('Username is already taken');
        return false;
      }
      return true;
    } catch (error) {
      setError('Error checking username availability');
      return false;
    }
  };

  const handleNext = async () => {
    setError('');
    
    if (currentStep === 2) {
      const isValid = await validateUsername();
      if (!isValid) return;
    }

    if (currentStep === 3 && selectedCategories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await userService.saveUserPreferences(user.id, {
        display_name: username,
        id: preferences?.id || null,
        categories: selectedCategories,
        notifications: selectedNotifications,
        notifId: notif?.id || null,
      });
      setOnboardingComplete(true);
      window.location.href = '/dashboard';
    } catch (error) {
      setError('Error saving preferences. Please try again.');
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Welcome to Twirly! 🎉</h2>
            <p className="text-lg text-gray-600">
              Let's help you discover amazing products through community comparisons.
            </p>
            <div className="mt-8">
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Choose Your Username</h2>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text,
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                This will be your unique identifier on Twirly
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">What interests you?</h2>
            <p className="text-center text-gray-600">
              Select categories you're interested in to see relevant comparisons
            </p>
            <div className="grid grid-cols-2 gap-4">
              {categoriesAll.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedCategories.includes(category.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <p className="mt-2 font-medium">{category.name}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Notification Preferences</h2>
            <p className="text-center text-gray-600">
              Choose what you'd like to be notified about
            </p>
            <div className="space-y-4">
              {notificationsAll.map((pref) => (
                <label
                  key={pref.id}
                  className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(pref.id)}
                    onChange={() => handleNotificationToggle(pref.id)}
                    className="h-5 w-5 text-indigo-600 rounded"
                  />
                  <span>{pref.name}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: currentTheme.colors.background }}>
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step content */}
        <div className="mb-8">{renderStep()}</div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={
              loading ||
              (currentStep === 2 && !username) ||
              (currentStep === 3 && selectedCategories.length === 0)
            }
            className={`ml-auto px-6 py-2 rounded-lg ${
              currentStep === totalSteps
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {currentStep === totalSteps ? 'Saving...' : 'yoLoading...'}
              </span>
            ) : (
              currentStep === totalSteps ? 'Complete Setup' : 'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow; 