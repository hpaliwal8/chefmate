import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Heart, Settings, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AuthScreen from './AuthScreen';
import UserProfilePage from './UserProfilePage';
import '../styles/Header.css';

type ProfileTab = 'profile' | 'favorites' | 'preferences';

const Header: React.FC = () => {
  const { user, isAuthenticated, isAuthLoading, logout, favorites } = useAppContext();
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [profileTab, setProfileTab] = useState<ProfileTab>('profile');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const openProfile = (tab: ProfileTab) => {
    setProfileTab(tab);
    setShowUserProfile(true);
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon">🍳</span>
          <div className="brand-text">
            <h1>ChefMate</h1>
            <p className="tagline">Your Voice Cooking Assistant</p>
          </div>
        </div>

        <div className="header-actions">
          {isAuthLoading ? (
            <div className="auth-loading">
              <div className="spinner-small"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="user-menu-container" ref={menuRef}>
              <button
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="user-avatar">
                  <User size={18} />
                </div>
                <span className="user-email">{user?.email?.split('@')[0]}</span>
                <ChevronDown size={16} className={`chevron ${showUserMenu ? 'open' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <button
                    className="menu-item profile"
                    onClick={() => openProfile('profile')}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => openProfile('favorites')}
                  >
                    <Heart size={16} />
                    <span>Favorites</span>
                    {favorites.length > 0 && (
                      <span className="menu-badge">{favorites.length}</span>
                    )}
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => openProfile('preferences')}
                  >
                    <Settings size={16} />
                    <span>Preferences</span>
                  </button>
                  <div className="menu-divider"></div>
                  <button className="menu-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="sign-in-button"
              onClick={() => setShowAuthScreen(true)}
            >
              <User size={18} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth Screen */}
      <AuthScreen
        isOpen={showAuthScreen}
        onClose={() => setShowAuthScreen(false)}
      />

      {/* User Profile Page */}
      <UserProfilePage
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        initialTab={profileTab}
      />
    </>
  );
};

export default Header;
