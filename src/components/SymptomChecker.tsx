import { Activity, AlertTriangle, Clock, MinusCircle, PlusCircle } from 'lucide-react';
import React, { useState } from 'react';

// Define interfaces for TypeScript
interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
}

interface Recommendations {
  immediate: string[];
  lifestyle: string[];
  monitoring: string[];
}

interface FollowUp {
  timeframe: string;
  actions: string[];
}

interface GeneralAdvice {
  precautions: string[];
  lifestyle: string[];
  warningSignsToWatch: string[];
}

interface PredictionResult {
  possibleConditions: Array<{
    condition: string;
    probability: number;
    description: string;
    recommendations: Recommendations;
    urgencyLevel: 'immediate' | 'urgent' | 'routine';
    followUp: FollowUp;
  }>;
  generalAdvice: GeneralAdvice;
  disclaimer: string;
}

export default function SymptomChecker() {
  // State for symptoms
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for patient profile parameters
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [diabetes, setDiabetes] = useState('');
  const [hypertension, setHypertension] = useState('');
  const [alcohol, setAlcohol] = useState('');
  const [smoking, setSmoking] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [pastMedicalHistory, setPastMedicalHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  // Helper function to extract JSON from response
  const extractJsonFromContent = (content: string): string => {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    return match && match[1] ? match[1].trim() : content.trim();
  };

  // Add a new symptom
  const addSymptom = () => {
    const newSymptom: Symptom = {
      id: crypto.randomUUID(),
      name: '',
      severity: 'mild',
      duration: ''
    };
    setSymptoms([...symptoms, newSymptom]);
  };

  // Remove a symptom
  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.length === 0) return;

    setIsLoading(true);

    try {
      // Construct patient profile text
      const patientProfileText = `Patient Profile:
- Age: ${age || 'Not provided'}
- Gender: ${gender || 'Not provided'}
- Diabetes: ${diabetes || 'Not provided'}
- Hypertension: ${hypertension || 'Not provided'}
- Alcohol Consumption: ${alcohol || 'Not provided'}
- Smoking: ${smoking || 'Not provided'}
- Current Medications: ${medications || 'None reported'}
- Known Allergies: ${allergies || 'None reported'}
- Past Medical History: ${pastMedicalHistory || 'None reported'}
- Family History: ${familyHistory || 'None reported'}`;

      // Format symptoms
      const symptomsText = symptoms
        .map(s => `- ${s.name} (Severity: ${s.severity}, Duration: ${s.duration})`)
        .join('\n');

      // API call to analyze symptoms with patient profile
      const analysisResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
              content: `You are a medical analysis assistant. Analyze the patient's symptoms in the context of their profile. Respond with a pure JSON object, no markdown, no extra text, in this exact format:
{
  "conditions": [
    {
      "name": "string",
      "confidence": "high|medium|low",
      "description": "string",
      "matchedSymptoms": ["string"],
      "recommendations": {
        "immediate": ["string"],
        "lifestyle": ["string"],
        "monitoring": ["string"]
      },
      "urgencyLevel": "immediate|urgent|routine",
      "followUp": {
        "timeframe": "string",
        "actions": ["string"]
      }
    }
  ],
  "generalAdvice": {
    "precautions": ["string"],
    "lifestyle": ["string"],
    "warningSignsToWatch": ["string"]
  }
}`
            },
            {
              role: 'user',
              content: `${patientProfileText}\n\nSymptoms:\n${symptomsText}\n\nProvide a detailed analysis.`
            }
          ],
          temperature: 0.3, // Lower temperature for stricter output
          max_tokens: 2048,
        }),
      });

      const analysisData = await analysisResponse.json();
      const analysisRawContent = analysisData.choices[0].message.content;
      const analysisJsonContent = extractJsonFromContent(analysisRawContent);
      let analysis;
      try {
        analysis = JSON.parse(analysisJsonContent);
      } catch (error) {
        console.error('JSON Parse Error:', error);
        console.error('Raw content:', analysisRawContent);
        throw new Error('Failed to parse API response');
      }

      // Map API response to prediction result
      setPrediction({
        possibleConditions: analysis.conditions.map((condition: any) => ({
          condition: condition.name,
          probability: condition.confidence === 'high' ? 0.8 : condition.confidence === 'medium' ? 0.5 : 0.2,
          description: condition.description,
          recommendations: condition.recommendations,
          urgencyLevel: condition.urgencyLevel,
          followUp: condition.followUp
        })),
        generalAdvice: analysis.generalAdvice,
        disclaimer: 'This is not a medical diagnosis. Consult a healthcare provider.'
      });
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 border border-blue-100">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Symptom Checker</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 35"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Diabetes</label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center">
                  <input type="radio" value="Yes" checked={diabetes === 'Yes'} onChange={() => setDiabetes('Yes')} />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" value="No" checked={diabetes === 'No'} onChange={() => setDiabetes('No')} />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hypertension</label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center">
                  <input type="radio" value="Yes" checked={hypertension === 'Yes'} onChange={() => setHypertension('Yes')} />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" value="No" checked={hypertension === 'No'} onChange={() => setHypertension('No')} />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Alcohol Consumption</label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center">
                  <input type="radio" value="Yes" checked={alcohol === 'Yes'} onChange={() => setAlcohol('Yes')} />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" value="No" checked={alcohol === 'No'} onChange={() => setAlcohol('No')} />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Smoking</label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center">
                  <input type="radio" value="Yes" checked={smoking === 'Yes'} onChange={() => setSmoking('Yes')} />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" value="No" checked={smoking === 'No'} onChange={() => setSmoking('No')} />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Medications</label>
            <textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Metformin, Lisinopril"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Known Allergies</label>
            <textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Penicillin, Peanuts"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Past Medical History</label>
            <textarea
              value={pastMedicalHistory}
              onChange={(e) => setPastMedicalHistory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Appendectomy in 2015"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Family Medical History</label>
            <textarea
              value={familyHistory}
              onChange={(e) => setFamilyHistory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Heart disease in father"
              rows={3}
            />
          </div>
        </div>

        {/* Symptoms Section */}
        {symptoms.map((symptom) => (
          <div key={symptom.id} className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <input
                  type="text"
                  placeholder="E.g., Headache, Fever"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={symptom.name}
                  onChange={(e) => {
                    const updated = symptoms.map(s =>
                      s.id === symptom.id ? { ...s, name: e.target.value } : s
                    );
                    setSymptoms(updated);
                  }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={symptom.severity}
                      onChange={(e) => {
                        const updated = symptoms.map(s =>
                          s.id === symptom.id ? { ...s, severity: e.target.value as Symptom['severity'] } : s
                        );
                        setSymptoms(updated);
                      }}
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      placeholder="E.g., 2 days"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={symptom.duration}
                      onChange={(e) => {
                        const updated = symptoms.map(s =>
                          s.id === symptom.id ? { ...s, duration: e.target.value } : s
                        );
                        setSymptoms(updated);
                      }}
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSymptom(symptom.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <MinusCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSymptom}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          Add Symptom
        </button>

        <button
          type="submit"
          disabled={isLoading || symptoms.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              Analyzing Symptoms...
            </>
          ) : (
            <>
              <Activity className="w-5 h-5" />
              Analyze Symptoms
            </>
          )}
        </button>
      </form>

      {/* Results Display */}
      {prediction && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">Analysis Results</h3>
          </div>

          {prediction.possibleConditions.map((condition, index) => (
            <div key={index} className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <h4 className="font-medium text-blue-900 text-lg">{condition.condition}</h4>
              <p className="text-blue-800">{condition.description}</p>
              {/* Expand this section to display recommendations, urgency, etc., as needed */}
            </div>
          ))}

          <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
            {prediction.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}