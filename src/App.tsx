import { Activity, AlertCircle, AlertTriangle, Bone, Book, Brain, Brush, ChevronDown, FileText, Heart, LayoutDashboard, MessageCircle, Mic, Microscope, Pill, HeartPulse as Pulse, Scale, Scan, Search, Shield, Stethoscope, Syringe } from 'lucide-react';
import React, { useState } from 'react';
import BoneFractureAnalysis from './components/BoneFractureAnalysis';
import BrainTumorAnalysis from './components/BrainTumorAnalysis';
import EmergencySOS from './components/EmergencySOS';
import BMICalculator from './components/features/BMICalculator';
import DrugDirectory from './components/features/DrugDirectory';
import DrugInteractionChecker from './components/features/DrugInteractionChecker';
import MedicalJournals from './components/features/MedicalJournals';
import PillIdentifier from './components/features/PillIdentifier';
import SkinDiseaseAnalyzer from './components/features/SkinDiseaseAnalyzer';
import HealthDashboard from './components/HealthDashboard';
import MedicalChat from './components/MedicalChat';
import PrescriptionAnalyzer from './components/PrescriptionAnalyzer';
import SpeechChat from './components/SpeechChat';
import SymptomChecker from './components/SymptomChecker';
import SymptomSketchRecognition from './components/SymptomSketchRecognition'; // Added missing import

type TabType = 
  | 'dashboard'
  | 'symptoms'
  | 'chat'
  | 'speech-chat' 
  | 'brain-tumor'
  | 'bone-fracture'
  | 'prescription'
  | 'emergency-sos'
  | 'drug-directory'
  | 'pill-identifier'
  | 'drug-interactions'
  | 'bmi-calculator'
  | 'skin-disease'
  | 'medical-journals'
  | 'symptom-sketch';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  category: 'main' | 'diagnostic' | 'medication' | 'health' | 'emergency';
}

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [openCategory, setOpenCategory] = useState<string | null>('main');

  const navItems: NavItem[] = [
    // Main Features
    { id: 'dashboard', label: 'Health Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, category: 'main' },
    { id: 'chat', label: 'Medical Chat', icon: <MessageCircle className="w-5 h-5" />, category: 'main' },
    { id: 'speech-chat', label: 'Speech Chat', icon: <Mic className="w-5 h-5" />, category: 'main' },
    { id: 'symptoms', label: 'Symptom Checker', icon: <Activity className="w-5 h-5" />, category: 'main' },
    
    // Diagnostic Tools
    { id: 'brain-tumor', label: 'Brain Tumor Analysis', icon: <Brain className="w-5 h-5" />, category: 'diagnostic' },
    { id: 'bone-fracture', label: 'Bone Fracture Analysis', icon: <Bone className="w-5 h-5" />, category: 'diagnostic' },
    { id: 'skin-disease', label: 'Skin Disease Analyzer', icon: <Scan className="w-5 h-5" />, category: 'diagnostic' },
    { id: 'symptom-sketch', label: 'Symptom Sketch Recognition', icon: <Brush className="w-5 h-5" />, category: 'diagnostic' }, // Changed StickyNote to Brush for consistency
    
    // Medication Management
    { id: 'prescription', label: 'Prescription Analyzer', icon: <FileText className="w-5 h-5" />, category: 'medication' },
    { id: 'drug-directory', label: 'Drug Directory', icon: <Search className="w-5 h-5" />, category: 'medication' },
    { id: 'pill-identifier', label: 'Pill Identifier', icon: <Pill className="w-5 h-5" />, category: 'medication' },
    { id: 'drug-interactions', label: 'Drug Interactions', icon: <AlertCircle className="w-5 h-5" />, category: 'medication' },
    
    // Health Tools
    { id: 'bmi-calculator', label: 'BMI Calculator', icon: <Scale className="w-5 h-5" />, category: 'health' },
    { id: 'medical-journals', label: 'Medical Journals', icon: <Book className="w-5 h-5" />, category: 'health' },

    // Emergency Services
    { id: 'emergency-sos', label: 'Emergency SOS', icon: <AlertTriangle className="w-5 h-5" />, category: 'emergency' }, // Fixed category casing
  ];

  const categoryIcons = {
    main: <LayoutDashboard className="w-5 h-5 text-blue-600" />,
    diagnostic: <Microscope className="w-5 h-5 text-purple-600" />,
    medication: <Syringe className="w-5 h-5 text-green-600" />,
    health: <Heart className="w-5 h-5 text-red-600" />,
    emergency: <AlertTriangle className="w-5 h-5 text-red-600" />
  };

  const categoryLabels = {
    main: 'Main Features',
    diagnostic: 'Diagnostic Tools',
    medication: 'Medication Management',
    health: 'Health Tools',
    emergency: 'Emergency Services'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg shadow-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                  AI Medical Assistant
                </h1>
                <p className="text-sm text-gray-600">Your Intelligent Health Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Dropdown Menu */}
        <div className="flex flex-wrap gap-4 mb-8">
          {['main', 'diagnostic', 'medication', 'health', 'emergency'].map((category) => (
            <div key={category} className="relative">
              <button
                onClick={() => setOpenCategory(openCategory === category ? null : category)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  openCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50'
                }`}
              >
                {categoryIcons[category as keyof typeof categoryIcons]}
                <span className="font-medium">{categoryLabels[category as keyof typeof categoryLabels]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openCategory === category ? 'rotate-180' : ''}`} />
              </button>
              
              {openCategory === category && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                  {navItems
                    .filter(item => item.category === category)
                    .map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setOpenCategory(null);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 hover:bg-blue-50 transition-colors ${
                          activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {activeTab === 'dashboard' && <HealthDashboard />}
          {activeTab === 'symptoms' && <SymptomChecker />}
          {activeTab === 'chat' && <MedicalChat />}
          {activeTab === 'speech-chat' && <SpeechChat />}
          {activeTab === 'brain-tumor' && <BrainTumorAnalysis />}
          {activeTab === 'bone-fracture' && <BoneFractureAnalysis />}
          {activeTab === 'prescription' && <PrescriptionAnalyzer />}
          {activeTab === 'drug-directory' && <DrugDirectory />}
          {activeTab === 'pill-identifier' && <PillIdentifier />}
          {activeTab === 'drug-interactions' && <DrugInteractionChecker />}
          {activeTab === 'bmi-calculator' && <BMICalculator />}
          {activeTab === 'skin-disease' && <SkinDiseaseAnalyzer />}
          {activeTab === 'medical-journals' && <MedicalJournals />}
          {activeTab === 'emergency-sos' && <EmergencySOS />}
          {activeTab === 'symptom-sketch' && <SymptomSketchRecognition />}
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold text-blue-800">Medical Disclaimer</p>
            <p className="text-sm text-blue-700">
              This application provides general information and is not a substitute for professional medical advice. 
              Always consult with qualified healthcare providers for diagnosis and treatment. 
              In case of emergency, call your local emergency services immediately.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-blue-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
                <Pulse className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-600">Powered by Advanced Medical AI</span>
            </div>
            <p className="text-center text-gray-600">
              © {new Date().getFullYear()} MediPredict AI✨. All rights reserved and owned by Preetam Tony J ❤️.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;