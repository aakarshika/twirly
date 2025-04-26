import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { User, Mail, Phone, MapPin, Globe, Camera, Save } from 'lucide-react';
import Button from '../common/Button';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [profileData, setProfileData] = useState({
    username: '',
    displayName: '',
    bio: '',
    email: '',
    profileImageUrl: '',
    phone: '',
    location: '',
    website: '',
    socialLinks: {
      twitter: '',
      github: '',
      linkedin: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user preferences
        const { data: profile, error: profileError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();



        if (profileError) throw profileError;

        // If there's a profile image URL, get the public URL
        if (profile?.profile_image_url) {
          // Extract just the file path from the URL if it's a full URL
          const filePath = profile.profile_image_url.includes('storage/v1/object/public/profile-pics/')
            ? profile.profile_image_url.split('storage/v1/object/public/profile-pics/')[1]
            : profile.profile_image_url;

          console.log('Extracted file path:', filePath);
          const { data: { publicUrl } } = supabase.storage
            .from('profile-pics')
            .getPublicUrl(filePath);
          console.log('Generated public URL:', publicUrl);
          setAvatarPreview(publicUrl);
          setProfileData(prev => ({
            ...prev,
            profileImageUrl: filePath
          }));
        }

        setProfileData(prev => ({
          ...prev,
          ...profile
        }));
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Create a unique file name using timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      // Create path with user ID (UUID) as folder name
      const filePath = `${user.id}/${fileName}`;
      console.log('Uploading file to path:', filePath);

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pics')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pics')
        .getPublicUrl(filePath);
      console.log('Generated public URL after upload:', publicUrl);

      // Update both the file path and the avatar preview
      setProfileData(prev => ({
        ...prev,
        profileImageUrl: filePath
      }));
      setAvatarPreview(publicUrl);

      // First, check if user preferences exist
      const { data: existingPreferences } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Update or insert user preferences
      const { error: updateError } = await supabase
        .from('user_preferences')
        .upsert({
          id: existingPreferences?.id,
          user_id: user.id,
          profile_image_url: filePath // Store just the file path, not the full URL
        }, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;

    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError(err.message);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          username: profileData.username,
          display_name: profileData.displayName,
          bio: profileData.bio,
          profile_image_url: getPublicUrl(profileData.profile_image_url) // Store the file path instead of public URL
        });

      if (error) throw error;
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message);
    }
  };
  const getPublicUrl = (filePath) => {
    if (!filePath) return null;
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pics')
      .getPublicUrl(filePath);
    return publicUrl;
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: currentTheme.colors.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.errorBackground, color: currentTheme.colors.errorText }}>
        Error loading profile data: {error}
      </div>
    );
  }

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
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full bg-cover bg-center overflow-hidden"
                style={{ 
                  backgroundColor: currentTheme.colors.border,
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', e);
                      setAvatarPreview('');
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-full" style={{ backgroundColor: currentTheme.colors.primary }}>
                    <span className="text-white text-2xl">
                      {profileData.displayName?.[0] || profileData.username?.[0] || '?'}
                    </span>
                  </div>
                )}
              </div>
              {isEditing && (
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
              )}
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
                readOnly={!isEditing}
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
                readOnly
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
                name="displayName"
                value={profileData.displayName}
                onChange={handleInputChange}
                placeholder="Display Name"
                readOnly={!isEditing}
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
                readOnly={!isEditing}
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
                readOnly={!isEditing}
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
                readOnly={!isEditing}
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
            onChange={handleInputChange}
            placeholder="Tell us about yourself..."
            readOnly={!isEditing}
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

        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 