import React from 'react';
import { AppProvider } from './context/AppContext';
import VoiceInterface from './components/VoiceInterface';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecipeDetail from './components/RecipeDetail';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<VoiceInterface />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>

          
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
