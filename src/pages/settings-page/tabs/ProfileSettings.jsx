import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../lib/apiClient';
import { useTheme } from '../../../contexts/ThemeContext';
import { User, Mail, Phone, Save, Twitter, Instagram, Facebook } from 'lucide-react';
import Button from '../../../components/common/Button';
import Avatar from '../../../components/common/Avatar';
import { useLoading } from '../../../contexts/LoadingContext';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { setLoading, setError: setGlobalError } = useLoading();
  const [profileData, setProfileData] = useState({
    username: '',
    display_name: '',
    bio: '',
    email: '',
    profileImageUrl: '',
    phone: '',
    location: '',
    website: '',
    socialLinks: {
      twitter: '',
      github: '',
      linkedin: '',
    },
  });
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [usernameError, setUsernameError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setLoading('global', true, 'Loading profile...');
        setError(null);

        const { data } = await apiClient.get(`/users/${user.id}`);
        const profile = data.data;

        if (profile?.profile_image_url) {
          setAvatarPreview(profile.profile_image_url);
          setProfileData(prev => ({ ...prev, profileImageUrl: profile.profile_image_url }));
        }

        setProfileData(prev => ({ ...prev, ...profile }));
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.message);
        setGlobalError('global', err.message, () => window.location.reload());
      } finally {
        setLoading('global', false);
      }
    };

    fetchProfileData();
  }, [user]);

  const validateUsernameInput = value => {
    if (!value) {
      setUsernameError('Username is required');
      return false;
    }
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return false;
    }
    if (!/^[a-z0-9_]+$/.test(value)) {
      setUsernameError('Username can only contain lowercase letters, numbers, and underscores');
      return false;
    }
    if (value.includes(' ')) {
      setUsernameError('Username cannot contain spaces');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validateUsername = async value => {
    if (!validateUsernameInput(value)) return false;

    try {
      const { data } = await apiClient.get('/users/check-username', { params: { username: value } });
      if (!data.data?.available) {
        setUsernameError('Username is already taken');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking username availability:', error);
      setUsernameError('Error checking username availability');
      return false;
    }
  };

  const handleInputChange = async e => {
    const { name, value } = e.target;

    if (name === 'display_name') {
      const lowercaseValue = value.toLowerCase().replace(/ /g, '');
      setProfileData(prev => ({
        ...prev,
        [name]: lowercaseValue,
      }));
      await validateUsername(lowercaseValue);
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const _handleSocialLinkChange = (platform, value) => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append('file', file);
      const { data: uploadData } = await apiClient.post('/uploads?bucket=profile-pics', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = uploadData.data.url;
      setProfileData(prev => ({ ...prev, profileImageUrl: url }));
      setAvatarPreview(url);

      await apiClient.put('/users/me', { profile_image_url: url });
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError(err.message);
    }
  };

  const handleSave = async () => {
    try {
      setLoading('global', true, 'Saving profile...');
      await apiClient.put('/users/me', {
        username: profileData.username,
        display_name: profileData.display_name,
        bio: profileData.bio,
        profile_image_url: profileData.profileImageUrl,
      });
      setIsEditing(false);
    } catch (err) {
      if (err.code === '409' || err.response?.status === 409) {
        setUsernameError('Username already taken');
      } else {
        console.error('Error saving profile:', err);
        setError(err.message);
        setGlobalError('global', err.message, () => window.location.reload());
      }
    } finally {
      setLoading('global', false);
    }
  };

  if (error) {
    return null; // Error screen is now handled by LoadingContext
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2
          className="text-md font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Profile Settings
        </h2>
        <Button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className="flex items-center space-x-2"
          style={{ backgroundColor: currentTheme.colors.primary }}
        >
          <Save size={16} />
          <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <div className="flex items-center space-x-6">
            <Avatar
              profileImageUrl={avatarPreview}
              displayName={profileData.display_name}
              username={profileData.username}
              isEditable={isEditing}
              onAvatarChange={handleAvatarChange}
            />
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
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <h3
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Who are you?
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User size={20} style={{ color: currentTheme.colors.text }} />
              <input
                type="text"
                name="display_name"
                value={profileData.display_name}
                onChange={handleInputChange}
                placeholder="Username.. What others will see"
                readOnly={!isEditing}
                className="flex-1 p-2 rounded-lg"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${usernameError ? currentTheme.colors.error : currentTheme.colors.border}`,
                }}
              />
            </div>
            {usernameError && (
              <p className="text-sm text-red-500 mt-1">{usernameError}</p>
            )}
            <div className="flex items-center space-x-3">
              <Mail size={20} style={{ color: currentTheme.colors.text }} />
              <input
                type="email"
                name="email"
                value={user.email}
                readOnly
                placeholder="Email"
                className="flex-1 p-2 rounded-lg"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid transparent`,
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
                readOnly
                className="flex-1 p-2 rounded-lg"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid transparent`,
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
            border: `1px solid ${currentTheme.colors.border}`,
          }}
        >
          <h3
            className="text-lg font-medium mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            What are you?
          </h3>
          <textarea
            name="bio"
            onChange={handleInputChange}
            placeholder="Tell us about yourself..."
            readOnly={!isEditing}
            value={profileData.bio}
            rows="4"
            className="w-full p-2 rounded-lg"
            style={{
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.text,
              border: `1px solid ${currentTheme.colors.border}`,
            }}
          />
        </div>

        {/* Social Links */}
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
            Social Links
          </h3>

          <div className="space-y-4 ml-4">
            <div className="flex items-center space-x-3">
              <Twitter size={30} style={{ color: currentTheme.colors.text }} />
              <Instagram size={30} style={{ color: currentTheme.colors.text }} />
              <Facebook size={30} style={{ color: currentTheme.colors.text }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
