import React from 'react';
import RecipeCard from './RecipeCard';
import { Recipe } from '../types';
import '../styles/RecipeList.css';

interface RecipeListProps {
  recipes: Recipe[];
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
  if (!recipes || recipes.length === 0) {
    return null;
  }

  return (
    <div className="recipe-list-container">
      <div className="recipe-list-header">
        <h2>Found {recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'}</h2>
      </div>
      <div className="recipe-grid">
        {recipes.map((recipe, index) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={index} />
        ))}
      </div>
    </div>
  );
};

export default RecipeList;
