import React from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../config/api';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
      <Globe className="w-5 h-5 text-blue-100" />
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="bg-transparent text-blue-50 border-none focus:ring-0 text-sm font-medium appearance-none cursor-pointer hover:text-white transition-colors"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option 
            key={lang.code} 
            value={lang.code}
            className="bg-blue-600 text-white"
          >
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}