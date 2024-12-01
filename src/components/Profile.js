import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
  onAuthStateChanged,
  signOut,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import MyCocktails from './MyCocktails'; // Import komponentu MyCocktails
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/login');
    } catch (error) {
      setError('Failed to log out. Please try again.');
      console.error('Error during logout:', error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword) {
      setError('Please enter your current and new password.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setShowChangePasswordForm(false); // Hide the form after successful update
    } catch (error) {
      switch (error.code) {
        case 'auth/wrong-password':
          setError('The current password is incorrect.');
          break;
        case 'auth/weak-password':
          setError('The new password is too weak. Use at least 6 characters.');
          break;
        default:
          setError('Failed to update password. Please try again.');
      }
    }
  };

  return (
    <div className="profile-container">
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div className="profile-content">
          <h2>Welcome, {user.email.split('@')[0]}</h2>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>

          <div className="profile-section">
            <h3>Profile Settings</h3>
            <p>Email: {user.email}</p>

            <button
              className="change-password-button"
              onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
            >
              Change Password
            </button>

            {showChangePasswordForm && (
              <form onSubmit={handleChangePassword} className="change-password-form">
                <div className="input-group">
                  <label htmlFor="currentPassword" className="input-label">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="profile-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="newPassword" className="input-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="profile-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <button type="submit" className="update-password-button">
                  Update Password
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowChangePasswordForm(false)}
                >
                  Cancel
                </button>
              </form>
            )}
            {error && <p className="error-message" aria-live="assertive">{error}</p>}
            {success && <p className="success-message" aria-live="polite">{success}</p>}
          </div>

          <div className="profile-section">
            <MyCocktails /> {/* Wyświetlanie MyCocktails pod przyciskiem zmiany hasła */}
          </div>
        </div>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default Profile;
