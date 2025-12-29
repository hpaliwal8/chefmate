# ChefMate - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Your API Key (2 minutes)

1. Go to https://spoonacular.com/food-api/console#Dashboard
2. Click "Get Started" or "Sign Up"
3. Choose the FREE plan (150 requests/day)
4. Verify your email
5. Copy your API key from the dashboard

### Step 2: Set Up the Project (2 minutes)

```bash
# Navigate to project directory
cd chefmate-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and paste your API key
# REACT_APP_SPOONACULAR_API_KEY=your_key_here
```

### Step 3: Run the App (1 minute)

```bash
npm start
```

The app will open at http://localhost:3000

### Step 4: Use the App

1. **Allow microphone access** when prompted
2. **Click "Tap to Speak"** or use text input
3. **Try these commands:**
   - "Find me a pasta recipe"
   - "What can I make with chicken?"
   - "Show me vegetarian options"
   - "Tell me about the first one"
   - "Start cooking"

## 🎤 Voice Commands Cheat Sheet

### Search Recipes
- "Find [dish] recipe" → e.g., "Find pasta recipe"
- "What can I make with [ingredients]?" → e.g., "What can I make with chicken and rice?"
- "Show me [dietary] [meal]" → e.g., "Show me vegetarian dinner"
- "I want something [quick/easy/healthy]"

### Get Details
- "Tell me about the [first/second/third] one"
- "What are the ingredients?"
- "How long does it take?"

### Cooking Mode
- "Start cooking" → Begin step-by-step instructions
- "Next step" → Move to next instruction
- "Previous step" → Go back
- "Repeat" → Hear current step again
- "Stop cooking" → Exit cooking mode

### Shopping List
- "Add to shopping list" → After selecting a recipe
- "Show my shopping list"

## 🔧 Troubleshooting

### No Voice Input?
- ✅ Use Chrome or Edge (best compatibility)
- ✅ Enable microphone permissions
- ✅ Speak clearly in a quiet environment

### No Recipes Found?
- ✅ Check your API key in .env
- ✅ Make sure you didn't exceed 150 requests/day
- ✅ Check console for error messages

### API Key Not Working?
- ✅ Restart the dev server after adding .env
- ✅ Verify the key is correct (no extra spaces)
- ✅ Check you're using the right variable name

## 📊 Daily Limits (Free Tier)

- **150 API calls per day**
- **Tips to conserve requests:**
  - Search results are shown for 10 recipes but only count as 1 request
  - Recipe details count as 1 request each
  - Use text mode to review results before speaking

## 🎯 Next Steps

1. **Explore Features:**
   - Try different cuisines (Italian, Mexican, Thai)
   - Filter by diet (vegetarian, vegan, keto)
   - Use the shopping list
   - Save favorites

2. **Customize:**
   - Change colors in `src/styles/App.css`
   - Add your own voice commands
   - Integrate with other APIs

3. **Deploy:**
   - Build: `npm run build`
   - Deploy to Netlify or Vercel
   - Share with friends!

## 💡 Pro Tips

- **Better Voice Recognition:** Speak natural sentences like "Find me a quick pasta dinner"
- **Hands-Free Cooking:** Use voice commands while your hands are busy cooking
- **Mobile Friendly:** Works great on tablets while cooking
- **Text Backup:** Switch to text mode if voice isn't working perfectly

## 🆘 Need Help?

- Check the full README.md for detailed documentation
- Look at console errors (F12 in browser)
- Verify your .env file is set up correctly
- Make sure you're on HTTPS (localhost is okay)

---

**Happy Cooking! 🍳**
