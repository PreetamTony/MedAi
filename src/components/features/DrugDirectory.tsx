import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, Pill, Search } from 'lucide-react';
import React, { useState } from 'react';

interface DrugInfo {
  name: string;
  description: string;
  usages: string[];
  sideEffects: string[];
  warnings: string[];
  interactions: string[];
  dosage: string;
  category: string;
  availability: 'available' | 'discontinued' | 'prescription-only' | 'unknown';
}

// A robust helper to recursively flatten any value into an array of strings.
const flattenToStrings = (value: any): string[] => {
  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.reduce((acc: string[], item: any) => [...acc, ...flattenToStrings(item)], []);
  }
  if (value && typeof value === 'object') {
    return Object.values(value).reduce((acc: string[], item: any) => [...acc, ...flattenToStrings(item)], []);
  }
  return [];
};

export default function DrugDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<DrugInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const commonConditions = [
    'Hypertension',
    'Diabetes',
    'Asthma',
    'Anxiety',
    'Depression',
    'Arthritis',
    'Heart Disease',
    'Allergies'
  ];

  const searchMedications = async () => {
    setIsLoading(true);
    setError(null);

    try {
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
              content: `You are a pharmaceutical database. You must respond ONLY with a valid JSON array in this exact format, with no additional text or explanation:
[{
  "name": "string",
  "description": "string",
  "usages": ["string"],
  "sideEffects": ["string"],
  "warnings": ["string"],
  "interactions": ["string"],
  "dosage": "string",
  "category": "string",
  "availability": "available|discontinued|prescription-only|unknown"
}]`
            },
            {
              role: 'user',
              content: `Search for medications ${
                searchQuery ? `matching "${searchQuery}"` :
                selectedLetter ? `starting with letter "${selectedLetter}"` :
                selectedCondition ? `used for "${selectedCondition}"` :
                ''
              }.`
            }
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      const data = await response.json();
      let results;
      try {
        results = JSON.parse(data.choices[0].message.content);
        if (!Array.isArray(results)) {
          throw new Error('Response is not an array');
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', data.choices[0].message.content);
        throw new Error('Failed to parse medication search results');
      }
      
      // Normalize each field by flattening to an array of strings.
      const validatedResults = results.map((drug: any) => ({
        name: drug.name || 'Unnamed Medication',
        description: drug.description || 'No description available.',
        usages: flattenToStrings(drug.usages) || ['Information not available'],
        sideEffects: flattenToStrings(drug.sideEffects) || ['No known side effects'],
        warnings: flattenToStrings(drug.warnings) || ['No special warnings'],
        interactions: flattenToStrings(drug.interactions) || ['No known interactions'],
        dosage: drug.dosage || 'Consult your physician for dosage',
        category: drug.category || 'General',
        availability: drug.availability || 'unknown',
      }));

      setSearchResults(validatedResults);
    } catch (err) {
      console.error('Error searching medications:', err);
      setError('Failed to fetch medication information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Pill className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Drug & Medication Directory</h2>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter medication name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
          </div>

          <button
            onClick={searchMedications}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search Medications
              </>
            )}
          </button>
        </div>
      </div>

      {/* Browse by Letter */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Browse by Letter</h3>
        <div className="flex flex-wrap gap-2">
          {alphabet.map(letter => (
            <button
              key={letter}
              onClick={() => {
                setSelectedLetter(letter);
                setSearchQuery('');
                setSelectedCondition(null);
                searchMedications();
              }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                selectedLetter === letter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Browse by Condition */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Browse by Condition</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {commonConditions.map(condition => (
            <button
              key={condition}
              onClick={() => {
                setSelectedCondition(condition);
                setSearchQuery('');
                setSelectedLetter(null);
                searchMedications();
              }}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedCondition === condition
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {error ? (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-4">
          {searchResults.map((drug, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-blue-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{drug.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    drug.availability === 'available' ? 'bg-green-100 text-green-800' :
                    drug.availability === 'discontinued' ? 'bg-red-100 text-red-800' :
                    drug.availability === 'prescription-only' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {drug.availability.replace('-', ' ').charAt(0).toUpperCase() + drug.availability.slice(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{drug.category}</span>
              </div>

              <p className="mt-4 text-gray-600">{drug.description}</p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Uses</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {drug.usages.map((usage, i) => (
                      <li key={i} className="text-gray-600">{usage}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Dosage</h4>
                  <p className="text-gray-600">{drug.dosage}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Side Effects & Warnings</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {drug.sideEffects.map((effect, i) => (
                      <li key={i} className="text-red-700">{effect}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Drug Interactions</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {drug.interactions.map((interaction, i) => (
                      <li key={i} className="text-yellow-700">{interaction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// Optional Error Boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <p className="text-red-800">Something went wrong. Please try again.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary };
