import { useState } from 'react';
import {
  FileText,
  Sparkles,
  LayoutGrid,
  Download,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Loader2,
  X,
  Ghost,
  GripVertical,
  Plus,
  Trash2
} from 'lucide-react';

type Step = 'input' | 'analyze' | 'structure' | 'export';

interface StepIndicatorProps {
  step: Step;
  label: string;
  number: number;
  currentStep: number;
  icon: React.ReactNode;
}

// Pitch deck framework structure
interface SlideSection {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  slides: { id: string; name: string; enabled: boolean }[];
}

const defaultFramework: SlideSection[] = [
  {
    id: 'intro',
    name: 'INTRO',
    color: 'text-gray-900',
    bgColor: 'bg-yellow-400',
    borderColor: 'border-yellow-500',
    slides: [
      { id: 'hi', name: 'Hi', enabled: true },
      { id: 'aperitif', name: 'Aperitif', enabled: true },
      { id: 'team', name: 'Team', enabled: true },
      { id: 'box', name: 'Box', enabled: true },
    ]
  },
  {
    id: 'problem-solution',
    name: 'PROBLEM / SOLUTION',
    color: 'text-white',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-600',
    slides: [
      { id: 'orientation', name: 'Orientation', enabled: true },
      { id: 'problem', name: 'Problem', enabled: true },
      { id: 'solution', name: 'Solution', enabled: true },
      { id: 'product', name: 'Product', enabled: true },
      { id: 'features', name: 'Features', enabled: true },
      { id: 'demo', name: 'Demo', enabled: false },
      { id: 'technology', name: 'Technology', enabled: true },
      { id: 'tech-moat', name: 'Tech Moat', enabled: false },
      { id: 'use-case', name: 'Use Case', enabled: true },
      { id: 'roadmap', name: 'Roadmap', enabled: true },
    ]
  },
  {
    id: 'business',
    name: 'BUSINESS',
    color: 'text-white',
    bgColor: 'bg-teal-600',
    borderColor: 'border-teal-700',
    slides: [
      { id: 'business-status', name: 'Business Status', enabled: true },
      { id: 'market', name: 'Market', enabled: true },
      { id: 'gtm', name: 'GTM', enabled: true },
      { id: 'business-model', name: 'Business Model', enabled: true },
      { id: 'unit-economic', name: 'Unit Economic', enabled: false },
      { id: 'competition', name: 'Competition', enabled: true },
      { id: 'growth', name: 'Growth', enabled: true },
      { id: 'profitability', name: 'Profitability', enabled: false },
      { id: 'growth-engines', name: 'Growth Engines', enabled: false },
      { id: 'financial-forecast', name: 'Financial Forecast', enabled: true },
    ]
  },
  {
    id: 'close',
    name: 'CLOSE',
    color: 'text-gray-900',
    bgColor: 'bg-pink-300',
    borderColor: 'border-pink-400',
    slides: [
      { id: 'traction', name: 'Traction', enabled: true },
      { id: 'killer-slide', name: 'Killer Slide', enabled: true },
      { id: 'ask', name: 'Ask', enabled: true },
      { id: 'bye', name: 'Bye', enabled: true },
    ]
  }
];

function StepIndicator({ step: _step, label, number, currentStep, icon }: StepIndicatorProps) {
  const isActive = number === currentStep;
  const isComplete = number < currentStep;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
          isComplete
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : isActive
            ? 'bg-violet-500 text-white'
            : 'bg-phantom-800 text-phantom-500 border border-white/5'
        }`}
      >
        {isComplete ? <CheckCircle2 className="w-5 h-5" /> : icon}
      </div>
      <div className={`hidden md:block ${isActive ? 'text-white' : 'text-phantom-500'}`}>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

interface SlideChipProps {
  name: string;
  enabled: boolean;
  onToggle: () => void;
}

function SlideChip({ name, enabled, onToggle }: SlideChipProps) {
  return (
    <button
      onClick={onToggle}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
        enabled
          ? 'bg-white text-gray-800 border-gray-200 shadow-sm'
          : 'bg-white/20 text-white/50 border-white/10'
      }`}
    >
      {name}
    </button>
  );
}

