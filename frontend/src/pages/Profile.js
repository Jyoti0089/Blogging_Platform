import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { updateProfile } from '../store/slices/authSlice';

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profileImage: ''
  });

  // ✅ FIX 1: _id use
  const isOwnProfile = currentUser && currentUser._id === id;

  useEffect(() => {
    // ✅ FIX 2: safety check
    if (!id) return;

    const fetchProfile = async () => {
      try {
        // ✅ FIX 3: deployed URL use
        const response = await axios.get(
          `https://blogging-platform-mnra.onrender.com/api/users/${id}`
        );

        setProfile(response.data.data);
        setFormData({
          username: response.data.data.username,
          bio: response.data.data.bio || '',
          profileImage: response.data.data.profileImage
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateProfile(formData));
    setIsEditing(false);

    // ✅ refresh profile (fixed URL)
    const response = await axios.get(
      `https://blogging-platform-mnra.onrender.com/api/users/${id}`
    );
    setProfile(response.data.data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-start gap-6">
          <img
            src={profile.profileImage}
            alt={profile.username}
            className="w-32 h-32 rounded-full object-cover"
          />
          
          <div className="flex-1">
            {!isEditing ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-800">{profile.username}</h1>
                  
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <p className="text-gray-600 mb-4">{profile.email}</p>

                {profile.bio && <p className="text-gray-700">{profile.bio}</p>}

                <div className="mt-4 flex gap-6">
                  <div>
                    <span className="font-bold text-2xl text-gray-800">
                      {profile.blogs?.length || 0}
                    </span>
                    <p className="text-gray-600">Blogs</p>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full mb-3 p-2 border rounded"
                />

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full mb-3 p-2 border rounded"
                />

                <input
                  type="text"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleChange}
                  className="w-full mb-3 p-2 border rounded"
                />

                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                  Save
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">
        {isOwnProfile ? 'My Blogs' : `${profile.username}'s Blogs`}
      </h2>

      {profile.blogs?.length === 0 && <p>No blogs yet</p>}
    </div>
  );
};

export default Profile;