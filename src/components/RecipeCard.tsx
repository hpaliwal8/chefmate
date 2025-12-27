import React from 'react';
import { Heart, Clock, Users, Mic, ShoppingCart, Leaf, Wheat } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Recipe } from '../types';
import '../styles/RecipeCard.css';

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, index }) => {
  const {
    setCurrentRecipe,
    startCooking,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addToShoppingList,
  } = useAppContext();

  const handleViewDetails = () => {
    setCurrentRecipe(recipe);
  };

  const handleStartCooking = () => {
    if (!recipe.hasVoiceGuidance || recipe.instructions.length === 0) {
      alert('This recipe does not have step-by-step instructions available.');
      return;
    }
    setCurrentRecipe(recipe);
    startCooking(recipe);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite(recipe.id)) {
      removeFromFavorites(recipe.id);
    } else {
      addToFavorites(recipe);
    }
  };

  const handleAddToList = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToShoppingList(recipe.ingredients);
    alert(`Added ${recipe.ingredients.length} ingredients to your shopping list!`);
  };

  return (
    <div className="recipe-card scale-in" onClick={handleViewDetails}>
      <div className="recipe-image-container">
        <img src={recipe.image} alt={recipe.title} className="recipe-image" />
        <button
          className={`favorite-button ${isFavorite(recipe.id) ? 'favorited' : ''}`}
          onClick={handleToggleFavorite}
          title={isFavorite(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} fill={isFavorite(recipe.id) ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="recipe-content">
        <h3 className="recipe-title">
          {index !== undefined && `${index + 1}. `}
          {recipe.title}
        </h3>

        <div className="recipe-meta">
          {recipe.readyInMinutes && (
            <span className="meta-item"><Clock size={14} /> {recipe.readyInMinutes} min</span>
          )}
          {recipe.servings && (
            <span className="meta-item"><Users size={14} /> {recipe.servings} servings</span>
          )}
        </div>

        {recipe.diets && recipe.diets.length > 0 && (
          <div className="diet-tags">
            {recipe.diets.slice(0, 3).map((diet, idx) => (
              <span key={idx} className="diet-tag">
                {(diet === 'vegetarian' || diet === 'vegan') && <Leaf size={12} />}
                {diet === 'gluten-free' && <Wheat size={12} />}
                {diet}
              </span>
            ))}
          </div>
        )}

        <p className="recipe-summary">
          {recipe.summary.slice(0, 120)}
          {recipe.summary.length > 120 && '...'}
        </p>

        <div className="recipe-actions">
          <button
            className="action-button primary"
            onClick={(e) => {
              e.stopPropagation();
              handleStartCooking();
            }}
            disabled={!recipe.hasVoiceGuidance}
          >
            <Mic size={14} /> Start Cooking
          </button>
          <button className="action-button secondary" onClick={handleAddToList}>
            <ShoppingCart size={14} /> Add Ingredients
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
