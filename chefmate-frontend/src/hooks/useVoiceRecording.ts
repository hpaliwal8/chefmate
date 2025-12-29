import { useState, useCallback, useRef } from 'react';

// Web Speech API types (not natively available in TypeScript)
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

interface UseVoiceRecordingReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: (onResult?: (result: string) => void) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

/**
 * Custom hook for voice recording using Web Speech API
 */
export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const startListening = useCallback((onResult?: (result: string) => void) => {
    // Check browser support
    const windowAny = window as unknown as Record<string, SpeechRecognitionConstructor | undefined>;

    if (!windowAny.webkitSpeechRecognition && !windowAny.SpeechRecognition) {
      setError('Speech recognition is not supported in your browser. Please use Chrome.');
      return;
    }

    const RecognitionConstructor = windowAny.SpeechRecognition || windowAny.webkitSpeechRecognition;

    if (!RecognitionConstructor) {
      setError('Speech recognition is not available.');
      return;
    }

    const recognition = new RecognitionConstructor();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('Voice recognition started');
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const speechResult = event.results[0][0].transcript;
      console.log('Speech result:', speechResult);
      setTranscript(speechResult);

      if (onResult) {
        onResult(speechResult);
      }
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      switch (event.error) {
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        case 'audio-capture':
          setError('No microphone found. Please check your microphone.');
          break;
        case 'not-allowed':
          setError('Microphone permission denied. Please allow microphone access.');
          break;
        default:
          setError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Voice recognition ended');
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};
