import React, { useState } from 'react';
import {
  X, User, Heart, Settings, LogOut, Clock, Users as UsersIcon,
  ChefHat, Trash2, Check, Save, Loader2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Recipe, UserPreferences } from '../types';
import '../styles/UserProfilePage.css';

interface UserProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'favorites' | 'preferences';
}

type TabId = 'profile' | 'favorites' | 'preferences';

const DIET_OPTIONS = [
  { value: null, label: 'No restriction' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten free', label: 'Gluten Free' },
  { value: 'ketogenic', label: 'Ketogenic' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'pescetarian', label: 'Pescetarian' },
];

const ALLERGEN_OPTIONS = [
  'Dairy', 'Egg', 'Gluten', 'Peanut', 'Seafood',
  'Sesame', 'Shellfish', 'Soy', 'Tree Nut', 'Wheat'
];

const CUISINE_OPTIONS = [
  'American', 'Chinese', 'French', 'Indian', 'Italian',
  'Japanese', 'Korean', 'Mediterranean', 'Mexican', 'Thai'
];

const UserProfilePage: React.FC<UserProfilePageProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile'
}) => {
  const {
    user,
    logout,
    favorites,
    removeFromFavorites,
    setCurrentRecipe,
    startCooking,
    userPreferences,
    updateUserPreferences,
    isDataLoading
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(userPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync preferences when switching to preferences tab
  const handleTabChange = (tab: TabId) => {
    if (tab === 'preferences') {
      setLocalPrefs(userPreferences);
      setSaveSuccess(false);
    }
    setActiveTab(tab);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleCookRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    startCooking(recipe);
    onClose();
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updateUserPreferences(localPrefs);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasPreferenceChanges = JSON.stringify(localPrefs) !== JSON.stringify(userPreferences);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile' as TabId, label: 'Profile', icon: User },
    { id: 'favorites' as TabId, label: 'Favorites', icon: Heart, badge: favorites.length || undefined },
    { id: 'preferences' as TabId, label: 'Preferences', icon: Settings },
  ];

  return (
    <div className="user-profile-overlay" onClick={handleBackdropClick}>
      <div className="user-profile-page">
        {/* Header */}
        <header className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar">
              <User size={24} />
            </div>
            <div className="profile-header-text">
              <h1>{user?.email?.split('@')[0] || 'User'}</h1>
              <p>{user?.email}</p>
            </div>
          </div>
          <button className="profile-close-btn" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              {tab.badge && <span className="tab-badge">{tab.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="profile-content">
          {isDataLoading ? (
            <div className="profile-loading">
              <Loader2 size={32} className="spinner" />
              <p>Loading your data...</p>
            </div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="tab-panel profile-tab-panel">
                  <div className="profile-section">
                    <h2>Account</h2>
                    <div className="profile-info-card">
                      <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">{user?.email}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Member since</span>
                        <span className="info-value">Recently joined</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h2>Statistics</h2>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <Heart size={24} className="stat-icon" />
                        <span className="stat-value">{favorites.length}</span>
                        <span className="stat-label">Saved Recipes</span>
                      </div>
                      <div className="stat-card">
                        <ChefHat size={24} className="stat-icon" />
                        <span className="stat-value">0</span>
                        <span className="stat-label">Recipes Cooked</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <button className="logout-btn" onClick={handleLogout}>
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div className="tab-panel favorites-tab-panel">
                  {favorites.length === 0 ? (
                    <div className="empty-state">
                      <Heart size={48} className="empty-icon" />
                      <h3>No favorites yet</h3>
                      <p>Save recipes you love by tapping the heart icon.</p>
                    </div>
                  ) : (
                    <div className="favorites-list">
                      {favorites.map((recipe) => (
                        <div key={recipe.id} className="favorite-item">
                          <div className="favorite-image">
                            {recipe.image ? (
                              <img src={recipe.image} alt={recipe.title} />
                            ) : (
                              <div className="no-image">
                                <ChefHat size={24} />
                              </div>
                            )}
                          </div>
                          <div className="favorite-details">
                            <h3>{recipe.title}</h3>
                            <div className="favorite-meta">
                              {recipe.readyInMinutes && (
                                <span><Clock size={14} /> {recipe.readyInMinutes} min</span>
                              )}
                              {recipe.servings && (
                                <span><UsersIcon size={14} /> {recipe.servings}</span>
                              )}
                            </div>
                          </div>
                          <div className="favorite-actions">
                            <button
                              className="action-btn cook"
                              onClick={() => handleCookRecipe(recipe)}
                              title="Start cooking"
                            >
                              <ChefHat size={18} />
                            </button>
                            <button
                              className="action-btn remove"
                              onClick={() => removeFromFavorites(recipe.id)}
                              title="Remove from favorites"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="tab-panel preferences-tab-panel">
                  <div className="pref-section">
                    <h3>Dietary Restriction</h3>
                    <p className="pref-desc">Your primary dietary preference</p>
                    <div className="radio-group">
                      {DIET_OPTIONS.map((option) => (
                        <label
                          key={option.value ?? 'none'}
                          className={`radio-option ${localPrefs.diet === option.value ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="diet"
                            checked={localPrefs.diet === option.value}
                            onChange={() => setLocalPrefs(p => ({ ...p, diet: option.value }))}
                          />
                          <span className="radio-check">
                            {localPrefs.diet === option.value && <Check size={14} />}
                          </span>
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pref-section">
                    <h3>Allergens to Avoid</h3>
                    <p className="pref-desc">Select any ingredients you're allergic to</p>
                    <div className="chip-group">
                      {ALLERGEN_OPTIONS.map((allergen) => (
                        <button
                          key={allergen}
                          type="button"
                          className={`chip ${localPrefs.allergens.includes(allergen) ? 'selected' : ''}`}
                          onClick={() => {
                            setLocalPrefs(p => ({
                              ...p,
                              allergens: p.allergens.includes(allergen)
                                ? p.allergens.filter(a => a !== allergen)
                                : [...p.allergens, allergen]
                            }));
                          }}
                        >
                          {localPrefs.allergens.includes(allergen) && <Check size={12} />}
                          {allergen}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pref-section">
                    <h3>Favorite Cuisines</h3>
                    <p className="pref-desc">Recipes from these cuisines will be prioritized</p>
                    <div className="chip-group">
                      {CUISINE_OPTIONS.map((cuisine) => (
                        <button
                          key={cuisine}
                          type="button"
                          className={`chip ${localPrefs.cuisinePreferences.includes(cuisine) ? 'selected' : ''}`}
                          onClick={() => {
                            setLocalPrefs(p => ({
                              ...p,
                              cuisinePreferences: p.cuisinePreferences.includes(cuisine)
                                ? p.cuisinePreferences.filter(c => c !== cuisine)
                                : [...p.cuisinePreferences, cuisine]
                            }));
                          }}
                        >
                          {localPrefs.cuisinePreferences.includes(cuisine) && <Check size={12} />}
                          {cuisine}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pref-section">
                    <h3>Maximum Cooking Time</h3>
                    <p className="pref-desc">Filter recipes by preparation time</p>
                    <select
                      className="time-select"
                      value={localPrefs.maxCookingTime ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setLocalPrefs(p => ({
                          ...p,
                          maxCookingTime: value ? parseInt(value, 10) : null
                        }));
                      }}
                    >
                      <option value="">No limit</option>
                      <option value="15">15 minutes or less</option>
                      <option value="30">30 minutes or less</option>
                      <option value="45">45 minutes or less</option>
                      <option value="60">1 hour or less</option>
                      <option value="90">1.5 hours or less</option>
                    </select>
                  </div>

                  {/* Save Button */}
                  <div className="pref-footer">
                    <button
                      className={`save-btn ${saveSuccess ? 'success' : ''}`}
                      onClick={handleSavePreferences}
                      disabled={isSaving || !hasPreferenceChanges || saveSuccess}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={18} className="spinner" />
                          Saving...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <Check size={18} />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
