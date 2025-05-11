import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../../services/users';
import Button from '../common/Button';

export const UserProfile = () => {
  const { user, signOut } = useAuthContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getUserProfile();
        setProfile(profileData);
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>No profile data found</div>;

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div className="profile-info">
        <p><strong>Username:</strong> {profile.display_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Member since:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
      </div>
      <div>
        <Button
          variant="ghost"
          onClick={signOut}
          className="text-gray-400 hover:text-white"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default UserProfile; 