import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import '../styles/RecipeDetail.css';

interface SpoonacularNutrition {
  nutrients?: Array<{ name?: string; title?: string; amount: number; unit: string; percentOfDailyNeeds?: number }>;
}

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { startCooking } = useAppContext();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // refs for jump links
  const introRef = useRef<HTMLDivElement | null>(null);
  const instructionsRef = useRef<HTMLElement | null>(null);
  const nutritionRef = useRef<HTMLElement | null>(null);

  // servings multiplier - default shows per-1-serving amounts
  const [servingsMultiplier, setServingsMultiplier] = useState<number>(1); // 0.5, 1, 2

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const key = process.env.REACT_APP_SPOONACULAR_API_KEY;
    if (!key) {
      setError('Missing Spoonacular API key (set REACT_APP_SPOONACULAR_API_KEY).');
      setLoading(false);
      return;
    }

    const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${key}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch recipe details');
        return res.json();
      })
      .then((data) => {
        setRecipe(data);
        // reset multiplier to 1 whenever a new recipe loads
        setServingsMultiplier(1);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Error loading recipe');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Voice controls: read all steps (uses analyzedInstructions -> steps)
  const buildTextFromSteps = () => {
    if (!recipe) return '';
    const instructionsArr: string[] = [];
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
      let stepIndex = 1;
      recipe.analyzedInstructions.forEach((instr: any) => {
        instr.steps.forEach((s: any) => {
          instructionsArr.push(`Step ${stepIndex}: ${s.step}`);
          stepIndex += 1;
        });
      });
    } else if (recipe.instructions) {
      // fallback to raw HTML/text
      const tmp = recipe.instructions.replace(/<\/?[^>]+(>|$)/g, '');
      instructionsArr.push(tmp);
    }
    return instructionsArr.join('. ');
  };

  const startVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }
    const text = buildTextFromSteps();
    if (!text) {
      alert('No instructions available to read.');
      return;
    }
    window.speechSynthesis.cancel();
    synthRef.current = window.speechSynthesis;
    utterRef.current = new SpeechSynthesisUtterance(text);
    utterRef.current.rate = 1;
    utterRef.current.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterRef.current.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    synthRef.current.speak(utterRef.current);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const togglePauseResume = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    } else if (synth.paused) {
      synth.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  };

  const stopVoice = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  if (loading) return <div className="recipe-detail">Loading...</div>;
  if (error) return <div className="recipe-detail error">Error: {error}</div>;
  if (!recipe) return <div className="recipe-detail">No recipe found.</div>;

  const nutrition = recipe.nutrition as SpoonacularNutrition | undefined;
  const steps =
    recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0
      ? recipe.analyzedInstructions[0].steps
      : [];

  // ingredient scaling: display amounts per serving by default
  const formatAmount = (amount: number) => {
    if (Math.abs(amount - Math.round(amount)) < 0.0001) return String(Math.round(amount));
    if (amount >= 1) return amount.toFixed(2).replace(/\.00$/, '');
    return amount.toFixed(2).replace(/\.00$/, '');
  };

  const getPerServingAmount = (ing: any) => {
    // many Spoonacular ingredients have 'amount' and recipe.servings present
    const totalAmount = typeof ing.amount === 'number' ? ing.amount : parseFloat(ing.amount || '0') || 0;
    const origServings = recipe.servings || 1;
    return totalAmount / origServings;
  };

  const scaledAmount = (ing: any) => {
    const per = getPerServingAmount(ing);
    return per * servingsMultiplier;
  };

  // nutrition helpers
  const findNutrient = (key: string) => {
    if (!nutrition || !nutrition.nutrients) return undefined;
    return nutrition.nutrients.find(
      (n) =>
        (n.title && n.title.toLowerCase().includes(key.toLowerCase())) ||
        (n.name && n.name.toLowerCase().includes(key.toLowerCase()))
    );
  };

  const jumpTo = (ref: React.RefObject<HTMLElement | HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="recipe-detail">
      <button onClick={() => navigate(-1)}>← Back</button>

      <div ref={introRef} className="detail-header">
        <img src={recipe.image} alt={recipe.title} className="detail-image" />
        <div className="detail-info">
          <h1>{recipe.title}</h1>
          <p dangerouslySetInnerHTML={{ __html: recipe.summary || '' }} />
          <div className="detail-meta">
            <span>{recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : ''}</span>
            <span>{recipe.servings ? `${recipe.servings} servings` : ''}</span>
          </div>

          <div className="jump-links">
            <button onClick={() => jumpTo(instructionsRef)}>Jump to Recipe</button>
            <button onClick={() => jumpTo(nutritionRef)}>Jump to Nutritional Facts</button>
          </div>

          <div className="voice-controls">
            <button
              className="primary-voice-bot"
              onClick={() => {
                if (recipe.hasVoiceGuidance === false || !steps.length) {
                  alert('No step-by-step voice guidance available for this recipe.');
                  return;
                }
                // Voice bot / voice cooking entry — local fallback
                startCooking(recipe);
                navigate('/cooking');
              }}
            >
              Voice Bot
            </button>
          </div>
        </div>
      </div>

      <section ref={instructionsRef} className="instructions">
        <h2>Ingredients</h2>

        <div className="servings-toggle">
          <button
            className={servingsMultiplier === 0.5 ? 'active' : ''}
            onClick={() => setServingsMultiplier(0.5)}
          >
            1/2X
          </button>
          <button
            className={servingsMultiplier === 1 ? 'active' : ''}
            onClick={() => setServingsMultiplier(1)}
          >
            1X
          </button>
          <button
            className={servingsMultiplier === 2 ? 'active' : ''}
            onClick={() => setServingsMultiplier(2)}
          >
            2X
          </button>
          <span className="servings-note">Showing amounts for {servingsMultiplier} serving(s)</span>
        </div>

        {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 ? (
          <table className="ingredient-table" aria-label="Ingredients">
            <thead>
              <tr>
                <th className="col-amount">Amount</th>
                <th className="col-ingredient">Ingredient</th>
              </tr>
            </thead>
            <tbody>
              {recipe.extendedIngredients.map((ing: any) => (
                <tr key={ing.id || ing.name}>
                  <td className="ingredient-amount-cell">
                    <div className="amount-inner">
                      {formatAmount(scaledAmount(ing))} {ing.unit || ''}
                    </div>
                  </td>
                  <td className="ingredient-name-cell">
                    <div className="ingredient-inner">{ing.originalName || ing.name || ing.original}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No ingredients available.</p>
        )}

        <h2 style={{ marginTop: 18 }}>Instructions</h2>
        {steps && steps.length > 0 ? (
          <ol>
            {steps.map((s: any) => (
              <li key={s.number}>
                <strong>Step {s.number}:</strong> {s.step}
              </li>
            ))}
          </ol>
        ) : (
          <div>
            <p>{recipe.instructions ? recipe.instructions.replace(/<\/?[^>]+(>|$)/g, '') : 'No instructions available.'}</p>
          </div>
        )}
      </section>

      <section ref={nutritionRef} className="nutrition">
        <h2>Nutrition Facts</h2>

        <div className="nutrition-label">
          <div className="nutrition-top">
            <div className="nutrition-servings">Servings Per Recipe: {recipe.servings || '—'}</div>
            {/* Calories */}
            <div className="nutrition-calories">
              Calories:&nbsp;
              <strong>
                {(() => {
                  const cal = findNutrient('calories') || findNutrient('calory') || findNutrient('energy');
                  return cal ? `${Math.round(cal.amount)} ${cal.unit}` : '—';
                })()}
              </strong>
            </div>
          </div>

          <table className="nutrition-table" aria-label="Nutrition Facts">
            <tbody>
              {[
                { key: 'fat', label: 'Total Fat' },
                { key: 'saturated fat', label: 'Saturated Fat' },
                { key: 'sodium', label: 'Sodium' },
                { key: 'carbohydrate', label: 'Total Carbohydrate' },
                { key: 'fiber', label: 'Dietary Fiber' },
                { key: 'sugar', label: 'Total Sugars' },
                { key: 'protein', label: 'Protein' },
              ].map((row) => {
                const n = findNutrient(row.key);
                return (
                  <tr key={row.key}>
                    <td className="nutrient-name">{row.label}</td>
                    <td className="nutrient-value">
                      {n ? `${Math.round(n.amount * 10) / 10} ${n.unit}` : '—'}
                    </td>
                    <td className="nutrient-percent">{n && n.percentOfDailyNeeds ? `${Math.round(n.percentOfDailyNeeds)}%` : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* additional micro nutrients list */}
          <div className="micro-nutrients">
            {nutrition && nutrition.nutrients
              ? nutrition.nutrients
                  .filter((n) => {
                    const lowPriority = ['calories', 'fat', 'protein', 'carbohydrate'];
                    const name = (n.title || n.name || '').toLowerCase();
                    return !lowPriority.some((p) => name.includes(p));
                  })
                  .slice(0, 8)
                  .map((n) => (
                    <div className="micro-item" key={(n.title || n.name) as string}>
                      <span className="micro-name">{n.title || n.name}</span>
                      <span className="micro-value">{Math.round(n.amount * 10) / 10} {n.unit} {n.percentOfDailyNeeds ? ` (${Math.round(n.percentOfDailyNeeds)}%)` : ''}</span>
                    </div>
                  ))
              : <p>Nutrition information not available.</p>}
          </div>

          <div className="nutrition-foot">
            <small>* Percent Daily Values are based on a 2,000 calorie diet.</small>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecipeDetail;