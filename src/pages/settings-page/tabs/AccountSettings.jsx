import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { User, Mail, Camera, Save } from 'lucide-react';
import Button from '../../../components/common/Button';

const AccountSettings = () => {
  const { currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: 'johndoe',
    email: 'john@example.com',
    fullName: 'John Doe',
    bio: 'Product enthusiast and reviewer',
    location: 'San Francisco, CA',
    website: 'https://johndoe.com'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality with Supabase
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 
          className="text-2xl font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Account Settings
        </h2>
        {isEditing ? (
          <Button
            onClick={handleSave}
            className="flex items-center space-x-2"
            style={{ backgroundColor: currentTheme.colors.primary }}
          >
            <Save size={16} />
            <span>Save Changes</span>
          </Button>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2"
            style={{ backgroundColor: currentTheme.colors.primary }}
          >
            <span>Edit Profile</span>
          </Button>
        )}
      </div>

      <div className="flex items-start space-x-8">
        {/* Profile Picture */}
        <div className="relative">
          <div 
            className="w-32 h-32 rounded-full overflow-hidden"
            style={{ backgroundColor: currentTheme.colors.background }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <User size={48} style={{ color: currentTheme.colors.text }} />
            </div>
          </div>
          {isEditing && (
            <button
              className="absolute bottom-0 right-0 p-2 rounded-full"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <Camera size={16} />
            </button>
          )}
        </div>

        {/* Profile Information */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 rounded"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Email
              </label>
              <div className="flex items-center space-x-2">
                <Mail size={16} style={{ color: currentTheme.colors.text }} />
                <span style={{ color: currentTheme.colors.text }}>{formData.email}</span>
              </div>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 rounded"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 rounded"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text }}
            >
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={3}
              className="w-full p-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text }}
            >
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full p-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings; 