import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useTheme } from '../../../contexts/ThemeContext';
import { User, Mail, Phone, MapPin, Globe, Camera, Save, Twitter, Instagram, Facebook } from 'lucide-react';
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
      linkedin: ''
    }
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

          const { data: { publicUrl } } = supabase.storage
            .from('profile-pics')
            .getPublicUrl(filePath);
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
        setGlobalError('global', err.message, () => window.location.reload());
      } finally {
        setLoading('global', false);
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
      setLoading('global', true, 'Saving profile...');
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          id: profileData?.id,
          user_id: user.id,
          username: profileData.username,
          display_name: profileData.display_name,
          bio: profileData.bio,
          profile_image_url: profileData.profileImageUrl // Store just the file path
        });

      if (error) throw error;
      setIsEditing(false);
    } catch (err) {
      if(err.code === '23505') {
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

  const getPublicUrl = (filePath) => {
    if (!filePath) return null;
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pics')
      .getPublicUrl(filePath);
    return publicUrl;
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
            border: `1px solid ${currentTheme.colors.border}`
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
            border: `1px solid ${currentTheme.colors.border}`
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
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              />
            </div>
            {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}
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
                  border: `1px solid transparent`
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
                  border: `1px solid transparent`
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