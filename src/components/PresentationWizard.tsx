import { useState } from 'react';
import {
  X,
  Upload,
  ChevronDown,
  ChevronRight,
  Check,
  Info,
  ArrowRight,
  Loader2,
  Users,
  Target,
  Lightbulb,
  Route,
  Heart,
  Megaphone,
  LayoutGrid
} from 'lucide-react';

interface WizardStep {
  id: string;
  number: number;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
  disabled: boolean;
}

const initialSteps: WizardStep[] = [
  { id: 'upload', number: 1, title: 'File upload', icon: <Upload className="w-4 h-4" />, completed: false, active: true, disabled: false },
  { id: 'audience', number: 2, title: 'Audience summary', icon: <Users className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'challenges', number: 3, title: 'Challenges & opportunities', icon: <Target className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'bigidea', number: 4, title: 'The Big Idea™', icon: <Lightbulb className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'journey', number: 5, title: 'Audience Journey™', icon: <Route className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'receptiveness', number: 6, title: 'Receptiveness', icon: <Heart className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'cta', number: 7, title: 'Call to action', icon: <Megaphone className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'storyboard', number: 8, title: 'Storyboard structure', icon: <LayoutGrid className="w-4 h-4" />, completed: false, active: false, disabled: true },
];

interface StepItemProps {
  step: WizardStep;
  isExpanded: boolean;
  onToggle: () => void;
}

