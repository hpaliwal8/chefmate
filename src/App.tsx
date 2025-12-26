import React from 'react';
import { AppProvider } from './context/AppContext';
import VoiceInterface from './components/VoiceInterface';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="App">
        <VoiceInterface />
      </div>
    </AppProvider>
  );
};

export default App;
