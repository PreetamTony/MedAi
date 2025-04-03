import axios from 'axios';
import { Loader2, Mic, VolumeX } from 'lucide-react';
import React, { useRef, useState } from 'react';

// Extend the Window interface to include SpeechRecognition and webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type SpeechRecognition = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition;

const SpeechChat: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Tap to Speak');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Speech-to-Text (STT) using Web Speech API
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('Listening...');
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setIsProcessing(true);
      setStatus('Processing...');
      await handleSpeechInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setStatus('Error: Couldn’t hear you. Tap to try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Text Processing with Grok API
  const processWithGrok = async (text: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    try {
      const response = await axios.post(url, {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Provide clear and concise answers to user queries.' },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Grok API Error:', error.message);
      } else {
        console.error('Grok API Error:', error);
      }
      return 'Sorry, I encountered an error. Please try again.';
    }
  };

  // Text-to-Speech (TTS) with Murf.ai API
  const textToSpeech = async (text: string): Promise<void> => {
    const apiKey = 'ap2_56f7bd06-efce-4b1c-8b8e-7380144aa5dc'; // Replace with your Murf.ai API key
    const config = {
      method: 'post',
      url: 'https://api.murf.ai/v1/speech/generate',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': apiKey
      },
      data: JSON.stringify({
        voiceId: 'en-US-natalie',
        style: 'Promo',
        text,
        rate: 0,
        pitch: 0,
        sampleRate: 48000,
        format: 'MP3',
        channelType: 'MONO',
        pronunciationDictionary: {},
        encodeAsBase64: false,
        variation: 1,
        audioDuration: 0,
        modelVersion: 'GEN2',
        multiNativeLocale: 'en-US'
      })
    };

    try {
      const response = await axios(config);
      const audioUrl = response.data.audioFile;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
      setIsSpeaking(true);
      setStatus('Speaking...');
      audio.onended = () => {
        setIsSpeaking(false);
        setStatus('Tap to Speak');
        audioRef.current = null;
      };
    } catch (error) {
      console.error('TTS Error:', error);
      setStatus('Error: Couldn’t speak. Tap to try again.');
    }
  };

  // Handle the full speech-to-speech flow
  const handleSpeechInput = async (transcript: string) => {
    try {
      const grokResponse = await processWithGrok(transcript);
      await textToSpeech(grokResponse);
    } finally {
      setIsProcessing(false);
    }
  };

  // Stop speaking if clicked during playback
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
      setStatus('Tap to Speak');
    }
  };

  // Trigger voice input or stop speaking based on state
  const handleMicClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (!isListening && !isProcessing) {
      startVoiceInput();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-xl">
      {/* Animated Wave Effect */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div
          className={`absolute w-full h-full rounded-full transition-all duration-300 ${
            isListening || isSpeaking
              ? 'bg-blue-200 animate-pulse scale-110'
              : 'bg-blue-100'
          }`}
        />
        <div
          className={`absolute w-3/4 h-3/4 rounded-full transition-all duration-300 ${
            isListening || isSpeaking
              ? 'bg-blue-300 animate-pulse scale-105'
              : 'bg-blue-200'
          }`}
        />
        <div
          className={`absolute w-1/2 h-1/2 rounded-full transition-all duration-300 ${
            isListening || isSpeaking
              ? 'bg-blue-400 animate-pulse scale-100'
              : 'bg-blue-300'
          }`}
        />
      </div>

      {/* Mic Button */}
      <button
        onClick={handleMicClick}
        disabled={isProcessing}
        className={`relative z-10 p-6 rounded-full transition-all duration-300 ${
          isListening
            ? 'bg-green-600 text-white animate-pulse'
            : isSpeaking
            ? 'bg-red-600 text-white'
            : isProcessing
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : isSpeaking ? (
          <VolumeX className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </button>

      {/* Status Text */}
      <p className="mt-6 text-lg font-medium text-gray-700">
        {status}
      </p>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-500 text-center max-w-md">
        {isSpeaking
          ? 'Click to stop speaking.'
          : 'Tap the microphone to start speaking. I’ll listen and respond with voice!'}
      </div>
    </div>
  );
};

export default SpeechChat;