function StepItem({ step, isExpanded, onToggle }: StepItemProps) {
  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        disabled={step.disabled}
        className={`w-full flex items-center justify-between py-2 text-left transition-colors ${
          step.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              step.completed
                ? 'bg-emerald-500 text-white'
                : step.active
                ? 'bg-phantom-900 text-white'
                : 'bg-phantom-200 text-phantom-500'
            }`}
          >
            {step.completed ? <Check className="w-4 h-4" /> : step.number}
          </span>
          <span className={`text-sm ${step.active ? 'text-phantom-900 font-medium' : 'text-phantom-600'}`}>
            {step.title}
          </span>
        </div>
        {!step.disabled && (
          <ChevronDown
            className={`w-4 h-4 text-phantom-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        )}
      </button>
    </div>
  );
}

export function PresentationWizard({ onClose }: { onClose: () => void }) {
  const [steps, setSteps] = useState(initialSteps);
  const [expandedStep, setExpandedStep] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentStep = steps.find(s => s.active);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleStartWalk = () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setTimeout(() => {
      setSteps(prev => prev.map((step, idx) => {
        if (idx === 0) return { ...step, completed: true, active: false };
        if (idx === 1) return { ...step, active: true, disabled: false };
        return step;
      }));
      setExpandedStep('audience');
      setIsProcessing(false);
    }, 1500);
  };

  const goToNextStep = () => {
    const currentIdx = steps.findIndex(s => s.active);
    if (currentIdx < steps.length - 1) {
      setSteps(prev => prev.map((step, idx) => {
        if (idx === currentIdx) return { ...step, completed: true, active: false };
        if (idx === currentIdx + 1) return { ...step, active: true, disabled: false };
        return step;
      }));
      setExpandedStep(steps[currentIdx + 1].id);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Wizard Sidebar */}
      <aside className="w-64 border-r border-phantom-200 bg-white flex flex-col p-5 overflow-y-auto">
        <div className="mb-4">
          <span className="text-xs text-phantom-500 font-medium flex items-center gap-1">
            Write a presentation
            <Info className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-bold text-phantom-900">New project</span>
          <button
            onClick={onClose}
            className="p-1 text-phantom-400 hover:text-phantom-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-1">
          {steps.map((step) => (
            <StepItem
              key={step.id}
              step={step}
              isExpanded={expandedStep === step.id}
              onToggle={() => !step.disabled && setExpandedStep(step.id)}
            />
          ))}
        </nav>
      </aside>

      {/* Vertical Separator */}
      <div className="w-px bg-phantom-200" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-12">
            {/* Step 1: File Upload */}
            {currentStep?.id === 'upload' && (
              <article className="space-y-6">
                <header className="space-y-4">
                  <h1 className="text-4xl font-bold text-phantom-900">
                    Upload a PowerPoint or PDF
                  </h1>
                  <div className="text-phantom-600 space-y-4">
                    <p>Our AI will read all the text on each slide/page of your file, except what is on hidden slides.</p>
                    <div>
                      <p className="font-semibold text-phantom-900">Prepare your file before you begin:</p>
                      <ul className="list-disc list-outside pl-4 mt-2 space-y-1">
                        <li>Combine multiple files into one file. A working doc or draft works best.</li>
                        <li>Remove content you don't want included, including any unwanted text in the notes.</li>
                        <li>Keep the file under 100MB total and include 2-60 slides/pages.</li>
                        <li>Remove videos and overlapping text, usually from animations.</li>
                      </ul>
                    </div>
                  </div>
                </header>

                <hr className="border-phantom-200" />

                {/* Upload Button */}
                <div className="pt-4">
                  <input
                    id="upload-file"
                    type="file"
                    accept=".pptx,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="upload-file"
                    className="flex items-center justify-between px-4 py-3 bg-phantom-900 text-white rounded-lg cursor-pointer hover:bg-phantom-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span className="font-medium">
                        {uploadedFile ? uploadedFile.name : 'Upload Deck'}
                      </span>
                    </div>
                    <span className="text-xs text-phantom-400">PPTX/PDF</span>
                  </label>
                </div>
              </article>
            )}

            {/* Step 2: Audience Summary */}
            {currentStep?.id === 'audience' && (
              <article className="space-y-6">
                <header className="space-y-4">
                  <h1 className="text-4xl font-bold text-phantom-900">
                    Define your audience
                  </h1>
                  <p className="text-phantom-600">
                    Who will be receiving this presentation? Understanding your audience helps us tailor the content.
                  </p>
                </header>

                <hr className="border-phantom-200" />

                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-phantom-900 mb-2">
                      Primary audience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., C-suite executives, investors, sales team"
                      className="w-full px-4 py-3 border border-phantom-200 rounded-lg focus:outline-none focus:border-violet-400 text-phantom-900 placeholder-phantom-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-phantom-900 mb-2">
                      What do they care about?
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g., ROI, efficiency gains, competitive advantage"
                      className="w-full px-4 py-3 border border-phantom-200 rounded-lg focus:outline-none focus:border-violet-400 text-phantom-900 placeholder-phantom-400 resize-none"
                    />
                  </div>
                </div>
              </article>
            )}

            {/* Step 3: Challenges & Opportunities */}
            {currentStep?.id === 'challenges' && (
              <article className="space-y-6">
                <header className="space-y-4">
                  <h1 className="text-4xl font-bold text-phantom-900">
                    Challenges & opportunities
                  </h1>
                  <p className="text-phantom-600">
                    What problems does your audience face? What opportunities can you help them seize?
                  </p>
                </header>

                <hr className="border-phantom-200" />

                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-phantom-900 mb-2">
                      Key challenges
                    </label>
                    <textarea
                      rows={4}
                      placeholder="List the main challenges your audience faces..."
                      className="w-full px-4 py-3 border border-phantom-200 rounded-lg focus:outline-none focus:border-violet-400 text-phantom-900 placeholder-phantom-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-phantom-900 mb-2">
                      Opportunities
                    </label>
                    <textarea
                      rows={4}
                      placeholder="What opportunities can you help them capture..."
                      className="w-full px-4 py-3 border border-phantom-200 rounded-lg focus:outline-none focus:border-violet-400 text-phantom-900 placeholder-phantom-400 resize-none"
                    />
                  </div>
                </div>
              </article>
            )}

            {/* Step 4: The Big Idea */}
            {currentStep?.id === 'bigidea' && (
              <article className="space-y-6">
                <header className="space-y-4">
                  <h1 className="text-4xl font-bold text-phantom-900">
                    The Big Idea™
                  </h1>
                  <p className="text-phantom-600">
                    What's the one thing you want your audience to remember? This is your core message.
                  </p>
                </header>

                <hr className="border-phantom-200" />

                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-phantom-900 mb-2">
                      Your Big Idea
                    </label>
                    <textarea
                      rows={4}
                      placeholder="In one sentence, what is the transformative idea you want to share?"
                      className="w-full px-4 py-3 border border-phantom-200 rounded-lg focus:outline-none focus:border-violet-400 text-phantom-900 placeholder-phantom-400 resize-none"
                    />
                  </div>
                </div>
              </article>
            )}

            {/* Generic step placeholder for remaining steps */}
            {['journey', 'receptiveness', 'cta', 'storyboard'].includes(currentStep?.id || '') && (
              <article className="space-y-6">
                <header className="space-y-4">
                  <h1 className="text-4xl font-bold text-phantom-900">
                    {currentStep?.title}
                  </h1>
                  <p className="text-phantom-600">
                    Complete this step to continue building your presentation.
                  </p>
                </header>

                <hr className="border-phantom-200" />

                <div className="pt-4">
                  <textarea
                    rows={6}
                    placeholder="Enter your content here..."
                    className="w-full px-4 py-3 border border-phantom-200 rounded-lg focus:outline-none focus:border-violet-400 text-phantom-900 placeholder-phantom-400 resize-none"
                  />
                </div>
              </article>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-phantom-200 bg-white/75 backdrop-blur-sm px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-end gap-4">
            {currentStep?.id === 'upload' ? (
              <button
                onClick={handleStartWalk}
                disabled={!uploadedFile || isProcessing}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  uploadedFile && !isProcessing
                    ? 'bg-phantom-100 text-phantom-900 hover:bg-phantom-200'
                    : 'bg-phantom-100 text-phantom-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Start Empathy Walk™
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goToNextStep}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-phantom-900 text-white font-medium hover:bg-phantom-800 transition-colors"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
