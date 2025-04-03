import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Loader2, Scale } from 'lucide-react';
import { useState } from 'react';

interface BMIAnalysis {
  bmi: number;
  category: string;
  healthRisks: string[];
  recommendations: string[];
  lifestyle: {
    diet: string[];
    exercise: string[];
  };
}

export default function BMICalculator() {
  const [height, setHeight] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BMIAnalysis | null>(null);

  const calculateBMI = async () => {
    if (!height || !weight) return;

    setIsAnalyzing(true);
    const bmiValue = weight / ((height / 100) * (height / 100));

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
              content: `You are a health analysis assistant. Analyze BMI and provide detailed health recommendations. You must respond ONLY with a valid JSON object in this exact format, with no additional text or explanation:
{
  "bmi": number,
  "category": "string",
  "healthRisks": ["string"],
  "recommendations": ["string"],
  "lifestyle": {
    "diet": ["string"],
    "exercise": ["string"]
  }
}`
            },
            {
              role: 'user',
              content: `Analyze this BMI value: ${bmiValue.toFixed(1)}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      const data = await response.json();
      let result;
      try {
        result = JSON.parse(data.choices[0].message.content);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Failed to parse BMI analysis response');
      }
      setAnalysis(result);
    } catch (error) {
      console.error('BMI Analysis Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <Scale className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">BMI Calculator</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <input
                type="number"
                value={height || ''}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter height in centimeters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={weight || ''}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter weight in kilograms"
              />
            </div>
          </div>

          <button
            onClick={calculateBMI}
            disabled={!height || !weight || isAnalyzing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                Calculate BMI
              </>
            )}
          </button>

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Your BMI Analysis</h3>
                  <div className={`px-4 py-2 rounded-full ${
                    analysis.category.toLowerCase().includes('normal') 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {analysis.bmi.toFixed(1)}
                  </div>
                </div>

                <p className="text-lg font-medium text-gray-700 mb-4">
                  Category: {analysis.category}
                </p>

                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Health Risks</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.healthRisks.map((risk, index) => (
                        <li key={index} className="text-yellow-700">{risk}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-blue-700">{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Diet Suggestions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.lifestyle.diet.map((item, index) => (
                          <li key={index} className="text-green-700">{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2">Exercise Plan</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.lifestyle.exercise.map((item, index) => (
                          <li key={index} className="text-purple-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                  <p className="text-sm text-gray-600">
                    This BMI calculation and analysis is for informational purposes only. 
                    Please consult with a healthcare provider for professional medical advice.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}