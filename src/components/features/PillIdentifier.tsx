import React, { useState, useRef } from 'react';
import { Upload, Loader2, AlertTriangle, Pill, RefreshCw, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface PillIdentification {
  name: string;
  imprint: string;
  color: string;
  shape: string;
  type: string;
  manufacturer: string;
  description: string;
  warnings: string[];
}

export default function PillIdentifier() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PillIdentification | null>(null);
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
      setResult(null);
      setError(null);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const identifyPill = async () => {
    if (!image) return;

    setIsProcessing(true);
    setError(null);

    try {
      // First, extract text/features from the image
      const base64 = await convertToBase64(image);
      const encodedParams = new URLSearchParams();
      encodedParams.set('base64', base64);

      const ocrResponse = await axios.post(
        'https://ocr-extract-text.p.rapidapi.com/ocr',
        encodedParams,
        {
          headers: {
            'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'ocr-extract-text.p.rapidapi.com',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (!ocrResponse.data || !ocrResponse.data.text) {
        throw new Error('OCR service returned invalid response');
      }

      // Then, analyze the extracted text using LLM
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
              content: `You are a pill identification expert. You must respond ONLY with a valid JSON object in this exact format, with no additional text or explanation:
{
  "name": "string",
  "imprint": "string",
  "color": "string",
  "shape": "string",
  "type": "string",
  "manufacturer": "string",
  "description": "string",
  "warnings": ["string"]
}`
            },
            {
              role: 'user',
              content: `Identify this pill based on the following features: ${ocrResponse.data.text}`
            }
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze pill image');
      }

      const analysisData = await analysisResponse.json();
      if (!analysisData.choices?.[0]?.message?.content) {
        throw new Error('Invalid analysis response');
      }

      let pillInfo;
      try {
        pillInfo = JSON.parse(analysisData.choices[0].message.content);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', analysisData.choices[0].message.content);
        throw new Error('Failed to parse pill identification response');
      }
      setResult(pillInfo);
    } catch (error) {
      console.error('Pill Identification Error:', error);
      setError('Failed to identify the pill. Please ensure the image is clear and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetIdentification = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
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
            <Pill className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Pill Identifier</h2>
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
              Upload a clear image of the pill
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
                alt="Pill preview"
                className="max-h-96 mx-auto rounded-lg shadow-md"
              />
              <button
                onClick={resetIdentification}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Identify Button */}
          {image && !isProcessing && !result && (
            <button
              onClick={identifyPill}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Identify Pill
            </button>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <p className="text-blue-800">Processing image and identifying pill...</p>
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

          {/* Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">{result.name}</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Imprint</p>
                        <p className="font-medium">{result.imprint}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Color & Shape</p>
                        <p className="font-medium">{result.color} {result.shape}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="font-medium">{result.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Manufacturer</p>
                        <p className="font-medium">{result.manufacturer}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                    <p className="text-gray-600">{result.description}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Important Warnings</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {result.warnings.map((warning, index) => (
                        <li key={index} className="text-red-700">{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                  <p className="text-sm text-yellow-800">
                    This identification is provided for informational purposes only. Always verify medication identity with a healthcare professional or pharmacist.
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