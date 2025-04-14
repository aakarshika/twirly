import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { User, Mail, Phone, MapPin, Globe, Camera, Save } from 'lucide-react';
import Button from '../common/Button';

const ProfileSettings = () => {
  const { currentTheme } = useTheme();
  const [profileData, setProfileData] = useState({
    username: 'johndoe',
    email: 'john@example.com',
    fullName: 'John Doe',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    website: 'https://johndoe.com',
    bio: 'Product designer and developer. Love creating beautiful and functional interfaces.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    socialLinks: {
      twitter: 'johndoe',
      github: 'johndoe',
      linkedin: 'johndoe'
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(profileData.avatar);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality with Supabase
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 
          className="text-2xl font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Profile Settings
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
        {/* Avatar Section */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <label 
                className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer"
                style={{ 
                  backgroundColor: currentTheme.colors.primary,
                  color: currentTheme.colors.background
                }}
              >
                <Camera size={16} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div>
              <h3 
                className="text-lg font-medium"
                style={{ color: currentTheme.colors.text }}
              >
                Profile Picture
              </h3>
              <p 
                className="text-sm"
                style={{ color: currentTheme.colors.text }}
              >
                Upload a new profile picture
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Basic Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User size={20} style={{ color: currentTheme.colors.text }} />
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                placeholder="Username"
                className="flex-1 p-2 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={20} style={{ color: currentTheme.colors.text }} />
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="flex-1 p-2 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
            <div className="flex items-center space-x-3">
              <User size={20} style={{ color: currentTheme.colors.text }} />
              <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="flex-1 p-2 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
            <div className="flex items-center space-x-3">
              <Phone size={20} style={{ color: currentTheme.colors.text }} />
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className="flex-1 p-2 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
            <div className="flex items-center space-x-3">
              <MapPin size={20} style={{ color: currentTheme.colors.text }} />
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="flex-1 p-2 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
            <div className="flex items-center space-x-3">
              <Globe size={20} style={{ color: currentTheme.colors.text }} />
              <input
                type="url"
                name="website"
                value={profileData.website}
                onChange={handleInputChange}
                placeholder="Website"
                className="flex-1 p-2 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Bio
          </h3>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself..."
            rows="4"
            className="w-full p-2 rounded-lg"
            style={{ 
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.text,
              border: `1px solid ${currentTheme.colors.border}`
            }}
          />
        </div>

        {/* Social Links */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Social Links
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white">
                𝕏
              </span>
              <input
                type="text"
                value={profileData.socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                placeholder="Twitter username"
                className="flex-1 p-2 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </span>
              <input
                type="text"
                value={profileData.socialLinks.github}
                onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                placeholder="GitHub username"
                className="flex-1 p-2 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </span>
              <input
                type="text"
                value={profileData.socialLinks.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                placeholder="LinkedIn username"
                className="flex-1 p-2 rounded-lg"
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
    </div>
  );
};

export default ProfileSettings; 