import { SUPPORTED_LANGUAGES } from '../config/api';

// Text-to-speech utility
export const speak = (text: string, language: string = 'en-US') => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
};

// Stop any ongoing speech
export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Check if browser is currently speaking
export const isSpeaking = () => {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
};

// Get available voices for the specified language
export const getVoicesForLanguage = (language: string) => {
  return window.speechSynthesis.getVoices().filter(voice => 
    voice.lang.toLowerCase().includes(language.toLowerCase())
  );
};