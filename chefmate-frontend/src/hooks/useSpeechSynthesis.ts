import { useState, useCallback, useRef, useEffect } from 'react';
import { SpeechOptions } from '../types';

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  speak: (text: string, options?: SpeechOptions) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  queue: string[];
}

/**
 * Custom hook for text-to-speech
 * Can use either browser's Web Speech API or AWS Polly
 */
export const useSpeechSynthesis = (usePolly = false): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /**
   * Speak text using browser's Web Speech API (fallback/simple mode)
   */
  const speakBrowser = useCallback((text: string, options: SpeechOptions = {}) => {
    if (!text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = options.lang || 'en-US';

    // Try to find a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes('Samantha') ||
        voice.name.includes('Google US English') ||
        voice.lang === 'en-US'
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('Speech started');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('Speech ended');
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
      if (options.onError) options.onError(event);
    };

    window.speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
  }, []);

  /**
   * Speak text using AWS Polly (better quality, but requires AWS setup)
   */
  const speakPolly = useCallback(
    async (text: string, options: SpeechOptions = {}) => {
      if (!text) return;

      setIsSpeaking(true);

      try {
        // This would integrate with AWS Polly
        // For now, falling back to browser speech
        console.log('AWS Polly not configured, using browser speech');
        speakBrowser(text, options);
      } catch (error) {
        console.error('Polly error:', error);
        setIsSpeaking(false);
        // Fallback to browser speech
        speakBrowser(text, options);
      }
    },
    [speakBrowser]
  );

  const speak = useCallback(
    (text: string, options: SpeechOptions = {}) => {
      if (usePolly) {
        return speakPolly(text, options);
      } else {
        return speakBrowser(text, options);
      }
    },
    [usePolly, speakPolly, speakBrowser]
  );

  const stop = useCallback(() => {
    // Stop browser speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // Stop audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsSpeaking(false);
    setQueue([]);
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
    }
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
    pause,
    resume,
    queue,
  };
};
