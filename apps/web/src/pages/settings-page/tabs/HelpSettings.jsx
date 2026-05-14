import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { HelpCircle, Mail, MessageSquare, BookOpen, Save, Search } from 'lucide-react';
import Button from '../../../components/common/Button';

const HelpSettings = () => {
  const { currentTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [helpSettings, setHelpSettings] = useState({
    contactPreferences: {
      email: true,
      inApp: true,
      phone: false,
    },
    helpTopics: [
      {
        id: '1',
        title: 'Getting Started',
        description: 'Learn the basics of using our platform',
        icon: <BookOpen size={20} />,
      },
      {
        id: '2',
        title: 'Account Management',
        description: 'Manage your account settings and preferences',
        icon: <HelpCircle size={20} />,
      },
      {
        id: '3',
        title: 'Billing & Subscriptions',
        description: 'Information about payments and subscriptions',
        icon: <HelpCircle size={20} />,
      },
      {
        id: '4',
        title: 'Privacy & Security',
        description: 'Learn about our security measures and privacy policy',
        icon: <HelpCircle size={20} />,
      },
    ],
    faqs: [
      {
        id: '1',
        question: 'How do I change my password?',
        answer: 'You can change your password in the Security Settings section.',
      },
      {
        id: '2',
        question: 'How do I update my billing information?',
        answer: 'You can update your billing information in the Billing Settings section.',
      },
      {
        id: '3',
        question: 'How do I contact support?',
        answer: 'You can contact support through the Help Center or by emailing support@example.com.',
      },
    ],
  });

  const handleContactPreferenceToggle = preference => {
    setHelpSettings(prev => ({
      ...prev,
      contactPreferences: {
        ...prev.contactPreferences,
        [preference]: !prev.contactPreferences[preference],
      },
    }));
  };

  const handleSearch = e => {
    e.preventDefault();
    // TODO: Implement search functionality
    // console.log('Searching for:', searchQuery);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    // console.log('Saving help settings:', helpSettings);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2
          className="text-md font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Help & Support
        </h2>
        <Button
          onClick={handleSave}
          className="flex items-center space-x-2"
          style={{ backgroundColor: currentTheme.colors.primary }}
        >
          <Save size={16} />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Search Bar */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full p-4 pl-12 rounded-lg"
              style={{
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`,
              }}
            />
            <Search
              size={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
              style={{ color: currentTheme.colors.text }}
            />
          </form>
        </div>

        {/* Help Topics */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <h3
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Help Topics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helpSettings.helpTopics.map(topic => (
              <div
                key={topic.id}
                className="p-4 rounded-lg cursor-pointer hover:bg-opacity-5"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  border: `1px solid ${currentTheme.colors.border}`,
                }}
              >
                <div className="flex items-center space-x-3">
                  {topic.icon}
                  <div>
                    <h4 className="font-medium" style={{ color: currentTheme.colors.text }}>
                      {topic.title}
                    </h4>
                    <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                      {topic.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <h3
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {helpSettings.faqs.map(faq => (
              <div
                key={faq.id}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  border: `1px solid ${currentTheme.colors.border}`,
                }}
              >
                <h4 className="font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                  {faq.question}
                </h4>
                <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Preferences */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <h3
            className="text-lg font-medium mb-4 flex items-center space-x-2"
            style={{ color: currentTheme.colors.text }}
          >
            <MessageSquare size={20} />
            <span>Contact Preferences</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail size={16} />
                <span style={{ color: currentTheme.colors.text }}>Email Support</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={helpSettings.contactPreferences.email}
                  onChange={() => handleContactPreferenceToggle('email')}
                />
                <div
                  className="w-11 h-6 rounded-full peer"
                  style={{
                    backgroundColor: helpSettings.contactPreferences.email
                      ? currentTheme.colors.primary
                      : currentTheme.colors.border,
                  }}
                >
                  <div
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      transform: helpSettings.contactPreferences.email
                        ? 'translateX(5px)'
                        : 'translateX(0)',
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare size={16} />
                <span style={{ color: currentTheme.colors.text }}>In-App Support</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={helpSettings.contactPreferences.inApp}
                  onChange={() => handleContactPreferenceToggle('inApp')}
                />
                <div
                  className="w-11 h-6 rounded-full peer"
                  style={{
                    backgroundColor: helpSettings.contactPreferences.inApp
                      ? currentTheme.colors.primary
                      : currentTheme.colors.border,
                  }}
                >
                  <div
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      transform: helpSettings.contactPreferences.inApp
                        ? 'translateX(5px)'
                        : 'translateX(0)',
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HelpCircle size={16} />
                <span style={{ color: currentTheme.colors.text }}>Phone Support</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={helpSettings.contactPreferences.phone}
                  onChange={() => handleContactPreferenceToggle('phone')}
                />
                <div
                  className="w-11 h-6 rounded-full peer"
                  style={{
                    backgroundColor: helpSettings.contactPreferences.phone
                      ? currentTheme.colors.primary
                      : currentTheme.colors.border,
                  }}
                >
                  <div
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      transform: helpSettings.contactPreferences.phone
                        ? 'translateX(5px)'
                        : 'translateX(0)',
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSettings;
