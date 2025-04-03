import * as tmImage from '@teachablemachine/image';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Brain, Loader2, RefreshCw, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface AnalysisResult {
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  recommendations: string[];
  urgencyLevel: 'high' | 'medium' | 'low';
}

export default function BrainTumorAnalysis() {
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [prediction, setPrediction] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MODEL_URL = "https://teachablemachine.withgoogle.com/models/EsN4eHmMb/";

  const loadModel = async () => {
    try {
      setModelLoading(true);
      const loadedModel = await tmImage.load(
        MODEL_URL + "model.json",
        MODEL_URL + "metadata.json"
      );
      setModel(loadedModel);
      setModelLoading(false);
    } catch (error) {
      console.error('Error loading model:', error);
      setModelLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImage(imageURL);
      setPrediction('');
      setConfidence(0);
      setAnalysisResult(null);
    }
  };

  const getAnalysis = async (hasTumor: boolean) => {
    try {
      setIsAnalyzing(true);
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
              content: `You are a medical analysis assistant specializing in brain tumors. You must respond ONLY with a valid JSON object in this exact format, with no additional text or explanation:
{
  "symptoms": ["string"],
  "diagnosis": "string",
  "treatment": "string",
  "recommendations": ["string"],
  "urgencyLevel": "high|medium|low"
}

For positive tumor detections:
- If confidence > 80%, set urgencyLevel as "high"
- If confidence > 60%, set urgencyLevel as "medium"
- Otherwise, set urgencyLevel as "low"

Always include these common brain tumor symptoms plus any additional relevant ones:
- Headaches
- Vision problems
- Seizures
- Memory issues
- Balance problems
- Nausea and vomiting
- Changes in speech
- Difficulty concentrating`
            },
            {
              role: 'user',
              content: `A patient's MRI scan has been analyzed. Details:
- Detection Result: ${prediction}
- Confidence: ${confidence.toFixed(2)}%

${hasTumor ? 'The scan indicates presence of a tumor. ' : 'The scan shows no tumor. '}Provide a detailed analysis with appropriate urgency level based on the detection result and confidence score.`
            }
          ],
          temperature: 0.3, // Reduced temperature for more consistent responses
          max_tokens: 2048,
        }),
      });

      const data = await response.json();
      let analysis;
      try {
        analysis = JSON.parse(data.choices[0].message.content);
        
        // Force urgency level based on detection and confidence
        if (hasTumor || prediction.toLowerCase().includes('yes')) {
          if (confidence > 80) {
            analysis.urgencyLevel = 'high';
          } else if (confidence > 60) {
            analysis.urgencyLevel = 'medium';
          } else {
            analysis.urgencyLevel = 'medium'; // Set minimum urgency to medium for positive detections
          }

          // Ensure comprehensive symptoms list for positive cases
          const defaultSymptoms = [
            "Headaches",
            "Vision problems",
            "Seizures",
            "Memory issues",
            "Balance problems",
            "Nausea and vomiting",
            "Changes in speech",
            "Difficulty concentrating"
          ];

          // Combine default symptoms with any unique ones from the analysis
          const uniqueSymptoms = new Set([
            ...defaultSymptoms,
            ...(analysis.symptoms || [])
          ]);
          analysis.symptoms = Array.from(uniqueSymptoms);

          // Ensure recommendations include critical steps
          const criticalRecommendations = [
            "Immediate consultation with a neurologist",
            "Schedule follow-up MRI scan within 1-2 weeks",
            "Complete neurological examination",
            "Discuss treatment options with a neurosurgeon"
          ];
          analysis.recommendations = [
            ...criticalRecommendations,
            ...(analysis.recommendations || []).filter(rec => 
              !criticalRecommendations.some(critical => 
                rec.toLowerCase().includes(critical.toLowerCase())
              )
            )
          ];
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', data.choices[0].message.content);
        throw new Error('Failed to parse brain tumor analysis response');
      }
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Error getting analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const predict = async () => {
    if (!model || !image) return;
    
    try {
      setIsLoading(true);
      const imgElement = document.getElementById("uploaded-image") as HTMLImageElement;
      const predictions = await model.predict(imgElement);
      
      let bestPrediction = predictions.reduce((max, prediction) =>
        prediction.probability > max.probability ? prediction : max
      );

      setPrediction(bestPrediction.className);
      setConfidence(bestPrediction.probability * 100);

      // Get detailed analysis based on prediction
      await getAnalysis(bestPrediction.className.toLowerCase().includes('tumor'));
    } catch (error) {
      console.error('Error making prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setPrediction('');
    setConfidence(0);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    loadModel();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Brain Tumor Analysis</h2>
        </div>

        <div className="space-y-6">
          {/* Model Status */}
          <div className={`p-4 rounded-lg ${model ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center gap-2">
              {modelLoading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : model ? (
                <Brain className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              )}
              <span className="text-sm font-medium">
                {modelLoading ? 'Loading AI Model...' :
                 model ? 'AI Model Ready' : 'Loading Model Failed'}
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {image ? (
                    <img
                      id="uploaded-image"
                      src={image}
                      alt="Uploaded scan"
                      className="max-h-full rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">MRI scan images (PNG, JPG)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={predict}
                disabled={!model || !image || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Analyze Scan
                  </>
                )}
              </button>

              {image && (
                <button
                  onClick={resetAnalysis}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {(prediction || isAnalyzing) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Initial Detection Results */}
              <div className={`p-6 rounded-lg ${
                prediction.toLowerCase().includes('tumor') || prediction.toLowerCase().includes('yes')
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}>
                <h3 className="text-lg font-semibold mb-2">Detection Results</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Detection:</span> {
                      prediction.toLowerCase().includes('tumor') || prediction.toLowerCase().includes('yes')
                        ? 'Potential tumor detected'
                        : 'No tumor detected'
                    }
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Confidence:</span> {confidence.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Detailed Analysis */}
              {isAnalyzing ? (
                <div className="p-6 bg-white border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span>Generating detailed analysis...</span>
                  </div>
                </div>
              ) : analysisResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 bg-white border border-blue-100 rounded-lg space-y-4"
                >
                  <h3 className="text-lg font-semibold">Detailed Analysis</h3>
                  
                  <div className="space-y-4">
                    {/* Urgency Level */}
                    <div className={`p-3 rounded-lg ${
                      analysisResult.urgencyLevel === 'high' ? 'bg-red-50 text-red-700' :
                      analysisResult.urgencyLevel === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        <span className="font-medium capitalize">
                          {analysisResult.urgencyLevel} Urgency Level
                        </span>
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Common Symptoms</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysisResult.symptoms.map((symptom, index) => (
                          <li key={index} className="text-gray-600">{symptom}</li>
                        ))}
                      </ul>
                    </div>

                    

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysisResult.recommendations.map((rec, index) => (
                          <li key={index} className="text-gray-600">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    This analysis is provided by an AI system and should not be considered as a final diagnosis.
                    Always consult with a qualified healthcare professional for proper medical evaluation and treatment.
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