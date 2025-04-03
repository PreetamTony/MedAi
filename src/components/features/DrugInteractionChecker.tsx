import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';

interface DrugInteraction {
  severity: 'high' | 'moderate' | 'low';
  description: string;
  recommendation: string;
  mechanism: string;
}

export default function DrugInteractionChecker() {
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const checkInteractions = async () => {
    if (medications.length < 2) {
      setError('Please add at least two medications to check for interactions.');
      return;
    }

    setIsAnalyzing(true);
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
              content: `You are a drug interaction analysis system. You must respond ONLY with a valid JSON array in this exact format, with no additional text or explanation:
[{
  "severity": "high|moderate|low",
  "description": "string describing the specific interaction between medications",
  "recommendation": "string describing recommended actions",
  "mechanism": "string explaining how the interaction occurs"
}]`
            },
            {
              role: 'user',
              content: `Analyze potential interactions between these medications: ${medications.join(', ')}`
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
        // Validate the structure of each interaction
        results = results.map(interaction => ({
          severity: interaction.severity || 'low',
          description: interaction.description || 'No detailed description available',
          recommendation: interaction.recommendation || 'Consult with your healthcare provider',
          mechanism: interaction.mechanism || 'Mechanism of interaction not specified'
        }));
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', data.choices[0].message.content);
        throw new Error('Failed to parse drug interaction results');
      }
      setInteractions(results);
    } catch (error) {
      console.error('Interaction check error:', error);
      setError('Failed to analyze drug interactions. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Drug Interaction Checker</h2>

        {/* Add Medications */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              placeholder="Enter medication name..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addMedication()}
            />
            <button
              onClick={addMedication}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Medication List */}
          <div className="flex flex-wrap gap-2">
            {medications.map((med, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg"
              >
                <span>{med}</span>
                <button
                  onClick={() => removeMedication(index)}
                  className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Check Interactions Button */}
          <button
            onClick={checkInteractions}
            disabled={medications.length < 2 || isAnalyzing}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Interactions...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Check Interactions
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Interaction Results */}
        {interactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            {interactions.map((interaction, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  interaction.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : interaction.severity === 'moderate'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`w-5 h-5 ${
                    interaction.severity === 'high'
                      ? 'text-red-600'
                      : interaction.severity === 'moderate'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`} />
                  <h3 className="font-medium capitalize">
                    {interaction.severity} Risk Interaction
                  </h3>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-700">{interaction.description}</p>
                  <div className="bg-white bg-opacity-50 p-3 rounded">
                    <h4 className="font-medium text-gray-800 mb-1">Mechanism</h4>
                    <p className="text-gray-600">{interaction.mechanism}</p>
                  </div>
                  <div className="bg-white bg-opacity-50 p-3 rounded">
                    <h4 className="font-medium text-gray-800 mb-1">Recommendation</h4>
                    <p className="text-gray-600">{interaction.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                <p className="text-sm text-yellow-800">
                  This interaction check is for informational purposes only. Always consult with a healthcare provider or pharmacist about potential drug interactions.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}