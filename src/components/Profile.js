import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
import Loader from './Loader';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth('/patient/profile');
        setProfile(data);
      } catch (err) { setMessage('Could not load profile'); }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Saving...');
    try {
      await fetchWithAuth('/patient/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      setMessage('Profile saved successfully!');
    } catch (err) { setMessage('Error: Could not save profile.'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">My Profile</h1>
      <div className="p-6 card-glassmorphism rounded-xl shadow-md max-w-lg">
        {message && <p className="text-indigo-600 mb-4">{message}</p>}
        {profile && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input type="text" name="full_name" value={profile.full_name} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input type="email" name="email" value={profile.email} disabled className="w-full p-2 border rounded-md bg-slate-100 dark:bg-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
              <input type="tel" name="phone_number" value={profile.phone_number || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
              <input type="date" name="date_of_birth" value={profile.date_of_birth || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Sex</label>
              <select name="sex" value={profile.sex || 'Male'} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-slate-700">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium">Save Changes</button>
          </form>
        )}
      </div>
    </div>
  );
}
export default Profile;
