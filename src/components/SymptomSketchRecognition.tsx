import axios from 'axios';
import { AlertCircle, Brush, Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SymptomSketchRecognition: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [sketchPoints, setSketchPoints] = useState<{ x: number; y: number }[]>([]);

  // Initialize canvas with human body outline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 600;

    // Draw a simple human body outline (placeholder; replace with an image)
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Head
    ctx.arc(200, 50, 30, 0, Math.PI * 2); // Head
    // Torso
    ctx.moveTo(200, 80);
    ctx.lineTo(200, 250);
    // Arms
    ctx.moveTo(200, 100);
    ctx.lineTo(150, 200); // Left arm
    ctx.moveTo(200, 100);
    ctx.lineTo(250, 200); // Right arm
    // Legs
    ctx.moveTo(200, 250);
    ctx.lineTo(170, 400); // Left leg
    ctx.moveTo(200, 250);
    ctx.lineTo(230, 400); // Right leg
    ctx.stroke();

    // Optional: Load a human body image instead
    // const img = new Image();
    // img.src = '/path/to/human-body-outline.png'; // Provide your own image
    // img.onload = () => ctx.drawImage(img, 0, 0, 400, 600);
  }, []);

  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setSketchPoints([{ x, y }]);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 5;
    }
  };

  // Draw on canvas
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSketchPoints(prev => [...prev, { x, y }]);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  // Stop drawing
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Analyze sketch with Grok API
  const analyzeSketch = async () => {
    if (sketchPoints.length === 0) {
      toast.error('Please draw a symptom location first.');
      return;
    }

    setIsAnalyzing(true);
    setAiResponse('');

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    // Simplify sketch data for AI (e.g., average position)
    const avgX = sketchPoints.reduce((sum, p) => sum + p.x, 0) / sketchPoints.length;
    const avgY = sketchPoints.reduce((sum, p) => sum + p.y, 0) / sketchPoints.length;
    const description = `User drew a symptom at approximate coordinates (x: ${avgX.toFixed(0)}, y: ${avgY.toFixed(0)}) on a 400x600 human body outline (head at top, legs at bottom). Interpret the location and suggest possible conditions.`;

    try {
      const response = await axios.post(url, {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a medical AI. Analyze symptom locations on a human body and suggest possible conditions.' },
          { role: 'user', content: description }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
      });

      setAiResponse(response.data.choices[0].message.content);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Grok API Error:', error);
      setAiResponse('Error analyzing sketch. Please try again.');
      toast.error('Failed to analyze sketch.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Redraw the human outline
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(200, 50, 30, 0, Math.PI * 2); // Head
      ctx.moveTo(200, 80);
      ctx.lineTo(200, 250); // Torso
      ctx.moveTo(200, 100);
      ctx.lineTo(150, 200); // Left arm
      ctx.moveTo(200, 100);
      ctx.lineTo(250, 200); // Right arm
      ctx.moveTo(200, 250);
      ctx.lineTo(170, 400); // Left leg
      ctx.moveTo(200, 250);
      ctx.lineTo(230, 400); // Right leg
      ctx.stroke();
    }
    setSketchPoints([]);
    setAiResponse('');
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-xl border border-blue-100 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
        <Brush className="w-6 h-6" /> Symptom Sketch Recognition
      </h2>

      {/* Canvas for Drawing */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          className="border border-gray-300 rounded-lg bg-white"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={analyzeSketch}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isAnalyzing
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brush className="w-5 h-5" />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Sketch'}
        </button>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* AI Response */}
      {aiResponse && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg w-full">
          <h3 className="text-lg font-medium text-blue-800">AI Analysis</h3>
          <p className="text-sm text-blue-700 mt-2">{aiResponse}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2 w-full">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Draw on the body to mark where you feel pain or symptoms. Click "Analyze Sketch" to get AI insights. Clear to start over.
        </p>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default SymptomSketchRecognition;