import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, RefreshCw, Scan, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface DiseaseAnalysis {
  condition: string;
  confidence: number;
  description: string;
  symptoms: string[];
  recommendations: string[];
  severity: 'mild' | 'moderate' | 'severe';
  seekMedicalAttention: boolean;
}

// Add these utility functions at the top of the file, after the imports
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithExponentialBackoff = async (
  fn: () => Promise<any>,
  retries = 3,
  baseDelay = 1000
) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.response?.status === 429) {
        const waitTime = baseDelay * Math.pow(2, i);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached');
};

export default function SkinDiseaseAnalyzer() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Return the full base64 string including the data:image prefix
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const analyzeSkin = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Image = await convertToBase64(image);
      
      // Create the form data
      const formData = new FormData();
      formData.append('image', image);

      // Prepare both request formats
      const formDataConfig = {
        method: 'POST',
        url: 'https://detect-skin-disease.p.rapidapi.com/facebody/analysis/detect-skin-disease',
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'detect-skin-disease.p.rapidapi.com',
        },
        data: formData
      };

      const base64Config = {
        method: 'POST',
        url: 'https://detect-skin-disease.p.rapidapi.com/facebody/analysis/detect-skin-disease',
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'detect-skin-disease.p.rapidapi.com',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: new URLSearchParams({
          'image_base64': base64Image.split(',')[1]
        })
      };

      // Try both request formats with retry logic
      let response;
      try {
        response = await retryWithExponentialBackoff(
          async () => await axios.request(formDataConfig),
          3
        );
      } catch (formDataError) {
        console.log("FormData approach failed, trying with base64 string");
        try {
          response = await retryWithExponentialBackoff(
            async () => await axios.request(base64Config),
            3
          );
        } catch (base64Error: any) {
          if (base64Error?.response?.status === 429) {
            throw new Error('API rate limit exceeded. Please try again in a few minutes.');
          }
          throw base64Error;
        }
      }

      // Get detailed analysis using LLM with retry logic
      const llmResponse = await retryWithExponentialBackoff(async () => {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                content: `You are a dermatological analysis assistant. You must respond ONLY with a valid JSON object in this exact format, with no additional text or explanation:
{
  "condition": "string",
  "confidence": number,
  "description": "string",
  "symptoms": ["string"],
  "recommendations": ["string"],
  "severity": "mild|moderate|severe",
  "seekMedicalAttention": boolean
}`
              },
              {
                role: 'user',
                content: `Based on this skin analysis: ${JSON.stringify(response.data)}, provide detailed information about the condition.`
              }
            ],
            temperature: 0.3,
            max_tokens: 2048,
          }),
        });
        return res;
      });

      const llmData = await llmResponse.json();
      let analysisResult;
      try {
        analysisResult = JSON.parse(llmData.choices[0].message.content);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', llmData.choices[0].message.content);
        throw new Error('Failed to parse skin analysis response');
      }
      setAnalysis(analysisResult);
    } catch (error: any) {
      console.error('Skin Analysis Error:', error);
      let errorMessage = 'Failed to analyze the skin condition. ';
      
      if (error.message.includes('rate limit')) {
        errorMessage += 'The service is temporarily busy. Please wait a few minutes and try again.';
      } else if (error.response?.status === 413) {
        errorMessage += 'The image file is too large. Please use an image smaller than 10MB.';
      } else if (error.response?.status === 415) {
        errorMessage += 'Invalid image format. Please use a JPG or PNG image.';
      } else if (error.response?.status === 400) {
        errorMessage += 'The image could not be processed. Please ensure it clearly shows the affected area.';
      } else {
        errorMessage += 'Please ensure the image is clear and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setPreview(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Scan className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Skin Disease Analyzer</h2>
        </div>

        <div className="space-y-6">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Upload a clear image of the affected skin area
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: PNG, JPG (max 10MB)
            </p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Skin condition preview"
                className="max-h-96 mx-auto rounded-lg shadow-md"
              />
              <button
                onClick={resetAnalysis}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Analyze Button */}
          {image && !isAnalyzing && !analysis && (
            <button
              onClick={analyzeSkin}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Scan className="w-5 h-5" />
              Analyze Skin Condition
            </button>
          )}

          {/* Processing State */}
          {isAnalyzing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <p className="text-blue-800">Analyzing skin condition...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{analysis.condition}</h3>
                  <div className={`px-4 py-2 rounded-full ${
                    analysis.severity === 'mild' ? 'bg-green-100 text-green-800' :
                    analysis.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysis.confidence.toFixed(1)}% Confidence
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{analysis.description}</p>

                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Common Symptoms</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.symptoms.map((symptom, index) => (
                        <li key={index} className="text-yellow-700">{symptom}</li>
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

                  {analysis.seekMedicalAttention && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <p className="font-medium text-red-800">
                          Please seek medical attention for proper diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                  <p className="text-sm text-gray-600">
                    This analysis is provided for informational purposes only and should not be considered as a medical diagnosis. 
                    Always consult with a healthcare provider or dermatologist for proper evaluation and treatment.
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