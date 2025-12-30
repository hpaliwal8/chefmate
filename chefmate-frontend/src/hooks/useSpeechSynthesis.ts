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
  // Ref to hold the resume timer for Chrome bug workaround
  const resumeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear any running timer
      if (resumeTimerRef.current) {
        clearInterval(resumeTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Clear the resume timer
  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      clearInterval(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  /**
   * Speak text using browser's Web Speech API (fallback/simple mode)
   * Includes workaround for Chrome bug that cancels long utterances
   */
  const speakBrowser = useCallback((text: string, options: SpeechOptions = {}) => {
    if (!text) return;

    // Cancel any ongoing speech and timer
    clearResumeTimer();
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

    // Chrome bug workaround: keep-alive timer to resume paused speech
    // Chrome sometimes auto-pauses long utterances; this resumes them
    const startResumeTimer = () => {
      clearResumeTimer();
      resumeTimerRef.current = setInterval(() => {
        if (window.speechSynthesis.paused && !window.speechSynthesis.speaking) {
          // Speech got stuck, try to resume
          window.speechSynthesis.resume();
        }
      }, 250);
    };

    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('Speech started');
      startResumeTimer();
    };

    utterance.onend = () => {
      clearResumeTimer();
      setIsSpeaking(false);
      console.log('Speech ended');
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      clearResumeTimer();
      // Ignore 'canceled' errors - these happen when speech is intentionally stopped
      // or when Chrome's buggy speech synthesis auto-cancels
      if (event.error === 'canceled') {
        console.log('Speech canceled');
      } else {
        console.error('Speech error:', event);
        if (options.onError) options.onError(event);
      }
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
  }, [clearResumeTimer]);

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
    // Clear resume timer
    clearResumeTimer();

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
  }, [clearResumeTimer]);

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