export function TranscriptFlow({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [framework, setFramework] = useState<SlideSection[]>(defaultFramework);

  const handleAnalyze = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setKeyPoints([
        'AI-powered productivity platform for enterprise teams',
        'Problem: Teams waste 30% of time on repetitive tasks',
        'Solution: Automated workflows with natural language commands',
        '$2.5M ARR with 150% YoY growth',
        'Target market: $45B enterprise productivity software',
        'Seeking $8M Series A for go-to-market expansion',
        'Team: Ex-Google, Stripe, Notion leadership',
        'Key differentiator: 10x faster deployment than competitors'
      ]);
      setIsProcessing(false);
      setCurrentStep(2);
    }, 2000);
  };

  const handleStructure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(3);
    }, 2000);
  };

  const handleExport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(4);
    }, 1500);
  };

  const toggleSlide = (sectionId: string, slideId: string) => {
    setFramework(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          slides: section.slides.map(slide => {
            if (slide.id === slideId) {
              return { ...slide, enabled: !slide.enabled };
            }
            return slide;
          })
        };
      }
      return section;
    }));
  };

  const enabledSlideCount = framework.reduce(
    (acc, section) => acc + section.slides.filter(s => s.enabled).length,
    0
  );

  return (
    <div className="fixed inset-0 bg-phantom-950/95 z-50 flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
            <Ghost className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold">Transcript to Deck</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-phantom-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <StepIndicator
            step="input"
            label="Input Transcript"
            number={1}
            currentStep={currentStep}
            icon={<FileText className="w-5 h-5" />}
          />
          <div className="flex-1 h-px bg-white/5 mx-4" />
          <StepIndicator
            step="analyze"
            label="Extract Insights"
            number={2}
            currentStep={currentStep}
            icon={<Sparkles className="w-5 h-5" />}
          />
          <div className="flex-1 h-px bg-white/5 mx-4" />
          <StepIndicator
            step="structure"
            label="Build Structure"
            number={3}
            currentStep={currentStep}
            icon={<LayoutGrid className="w-5 h-5" />}
          />
          <div className="flex-1 h-px bg-white/5 mx-4" />
          <StepIndicator
            step="export"
            label="Export Deck"
            number={4}
            currentStep={currentStep}
            icon={<Download className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          {/* Step 1: Input */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Paste your meeting transcript
                </h2>
                <p className="text-phantom-400">
                  Our AI will analyze the conversation and extract key insights to build your pitch deck.
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your meeting transcript here... Include any notes about the client's product, market, traction, team, and fundraising goals."
                  className="w-full h-80 p-4 rounded-xl bg-phantom-900/50 border border-white/5 focus:border-violet-500/50 text-white placeholder-phantom-500 text-sm leading-relaxed resize-none focus:outline-none transition-colors"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-phantom-400 bg-phantom-800/50 hover:bg-phantom-800 rounded-lg transition-colors">
                    <Upload className="w-3 h-3" />
                    Upload file
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={!transcript.trim() || isProcessing}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    transcript.trim() && !isProcessing
                      ? 'bg-violet-500 text-white hover:bg-violet-600'
                      : 'bg-phantom-800 text-phantom-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Transcript
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Key Points */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Key insights extracted
                </h2>
                <p className="text-phantom-400">
                  Review and edit the key points we identified from your transcript.
                </p>
              </div>

              <div className="space-y-3">
                {keyPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl bg-phantom-900/50 border border-white/5 group"
                  >
                    <GripVertical className="w-4 h-4 text-phantom-600 cursor-grab" />
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...keyPoints];
                        newPoints[index] = e.target.value;
                        setKeyPoints(newPoints);
                      }}
                      className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => setKeyPoints(keyPoints.filter((_, i) => i !== index))}
                      className="p-1 text-phantom-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setKeyPoints([...keyPoints, ''])}
                  className="flex items-center gap-2 p-4 rounded-xl border border-dashed border-white/10 text-phantom-500 hover:text-white hover:border-white/20 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Add insight
                </button>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 px-4 py-2 text-phantom-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleStructure}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Building structure...
                    </>
                  ) : (
                    <>
                      Generate Structure
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Slide Structure */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Pitch deck structure
                  </h2>
                  <p className="text-phantom-400">
                    Toggle slides on/off to customize your deck. Selected: {enabledSlideCount} slides
                  </p>
                </div>
              </div>

              {/* Framework Visualization */}
              <div className="space-y-4">
                {framework.map((section) => (
                  <div
                    key={section.id}
                    className={`rounded-2xl ${section.bgColor} p-4 relative overflow-hidden`}
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
                  >
                    {/* Wavy edge effect */}
                    <div className="absolute inset-x-0 bottom-0 h-2 opacity-30">
                      <svg viewBox="0 0 1200 8" preserveAspectRatio="none" className="w-full h-full">
                        <path
                          d="M0,4 Q30,0 60,4 T120,4 T180,4 T240,4 T300,4 T360,4 T420,4 T480,4 T540,4 T600,4 T660,4 T720,4 T780,4 T840,4 T900,4 T960,4 T1020,4 T1080,4 T1140,4 T1200,4 L1200,8 L0,8 Z"
                          fill="currentColor"
                          className="text-black/20"
                        />
                      </svg>
                    </div>

                    <h3 className={`text-sm font-bold ${section.color} mb-3 tracking-wide`}>
                      {section.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {section.slides.map((slide) => (
                        <SlideChip
                          key={slide.id}
                          name={slide.name}
                          enabled={slide.enabled}
                          onToggle={() => toggleSlide(section.id, slide.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Leave a Mark branding */}
              <div className="flex justify-end">
                <div className="flex items-center gap-2 text-phantom-500 text-sm">
                  <div className="w-5 h-5 border-2 border-phantom-500 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-phantom-500 rounded-sm"></div>
                  </div>
                  <span className="font-semibold tracking-wide">LEAVE A MARK</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-4 py-2 text-phantom-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleExport}
                  disabled={isProcessing || enabledSlideCount === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating PPTX...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export {enabledSlideCount} slides
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Your pitch deck is ready!
                </h2>
                <p className="text-phantom-400">
                  {enabledSlideCount} slides generated and downloading now.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-phantom-800 text-white font-medium hover:bg-phantom-700 transition-colors"
                >
                  Back to Dashboard
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors">
                  <Download className="w-4 h-4" />
                  Download Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
