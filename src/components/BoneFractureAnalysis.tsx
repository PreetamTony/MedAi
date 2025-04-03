import React, { useState, useRef } from 'react';
import { Upload, Loader2, AlertTriangle, Bone, RefreshCw, FileText, Activity } from 'lucide-react';
import * as tmImage from '@teachablemachine/image';
import { motion } from 'framer-motion';

interface AnalysisResult {
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  recommendations: string[];
  urgencyLevel: 'high' | 'medium' | 'low';
  fractureType?: string;
  recoveryTime?: string;
  rehabilitationPlan?: string[];
  painManagement?: string[];
  doAndDont?: {
    do: string[];
    dont: string[];
  };
  exercisePlan?: {
    initial: string[];
    progressive: string[];
    advanced: string[];
  };
  nutritionGuidance?: string[];
  followUpSchedule?: string[];
  warningSignsToWatch?: string[];
}

export default function BoneFractureAnalysis() {
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [prediction, setPrediction] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MODEL_URL = "https://teachablemachine.withgoogle.com/models/mvaVjspeH/";

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

  const getAnalysis = async (hasFracture: boolean, fractureType: string) => {
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
              content: `You are a medical analysis assistant specializing in bone fractures. You must respond ONLY with a valid JSON object in this exact format, with no additional text or explanation:
{
  "symptoms": ["string"],
  "diagnosis": "string",
  "treatment": "string",
  "recommendations": ["string"],
  "urgencyLevel": "high|medium|low",
  "fractureType": "string",
  "recoveryTime": "string",
  "rehabilitationPlan": ["string"],
  "painManagement": ["string"],
  "doAndDont": {
    "do": ["string"],
    "dont": ["string"]
  },
  "exercisePlan": {
    "initial": ["string"],
    "progressive": ["string"],
    "advanced": ["string"]
  },
  "nutritionGuidance": ["string"],
  "followUpSchedule": ["string"],
  "warningSignsToWatch": ["string"]
}

For comminuted fractures:
- Include specific symptoms like severe pain, multiple bone fragments, significant swelling, and possible deformity
- Detail the severity and complexity of the fracture pattern
- Emphasize the importance of immediate medical attention
- Provide a longer rehabilitation timeline due to complexity
- Include specific precautions for movement and weight-bearing
- Detail the potential need for surgical intervention
- Specify post-surgical care if applicable
- Include specific nutritional needs for complex bone healing

For avulsion fractures:
- Include specific symptoms like localized pain and swelling
- Detail the mechanism of injury
- Provide comprehensive rehabilitation timeline
- Include specific exercises for each recovery phase
- List nutrition requirements for bone healing`
            },
            {
              role: 'user',
              content: `An X-ray scan shows ${fractureType} with ${confidence.toFixed(2)}% confidence. 
Provide a detailed analysis including:
1. Comprehensive diagnosis and immediate care needs specific to ${fractureType}
2. Detailed treatment plan and recovery timeline
3. Specific rehabilitation exercises and progression
4. Pain management strategies
5. Nutrition and lifestyle recommendations
6. Warning signs to watch for
7. Follow-up care schedule`
            }
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      const data = await response.json();
      let analysis;
      try {
        analysis = JSON.parse(data.choices[0].message.content);
        
        // Set appropriate urgency level for fractures
        if (fractureType.toLowerCase().includes('comminuted')) {
          // Comminuted fractures are typically more severe
          if (confidence > 80) {
            analysis.urgencyLevel = 'high';
          } else if (confidence > 50) {
            analysis.urgencyLevel = 'medium';
          }

          // Ensure comprehensive symptoms list for comminuted fractures
          const comminutedSymptoms = [
            "Severe pain at the fracture site",
            "Multiple bone fragments visible on X-ray",
            "Significant swelling and bruising",
            "Possible deformity of the affected area",
            "Limited or no movement capability",
            "Intense pain with any attempted movement",
            "Possible numbness or tingling"
          ];

          // Combine default and analysis symptoms
          const uniqueSymptoms = new Set([
            ...comminutedSymptoms,
            ...(analysis.symptoms || [])
          ]);
          analysis.symptoms = Array.from(uniqueSymptoms);

          // Critical recommendations for comminuted fractures
          const criticalRecommendations = [
            "Seek immediate emergency medical attention",
            "Do not attempt to move the affected area",
            "Keep the injury site completely immobilized",
            "Prepare for possible surgical intervention",
            "Follow orthopedic specialist's instructions strictly",
            "Attend all follow-up appointments without fail"
          ];
          analysis.recommendations = [
            ...criticalRecommendations,
            ...(analysis.recommendations || [])
          ];
        }

        // Default pain management if not provided
        if (!analysis.painManagement) {
          analysis.painManagement = [
            "Follow prescribed pain medication schedule strictly",
            "Use ice therapy for 15-20 minutes every 2-3 hours",
            "Elevate the affected area above heart level",
            "Practice relaxation techniques for pain management",
            "Monitor pain levels and report significant changes",
            "Take prescribed medications exactly as directed"
          ];
        }

        // Default nutrition guidance if not provided
        if (!analysis.nutritionGuidance) {
          analysis.nutritionGuidance = [
            "Increase calcium-rich foods intake",
            "Ensure adequate vitamin D consumption",
            "Boost protein intake for tissue repair",
            "Stay hydrated with 8-10 glasses of water daily",
            "Consider supplements as recommended by healthcare provider",
            "Eat anti-inflammatory foods to support healing"
          ];
        }

        // Default warning signs if not provided
        if (!analysis.warningSignsToWatch) {
          analysis.warningSignsToWatch = [
            "Severe or increasing pain despite medication",
            "Numbness or tingling in extremities",
            "Color changes in the affected area",
            "Fever or chills",
            "Signs of infection (redness, warmth, drainage)",
            "Loss of pulse or sensation below the injury site",
            "Significant increase in swelling"
          ];
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', data.choices[0].message.content);
        throw new Error('Failed to parse fracture analysis response');
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

      await getAnalysis(
        bestPrediction.className.toLowerCase().includes('fracture'),
        bestPrediction.className
      );
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
            <Bone className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Bone Fracture Analysis</h2>
        </div>

        <div className="space-y-6">
          {/* Model Status */}
          <div className={`p-4 rounded-lg ${model ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center gap-2">
              {modelLoading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : model ? (
                <Bone className="w-5 h-5 text-green-600" />
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
                      alt="Uploaded X-ray"
                      className="max-h-full rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">X-ray images (PNG, JPG)</p>
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
                    <Bone className="w-5 h-5" />
                    Analyze X-ray
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
                prediction.toLowerCase().includes('fracture') 
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}>
                <h3 className="text-lg font-semibold mb-2">Detection Results</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Detection:</span> {prediction}
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

                    {/* Fracture Type */}
                    {analysisResult.fractureType && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Fracture Type</h4>
                        <p className="text-gray-600">{analysisResult.fractureType}</p>
                      </div>
                    )}

                    {/* Symptoms */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Common Symptoms</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysisResult.symptoms.map((symptom, index) => (
                          <li key={index} className="text-gray-600">{symptom}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Treatment */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Treatment Plan</h4>
                      <p className="text-gray-600">{analysisResult.treatment}</p>
                    </div>

                    {/* Pain Management */}
                    {analysisResult.painManagement && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Pain Management</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {analysisResult.painManagement.map((item, index) => (
                            <li key={index} className="text-blue-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Do's and Don'ts */}
                    {analysisResult.doAndDont && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Do's</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {analysisResult.doAndDont.do.map((item, index) => (
                              <li key={index} className="text-green-700">{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-medium text-red-900 mb-2">Don'ts</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {analysisResult.doAndDont.dont.map((item, index) => (
                              <li key={index} className="text-red-700">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Exercise Plan */}
                    {analysisResult.exercisePlan && (
                      <div className="bg-purple-50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium text-purple-900">Exercise Progression Plan</h4>
                        <div>
                          <h5 className="text-sm font-medium text-purple-800 mb-2">Initial Phase</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {analysisResult.exercisePlan.initial.map((item, index) => (
                              <li key={index} className="text-purple-700">{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-purple-800 mb-2">Progressive Phase</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {analysisResult.exercisePlan.progressive.map((item, index) => (
                              <li key={index} className="text-purple-700">{item}</li>
                            ))}
                          </ul>
                        </div>
                      <div>
                          <h5 className="text-sm font-medium text-purple-800 mb-2">Advanced Phase</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {analysisResult.exercisePlan.advanced.map((item, index) => (
                              <li key={index} className="text-purple-700">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Nutrition Guidance */}
                    {analysisResult.nutritionGuidance && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2">Nutrition Guidelines</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {analysisResult.nutritionGuidance.map((item, index) => (
                            <li key={index} className="text-yellow-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warning Signs */}
                    {analysisResult.warningSignsToWatch && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-medium text-red-900 mb-2">Warning Signs to Watch</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {analysisResult.warningSignsToWatch.map((item, index) => (
                            <li key={index} className="text-red-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Follow-up Schedule */}
                    {analysisResult.followUpSchedule && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Follow-up Schedule</h4>
                      <ul className="list-disc list-inside space-y-1">
                          {analysisResult.followUpSchedule.map((item, index) => (
                            <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                    )}
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