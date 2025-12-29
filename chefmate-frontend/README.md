# 🍳 ChefMate - Voice Cooking Assistant

A React-based voice cooking assistant that helps you discover recipes, get step-by-step cooking instructions, manage shopping lists, and more - all through natural voice commands!

## ✨ Features

- 🎤 **Voice-Controlled Interface** - Interact entirely through voice commands using Web Speech API
- 🔍 **Smart Recipe Search** - Find recipes by ingredients, cuisine, dietary preferences, and more
- 👨‍🍳 **Step-by-Step Cooking Mode** - Hands-free cooking guidance with voice commands (next, previous, repeat)
- 🛒 **Shopping List Management** - Automatically generate and manage shopping lists
- ❤️ **Favorites System** - Save your favorite recipes
- 🥗 **Dietary Filters** - Support for vegetarian, vegan, gluten-free, keto, and more
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Spoonacular API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chefmate.git
   cd chefmate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Get your Spoonacular API key**
   - Visit [Spoonacular API Console](https://spoonacular.com/food-api/console#Dashboard)
   - Sign up for a free account
   - Copy your API key
   - Add it to `.env`:
     ```
     REACT_APP_SPOONACULAR_API_KEY=your_actual_api_key_here
     ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Allow microphone access when prompted
   - Start cooking! 🎉

## 🎯 How to Use

### Voice Commands

**Finding Recipes:**
- "Find me a pasta recipe"
- "What can I make with chicken and rice?"
- "Show me vegetarian dinner ideas"
- "I want something quick and easy"

**Getting Details:**
- "Tell me about the first one"
- "What are the ingredients?"
- "How long does it take?"

**Cooking Mode:**
- "Start cooking" / "Walk me through the recipe"
- "Next step"
- "Previous step"
- "Repeat that"
- "Stop cooking"

**Managing Lists:**
- "Add ingredients to my shopping list"
- "Save this recipe"

### Text Input

Don't want to use voice? Switch to text mode using the toggle button and type your queries!

## 📁 Project Structure

```
chefmate/
├── src/
│   ├── components/          # React components
│   │   ├── VoiceInterface.jsx
│   │   ├── RecipeCard.jsx
│   │   ├── RecipeList.jsx
│   │   ├── CookingMode.jsx
│   │   └── ShoppingList.jsx
│   ├── context/            # Global state management
│   │   └── AppContext.js
│   ├── services/           # API and business logic
│   │   ├── RecipeService.js
│   │   └── SpoonacularProvider.js
│   ├── hooks/              # Custom React hooks
│   │   ├── useVoiceRecording.js
│   │   └── useSpeechSynthesis.js
│   ├── styles/             # CSS files
│   └── App.jsx             # Main app component
├── public/
├── .env.example            # Environment variables template
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Voice Recognition:** Web Speech API
- **Text-to-Speech:** Web Speech Synthesis API
- **Recipe Data:** Spoonacular API
- **State Management:** React Context API
- **Styling:** CSS3 with CSS Variables

## 🔧 Configuration

### Spoonacular API

The free tier provides:
- 150 API calls per day
- Access to 350,000+ recipes
- Recipe search, details, and nutrition info

### Browser Compatibility

Voice features work best in:
- ✅ Chrome/Edge (recommended)
- ✅ Safari
- ⚠️ Firefox (limited speech recognition support)

## 🎨 Customization

### Changing Colors

Edit CSS variables in `src/styles/App.css`:

```css
:root {
  --primary-color: #FF6B35;     /* Main accent color */
  --secondary-color: #4ECDC4;   /* Secondary accent */
  --accent-color: #FFE66D;      /* Highlights */
  /* ... more variables */
}
```

### Adding New Features

The codebase is designed for easy extension:

1. **Add New Recipe Providers:** Create a new provider in `src/services/` (e.g., `EdamamProvider.js`)
2. **Custom Components:** Add to `src/components/`
3. **New Voice Commands:** Extend `classifyIntent()` in `VoiceInterface.jsx`

## 🚀 Deployment

### Deploy to Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy:
   ```bash
   npx netlify-cli deploy --prod
   ```

### Deploy to Vercel

```bash
npx vercel --prod
```

### Environment Variables

Remember to set `REACT_APP_SPOONACULAR_API_KEY` in your deployment platform's environment variables!

## 📊 API Usage & Costs

### Free Tier (Spoonacular)
- **Requests:** 150/day (4,500/month)
- **Cost:** $0/month
- **Perfect for:** Portfolio projects, demos, learning

### Paid Tiers (if needed)
- **Basic:** $0.004 per request
- **Mega:** $0.001 per request
- More info: [Spoonacular Pricing](https://spoonacular.com/food-api/pricing)

## 🐛 Troubleshooting

### Microphone Not Working
- Check browser permissions
- Use HTTPS (required for microphone access)
- Try Chrome/Edge for best compatibility

### No Recipe Results
- Check your API key in `.env`
- Verify you haven't exceeded daily quota (150 requests)
- Check browser console for errors

### Voice Recognition Not Working
- Chrome/Edge work best
- Speak clearly and in a quiet environment
- Check microphone settings in browser

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for learning and portfolio purposes!

## 🙏 Acknowledgments

- Recipe data powered by [Spoonacular API](https://spoonacular.com/food-api)
- Icons and emojis from standard Unicode sets
- Inspiration from voice assistants like Alexa and Google Assistant

## 📧 Contact

Questions? Issues? Feel free to open an issue on GitHub!

---

**Built with ❤️ for home cooks everywhere**
