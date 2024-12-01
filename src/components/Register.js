import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import '../styles/Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      setSuccess('Registration successful! A verification email has been sent to your email address. Please verify your account before logging in.');
      
      // Opcjonalnie wylogowanie
      await auth.signOut();

      // Automatyczne ukrycie komunikatu o sukcesie po 5 sekundach
      setTimeout(() => setSuccess(''), 5000);

      // Przekierowanie na stronę logowania po 5 sekundach
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please log in instead.');
          break;
        case 'auth/invalid-email':
          setError('The email address is not valid. Please check and try again.');
          break;
        case 'auth/weak-password':
          setError('The password is too weak. Please use at least 6 characters.');
          break;
        default:
          setError('Failed to create account. Please check your information and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithPopup(auth, facebookProvider);
      navigate('/');
    } catch (err) {
      setError('Failed to sign in with Facebook.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create an Account</h2>
        {error && <p className="error-message" aria-live="assertive">{error}</p>}
        {success && <p className="success-message" aria-live="polite">{success}</p>}

        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email</label>
            <input
              type="email"
              id="email"
              className="register-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <input
              type="password"
              id="password"
              className="register-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password" className="input-label">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              className="register-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
          <button type="submit" className={`register-button ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div className="divider">or</div>

        <button className="google-button" onClick={handleGoogleSignIn} disabled={loading}>
          <i className="fab fa-google icon" aria-hidden="true" /> Sign in with Google
        </button>

        <button className="facebook-button" onClick={handleFacebookSignIn} disabled={loading}>
          <i className="fab fa-facebook-f icon" aria-hidden="true" /> Sign in with Facebook
        </button>

        <p className="login-link">Already have an account? <a href="/login">Log In</a></p>
      </div>
    </div>
  );
};

export default Register;
