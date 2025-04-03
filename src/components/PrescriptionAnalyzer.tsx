import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Clock, FileText, FileUp, Loader2, Pill, RefreshCw, ShieldAlert } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface AnalysisResult {
  medications: Array<{
    name: string;
    purpose: string;
    dosage: string;
    frequency: string;
    sideEffects: string[];
    warnings: string[];
  }>;
  generalInstructions: string;
  precautions: string[];
  nextSteps: string[];
}

export default function PrescriptionAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<'idle' | 'uploading' | 'extracting' | 'analyzing'>('idle');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setExtractedText('');
    setAnalysis(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  // Convert file to Base64 string
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

  const analyzePrescription = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingStep('uploading');
    setError(null);

    try {
      // Step 1: OCR Processing
      setProcessingStep('extracting');
      const base64 = await convertToBase64(file);
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

      // Assume the OCR response is a JSON object like:
      // { "status": true, "text": "extracted text...", ... }
      if (!ocrResponse.data || !ocrResponse.data.status || !ocrResponse.data.text) {
        throw new Error('OCR service returned an invalid response');
      }

      const ocrText = ocrResponse.data.text;
      setExtractedText(ocrText);

      // Step 2: Medical Analysis via LLM (using Groq API)
      setProcessingStep('analyzing');
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
              content: `You are a medical prescription analyzer with expertise in pharmacology. You must respond ONLY with a valid JSON object in this exact format, with no additional text or explanation. For any unknown fields, provide accurate information based on medical knowledge rather than returning "Unknown":
{
  "medications": [{
    "name": "string",
    "purpose": "string (describe the primary medical use)",
    "dosage": "string",
    "frequency": "string",
    "sideEffects": [
      "list common side effects with percentages if known",
      "include both common and serious side effects"
    ],
    "warnings": [
      "list important safety warnings",
      "include contraindications",
      "include drug interactions",
      "include special populations warnings"
    ]
  }],
  "generalInstructions": "string (general advice for taking these medications)",
  "precautions": ["list general precautions for this combination of medications"],
  "nextSteps": ["list recommended monitoring or follow-up steps"]
}`
            },
            {
              role: 'user',
              content: `Analyze this prescription text and provide comprehensive information about side effects and warnings for each medication: ${ocrText}`
            }
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.text();
        console.error('Groq API error response:', errorData);
        throw new Error('Failed to analyze prescription');
      }

      const analysisData = await analysisResponse.json();
      if (!analysisData.choices?.[0]?.message?.content) {
        throw new Error('Invalid analysis response from API');
      }

      let analysisResult;
      try {
        analysisResult = JSON.parse(analysisData.choices[0].message.content);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', analysisData.choices[0].message.content);
        throw new Error('Failed to parse prescription analysis response');
      }
      setAnalysis(analysisResult);
    } catch (error: any) {
      console.error('Prescription Analysis Error:', error.response ? error.response.data : error.message);
      setError('An error occurred while analyzing the prescription. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('idle');
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setExtractedText('');
    setAnalysis(null);
    setError(null);
    setProcessingStep('idle');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Prescription Analyzer</h2>
        </div>

        {/* File Upload Area */}
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            <FileUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {isDragActive
                ? 'Drop the prescription here'
                : 'Drag & drop a prescription image or PDF, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: PNG, JPG, PDF (max 10MB)
            </p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Prescription preview"
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

          {/* Processing Button */}
          {file && !isProcessing && !analysis && (
            <button
              onClick={analyzePrescription}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Pill className="w-5 h-5" />
              Analyze Prescription
            </button>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <div>
                  <p className="font-medium text-blue-800">
                    {processingStep === 'uploading' && 'Uploading prescription...'}
                    {processingStep === 'extracting' && 'Extracting text from prescription...'}
                    {processingStep === 'analyzing' && 'Analyzing prescription contents...'}
                  </p>
                  <p className="text-sm text-blue-600">Please wait while we process your prescription</p>
                </div>
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
              {/* Medications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  Medications
                </h3>
                {analysis.medications.map((med, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                    <h4 className="font-medium text-gray-900">{med.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Purpose:</p>
                        <p className="font-medium">{med.purpose}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dosage:</p>
                        <p className="font-medium">{med.dosage}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Frequency:</p>
                      <p className="font-medium">{med.frequency}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Potential Side Effects:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {med.sideEffects.map((effect, i) => (
                          <li key={i} className="text-sm text-yellow-700">{effect}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-2">Important Warnings:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {med.warnings.map((warning, i) => (
                          <li key={i} className="text-sm text-red-700">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* General Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5" />
                  General Instructions
                </h3>
                <p className="text-blue-700">{analysis.generalInstructions}</p>
              </div>

              {/* Precautions */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-800 flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-5 h-5" />
                  Precautions
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {analysis.precautions.map((precaution, index) => (
                    <li key={index} className="text-orange-700">{precaution}</li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5" />
                  Next Steps
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {analysis.nextSteps.map((step, index) => (
                    <li key={index} className="text-green-700">{step}</li>
                  ))}
                </ul>
              </div>

              {/* Medical Disclaimer */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                  <p className="text-sm text-gray-600">
                    This analysis is provided for informational purposes only and should not be considered as professional medical advice. Always consult with your healthcare provider to verify prescription details.
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
