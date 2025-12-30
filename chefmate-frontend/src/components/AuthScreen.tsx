import React, { useState } from 'react';
import {
  X, Mail, Lock, Eye, EyeOff, ArrowRight,
  ChefHat, Loader2, AlertCircle, CheckCircle, ArrowLeft
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import '../styles/AuthScreen.css';

interface AuthScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'signin' | 'signup' | 'confirm' | 'forgot';

const AuthScreen: React.FC<AuthScreenProps> = ({ isOpen, onClose }) => {
  const { login, register, confirmRegistration, authError, isAuthLoading } = useAppContext();

  const [view, setView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setConfirmationCode('');
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      await login(email, password);
      resetForm();
      onClose();
    } catch (err) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'UserNotConfirmedException') {
        setPendingEmail(email);
        setView('confirm');
        setError('Please confirm your email address');
      } else {
        setError(error.message || 'Sign in failed');
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await register(email, password);
      setPendingEmail(email);
      setView('confirm');
      setSuccess('Check your email for a verification code');
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Sign up failed');
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!confirmationCode) {
      setError('Please enter the confirmation code');
      return;
    }

    try {
      await confirmRegistration(pendingEmail, confirmationCode);
      setSuccess('Email confirmed! You can now sign in.');
      setTimeout(() => {
        setView('signin');
        setEmail(pendingEmail);
        setPassword('');
        setSuccess(null);
      }, 2000);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Confirmation failed');
    }
  };

  const switchView = (newView: AuthView) => {
    resetForm();
    setView(newView);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-screen-overlay" onClick={handleBackdropClick}>
      <div className="auth-screen">
        {/* Close Button */}
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        {/* Left Panel - Branding */}
        <div className="auth-branding">
          <div className="auth-branding-content">
            <div className="auth-logo">
              <ChefHat size={48} />
            </div>
            <h1>ChefMate</h1>
            <p>Your personal voice cooking assistant</p>
            <div className="auth-features">
              <div className="auth-feature">
                <span className="feature-icon">🎤</span>
                <span>Voice-guided cooking</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">❤️</span>
                <span>Save favorite recipes</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">🛒</span>
                <span>Smart shopping lists</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">📱</span>
                <span>Sync across devices</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Forms */}
        <div className="auth-form-panel">
          <div className="auth-form-container">
            {/* Header */}
            <div className="auth-form-header">
              {view === 'confirm' && (
                <button
                  className="auth-back-btn"
                  onClick={() => switchView('signin')}
                  type="button"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="auth-header-text">
                <h2>
                  {view === 'signin' && 'Welcome back'}
                  {view === 'signup' && 'Create account'}
                  {view === 'confirm' && 'Verify email'}
                  {view === 'forgot' && 'Reset password'}
                </h2>
                <p>
                  {view === 'signin' && 'Sign in to access your recipes'}
                  {view === 'signup' && 'Start your culinary journey'}
                  {view === 'confirm' && `Enter the code sent to ${pendingEmail}`}
                  {view === 'forgot' && "We'll send you a reset link"}
                </p>
              </div>
            </div>

            {/* Alerts */}
            {(error || authError) && (
              <div className="auth-alert auth-alert-error">
                <AlertCircle size={18} />
                <span>{error || authError}</span>
              </div>
            )}

            {success && (
              <div className="auth-alert auth-alert-success">
                <CheckCircle size={18} />
                <span>{success}</span>
              </div>
            )}

            {/* Sign In Form */}
            {view === 'signin' && (
              <form onSubmit={handleSignIn} className="auth-form">
                <div className="auth-input-group">
                  <label htmlFor="email">Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-input-icon" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={isAuthLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="password">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={isAuthLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isAuthLoading}>
                  {isAuthLoading ? (
                    <Loader2 size={20} className="auth-spinner" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="auth-footer">
                  <span>Don't have an account?</span>
                  <button type="button" onClick={() => switchView('signup')}>
                    Sign up
                  </button>
                </div>
              </form>
            )}

            {/* Sign Up Form */}
            {view === 'signup' && (
              <form onSubmit={handleSignUp} className="auth-form">
                <div className="auth-input-group">
                  <label htmlFor="signup-email">Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-input-icon" />
                    <input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={isAuthLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="signup-password">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      disabled={isAuthLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      disabled={isAuthLoading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isAuthLoading}>
                  {isAuthLoading ? (
                    <Loader2 size={20} className="auth-spinner" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="auth-footer">
                  <span>Already have an account?</span>
                  <button type="button" onClick={() => switchView('signin')}>
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {/* Confirmation Form */}
            {view === 'confirm' && (
              <form onSubmit={handleConfirm} className="auth-form">
                <div className="auth-input-group">
                  <label htmlFor="code">Verification Code</label>
                  <input
                    id="code"
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="auth-code-input"
                    maxLength={6}
                    disabled={isAuthLoading}
                    autoComplete="one-time-code"
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isAuthLoading}>
                  {isAuthLoading ? (
                    <Loader2 size={20} className="auth-spinner" />
                  ) : (
                    <>
                      Verify Email
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="auth-footer">
                  <span>Didn't receive the code?</span>
                  <button type="button" onClick={() => switchView('signup')}>
                    Resend
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
