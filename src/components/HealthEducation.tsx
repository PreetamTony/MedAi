import React, { useState } from 'react';
import { Search, BookOpen, ExternalLink, Loader2, Volume2, VolumeX } from 'lucide-react';
import { playSound } from '../utils/audio';
import { speak, stopSpeaking } from '../utils/speech';
import { translateText } from '../utils/translation';
import LanguageSelector from './LanguageSelector';
import VoiceInput from './VoiceInput';

export default function HealthEducation() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const searchMedicalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Translate query to English if needed
      const queryText = currentLanguage !== 'en' 
        ? await translateText(query, 'en')
        : query;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a medical education assistant. Provide clear, accurate, and accessible information about medical topics. Use simple language and include relevant research when available.'
            },
            {
              role: 'user',
              content: queryText
            }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      const data = await response.json();
      let responseContent = data.choices[0].message.content;

      // Translate response if needed
      if (currentLanguage !== 'en') {
        responseContent = await translateText(responseContent, currentLanguage);
      }

      setResult(responseContent);
      playSound('success');
    } catch (error) {
      console.error('Error fetching medical information:', error);
      setResult('Sorry, there was an error retrieving the information. Please try again.');
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (result) {
      speak(result, currentLanguage);
      setIsSpeaking(true);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setQuery(transcript);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Search Medical Knowledge</h3>
        <LanguageSelector
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      </div>

      <form onSubmit={searchMedicalInfo} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for medical information..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <div className="flex gap-2">
          <VoiceInput onTranscript={handleVoiceInput} disabled={isLoading} />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5" />
                Search Medical Knowledge
              </>
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="bg-white rounded-lg border border-blue-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Search Results</h4>
            <button
              onClick={toggleSpeech}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isSpeaking ? (
                <VolumeX className="w-5 h-5 text-gray-600" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          <div className="prose prose-blue max-w-none">
            <div className="whitespace-pre-wrap">{result}</div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
              Find related research on PubMed
            </a>
          </div>
        </div>
      )}
    </div>
  );
}