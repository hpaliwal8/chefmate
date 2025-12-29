import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Clock, Volume2, Mic, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { Recipe } from '../types';
import '../styles/CookingMode.css';

interface CookingModeProps {
  recipe: Recipe;
}

const CookingMode: React.FC<CookingModeProps> = ({ recipe }) => {
  const { currentStep, nextStep, previousStep, stopCooking } = useAppContext();

  const { speak, isSpeaking, stop: stopSpeaking } = useSpeechSynthesis();
  const { isListening, transcript, startListening, resetTranscript } = useVoiceRecording();

  const steps = recipe.instructions || [];
  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Speak current step when it changes
  useEffect(() => {
    if (currentStepData) {
      const stepText = `Step ${currentStep + 1} of ${totalSteps}. ${currentStepData.step}`;
      speak(stepText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Handle voice commands in cooking mode
  const handleVoiceCommand = (command: string) => {
    const lower = command.toLowerCase();

    if (lower.includes('next') || lower.includes('done')) {
      handleNext();
    } else if (lower.includes('previous') || lower.includes('back')) {
      handlePrevious();
    } else if (lower.includes('repeat') || lower.includes('again')) {
      handleRepeat();
    } else if (lower.includes('stop') || lower.includes('exit') || lower.includes('quit')) {
      handleExit();
    } else {
      speak("I didn't understand that. Say next step, previous step, repeat, or stop cooking.");
    }

    resetTranscript();
  };

  const handleVoiceClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    startListening(handleVoiceCommand);
  };

  const handleNext = () => {
    if (!isLastStep) {
      nextStep();
    } else {
      speak(
        `Congratulations! You've completed all steps. Your ${recipe.title} is ready. Enjoy!`
      );
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      previousStep();
    }
  };

  const handleRepeat = () => {
    if (currentStepData) {
      const stepText = `Step ${currentStep + 1}. ${currentStepData.step}`;
      speak(stepText);
    }
  };

  const handleExit = () => {
    stopSpeaking();
    stopCooking();
  };

  if (!currentStepData) {
    return (
      <div className="cooking-mode">
        <div className="error-state">
          <p>No cooking instructions available for this recipe.</p>
          <button onClick={handleExit} className="exit-button">
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cooking-mode fade-in">
      <div className="cooking-header">
        <button onClick={handleExit} className="exit-cooking-button">
          ← Exit Cooking Mode
        </button>
        <h2 className="recipe-title-cooking">{recipe.title}</h2>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <p className="step-counter">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>

      {/* Current Step */}
      <div className="current-step-container">
        <div className="step-number-badge">{currentStep + 1}</div>

        <div className="step-content">
          <p className="step-instruction">{currentStepData.step}</p>

          {currentStepData.length && (
            <div className="step-timing">
              <Clock size={14} /> Estimated time: {currentStepData.length.number} {currentStepData.length.unit}
            </div>
          )}

          {currentStepData.ingredients && currentStepData.ingredients.length > 0 && (
            <div className="step-details">
              <strong>Ingredients needed:</strong>
              <ul>
                {currentStepData.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>
          )}

          {currentStepData.equipment && currentStepData.equipment.length > 0 && (
            <div className="step-details">
              <strong>Equipment needed:</strong>
              <ul>
                {currentStepData.equipment.map((eq, idx) => (
                  <li key={idx}>{eq}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="cooking-controls">
        <button onClick={handlePrevious} disabled={isFirstStep} className="nav-button">
          <ArrowLeft size={16} /> Previous
        </button>

        <button
          onClick={handleRepeat}
          className="nav-button repeat-button"
          disabled={isSpeaking}
        >
          <Volume2 size={16} /> Repeat
        </button>

        <button onClick={handleNext} className="nav-button primary">
          {isLastStep ? <><Check size={16} /> Finish</> : <>Next <ArrowRight size={16} /></>}
        </button>
      </div>

      {/* Voice Command Button */}
      <div className="voice-command-section">
        <button
          onClick={handleVoiceClick}
          disabled={isListening || isSpeaking}
          className={`voice-command-button ${isListening ? 'listening' : ''}`}
        >
          {isListening ? (
            <>
              <span className="pulse"></span>
              <Mic size={20} /> Listening...
            </>
          ) : isSpeaking ? (
            <><Volume2 size={20} /> Speaking...</>
          ) : (
            <><Mic size={20} /> Voice Command</>
          )}
        </button>
        {transcript && <p className="voice-transcript">You said: "{transcript}"</p>}
        <p className="voice-hints">
          Say: "Next step" • "Previous step" • "Repeat" • "Stop cooking"
        </p>
      </div>

      {/* Completion Message */}
      {isLastStep && (
        <div className="completion-message">
          <p><Check size={16} /> Almost done! This is the final step.</p>
        </div>
      )}
    </div>
  );
};

export default CookingMode;
