import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Nowy stan dla komunikatów sukcesu
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Your email is not verified. Please verify your email before logging in.');
        await auth.signOut(); // Logout to prevent access without verification
        setLoading(false);
        return;
      }

      setSuccess('Logged in successfully!');
      navigate('/');
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccess('Password reset email sent! Check your inbox.');
      setShowReset(false);
    } catch (err) {
      setError('Failed to send reset email. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess('Logged in with Google successfully!');
      navigate('/');
    } catch (err) {
      setError('Failed to log in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signInWithPopup(auth, facebookProvider);
      setSuccess('Logged in with Facebook successfully!');
      navigate('/');
    } catch (err) {
      setError('Failed to log in with Facebook.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        {error && <p className="error-message" aria-live="assertive">{error}</p>}
        {success && <p className="success-message" aria-live="polite">{success}</p>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email</label>
            <input
              type="email"
              id="email"
              className="login-input"
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
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <button className="reset-password-link" onClick={() => setShowReset(!showReset)}>
          Forgot your password?
        </button>

        {showReset && (
          <div className="reset-password-container">
            <h3>Reset Password</h3>
            <div className="input-group">
              <label htmlFor="reset-email" className="input-label">Enter your email to reset password</label>
              <input
                type="email"
                id="reset-email"
                className="login-input"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="button"
              className="reset-button"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </div>
        )}

        <div className="divider">or</div>
        <button className="google-button" onClick={handleGoogleSignIn} disabled={loading}>
          <FontAwesomeIcon icon={faGoogle} className="icon" /> Sign in with Google
        </button>
        <button className="facebook-button" onClick={handleFacebookSignIn} disabled={loading}>
          <FontAwesomeIcon icon={faFacebook} className="icon" /> Sign in with Facebook
        </button>

        <p className="register-link">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
