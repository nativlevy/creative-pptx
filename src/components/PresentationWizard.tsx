import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Upload,
  ChevronDown,
  ChevronRight,
  Check,
  Info,
  ArrowLeft,
  Loader2,
  Users,
  Target,
  Lightbulb,
  Route,
  Heart,
  Megaphone,
  LayoutGrid,
  Download,
  FileJson,
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface WizardStep {
  id: string;
  number: number;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
  disabled: boolean;
}

interface AudienceData {
  primaryAudience: string;
  audienceSize: 'small' | 'medium' | 'large' | 'enterprise' | '';
  industryFocus: string[];
  decisionMakers: string;
  knowledgeLevel: 'beginner' | 'intermediate' | 'expert' | 'mixed' | '';
  whatTheyCareAbout: string;
}

interface ChallengesData {
  challenges: { id: string; text: string; priority: 'high' | 'medium' | 'low' }[];
  opportunities: { id: string; text: string }[];
  currentSituation: string;
  desiredOutcome: string;
}

interface BigIdeaData {
  bigIdea: string;
  supportingPoints: string[];
  uniqueValue: string;
  proofPoints: string;
}

interface JourneyData {
  currentState: string;
  desiredState: string;
  emotionalJourney: 'skeptical' | 'neutral' | 'curious' | 'excited' | '';
  keyMilestones: string[];
  barriers: string;
}

interface ReceptivenessData {
  audienceOpenness: 'resistant' | 'cautious' | 'open' | 'eager' | '';
  potentialObjections: string[];
  trustFactors: string[];
  priorExposure: 'none' | 'some' | 'familiar' | 'expert' | '';
  emotionalTriggers: string;
}

interface CtaData {
  primaryCta: string;
  secondaryCta: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical' | '';
  nextSteps: string[];
  successMetrics: string;
}

interface StoryboardData {
  presentationStyle: 'formal' | 'conversational' | 'inspirational' | 'educational' | '';
  slideCount: '5-7' | '8-10' | '11-15' | '15+' | '';
  visualStyle: 'minimal' | 'data-heavy' | 'image-rich' | 'balanced' | '';
  keyVisuals: string;
  openingHook: string;
  closingStatement: string;
}

interface WizardFormData {
  projectName: string;
  uploadedFileName: string | null;
  audience: AudienceData;
  challenges: ChallengesData;
  bigIdea: BigIdeaData;
  journey: JourneyData;
  receptiveness: ReceptivenessData;
  cta: CtaData;
  storyboard: StoryboardData;
}

const initialFormData: WizardFormData = {
  projectName: '',
  uploadedFileName: null,
  audience: {
    primaryAudience: '',
    audienceSize: '',
    industryFocus: [],
    decisionMakers: '',
    knowledgeLevel: '',
    whatTheyCareAbout: ''
  },
  challenges: {
    challenges: [],
    opportunities: [],
    currentSituation: '',
    desiredOutcome: ''
  },
  bigIdea: {
    bigIdea: '',
    supportingPoints: ['', '', ''],
    uniqueValue: '',
    proofPoints: ''
  },
  journey: {
    currentState: '',
    desiredState: '',
    emotionalJourney: '',
    keyMilestones: ['', '', ''],
    barriers: ''
  },
  receptiveness: {
    audienceOpenness: '',
    potentialObjections: [],
    trustFactors: [],
    priorExposure: '',
    emotionalTriggers: ''
  },
  cta: {
    primaryCta: '',
    secondaryCta: '',
    urgencyLevel: '',
    nextSteps: [''],
    successMetrics: ''
  },
  storyboard: {
    presentationStyle: '',
    slideCount: '',
    visualStyle: '',
    keyVisuals: '',
    openingHook: '',
    closingStatement: ''
  }
};

const STORAGE_KEY = 'presentation-wizard-data';
const STORAGE_STEP_KEY = 'presentation-wizard-step';

// =============================================================================
// INITIAL STEPS
// =============================================================================

const createInitialSteps = (): WizardStep[] => [
  { id: 'upload', number: 1, title: 'Getting Started', icon: <Upload className="w-4 h-4" />, completed: false, active: true, disabled: false },
  { id: 'audience', number: 2, title: 'Audience Summary', icon: <Users className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'challenges', number: 3, title: 'Challenges & Opportunities', icon: <Target className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'bigidea', number: 4, title: 'The Big Idea', icon: <Lightbulb className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'journey', number: 5, title: 'Audience Journey', icon: <Route className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'receptiveness', number: 6, title: 'Receptiveness', icon: <Heart className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'cta', number: 7, title: 'Call to Action', icon: <Megaphone className="w-4 h-4" />, completed: false, active: false, disabled: true },
  { id: 'storyboard', number: 8, title: 'Storyboard Structure', icon: <LayoutGrid className="w-4 h-4" />, completed: false, active: false, disabled: true },
];

// =============================================================================
// UTILITY HOOKS
// =============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue];
}

// =============================================================================
// REUSABLE FORM COMPONENTS
// =============================================================================

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-phantom-800">{title}</h3>
      {children}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-phantom-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-phantom-900 placeholder-phantom-400 transition-all"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
  hint
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-phantom-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2.5 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-phantom-900 placeholder-phantom-400 resize-none transition-all"
      />
      {hint && <p className="mt-1 text-xs text-phantom-500">{hint}</p>}
    </div>
  );
}

function SelectInput<T extends string>({
  label,
  value,
  onChange,
  options,
  required
}: {
  label: string;
  value: T | '';
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-phantom-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-4 py-2.5 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-phantom-900 bg-white transition-all"
      >
        <option value="">Select an option...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function MultiSelectChips({
  label,
  selected,
  onChange,
  options,
  allowCustom = true
}: {
  label: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  options: string[];
  allowCustom?: boolean;
}) {
  const [customInput, setCustomInput] = useState('');

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const addCustom = () => {
    if (customInput.trim() && !selected.includes(customInput.trim())) {
      onChange([...selected, customInput.trim()]);
      setCustomInput('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-phantom-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => toggleOption(option)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selected.includes(option)
                ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                : 'bg-phantom-100 text-phantom-600 border-2 border-transparent hover:bg-phantom-200'
            }`}
          >
            {option}
          </button>
        ))}
        {selected.filter(s => !options.includes(s)).map(custom => (
          <button
            key={custom}
            type="button"
            onClick={() => toggleOption(custom)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-violet-100 text-violet-700 border-2 border-violet-300 flex items-center gap-1"
          >
            {custom}
            <X className="w-3 h-3" />
          </button>
        ))}
      </div>
      {allowCustom && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder="Add custom..."
            className="flex-1 px-3 py-1.5 text-sm border border-phantom-200 rounded-lg focus:outline-none focus:border-violet-500"
          />
          <button
            type="button"
            onClick={addCustom}
            className="px-3 py-1.5 bg-phantom-100 text-phantom-600 rounded-lg hover:bg-phantom-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function DynamicList({
  label,
  items,
  onChange,
  placeholder,
  minItems = 1
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  minItems?: number;
}) {
  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, '']);
  };

  const removeItem = (index: number) => {
    if (items.length > minItems) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-phantom-700 mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder || `Item ${index + 1}`}
              className="flex-1 px-4 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:border-violet-500 text-phantom-900"
            />
            {items.length > minItems && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-2 text-phantom-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
      >
        <Plus className="w-4 h-4" />
        Add another
      </button>
    </div>
  );
}

function PriorityList({
  label,
  items,
  onChange,
  placeholder
}: {
  label: string;
  items: { id: string; text: string; priority: 'high' | 'medium' | 'low' }[];
  onChange: (items: { id: string; text: string; priority: 'high' | 'medium' | 'low' }[]) => void;
  placeholder?: string;
}) {
  const addItem = () => {
    onChange([...items, { id: crypto.randomUUID(), text: '', priority: 'medium' }]);
  };

  const updateItem = (id: string, updates: Partial<{ text: string; priority: 'high' | 'medium' | 'low' }>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-amber-100 text-amber-700 border-amber-300',
    low: 'bg-green-100 text-green-700 border-green-300'
  };

  return (
    <div>
      <label className="block text-sm font-medium text-phantom-700 mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex gap-2 items-center">
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(item.id, { text: e.target.value })}
              placeholder={placeholder}
              className="flex-1 px-4 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:border-violet-500 text-phantom-900"
            />
            <select
              value={item.priority}
              onChange={(e) => updateItem(item.id, { priority: e.target.value as 'high' | 'medium' | 'low' })}
              className={`px-3 py-2 rounded-lg border text-sm font-medium ${priorityColors[item.priority]}`}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="p-2 text-phantom-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
      >
        <Plus className="w-4 h-4" />
        Add challenge
      </button>
    </div>
  );
}

function SimpleItemList({
  label,
  items,
  onChange,
  placeholder
}: {
  label: string;
  items: { id: string; text: string }[];
  onChange: (items: { id: string; text: string }[]) => void;
  placeholder?: string;
}) {
  const addItem = () => {
    onChange([...items, { id: crypto.randomUUID(), text: '' }]);
  };

  const updateItem = (id: string, text: string) => {
    onChange(items.map(item => item.id === id ? { ...item, text } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-phantom-700 mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex gap-2">
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(item.id, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:border-violet-500 text-phantom-900"
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="p-2 text-phantom-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
      >
        <Plus className="w-4 h-4" />
        Add opportunity
      </button>
    </div>
  );
}

// =============================================================================
// STEP ITEM COMPONENT
// =============================================================================

interface StepItemProps {
  step: WizardStep;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

function StepItem({ step, isExpanded, onToggle, onNavigate }: StepItemProps) {
  return (
    <div className="w-full">
      <button
        onClick={() => {
          if (!step.disabled) {
            if (step.completed || step.active) {
              onNavigate();
            }
            onToggle();
          }
        }}
        disabled={step.disabled}
        className={`w-full flex items-center justify-between py-2 text-left transition-colors ${
          step.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-phantom-50 rounded-lg px-2 -mx-2'
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

// =============================================================================
// STEP CONTENT COMPONENTS
// =============================================================================

interface StepContentProps<T> {
  data: T;
  onChange: (data: T) => void;
}

function UploadStep({
  data,
  onChange,
  onImportJson,
  onLoadSampleData
}: StepContentProps<{ projectName: string; uploadedFileName: string | null }> & {
  onImportJson: (data: WizardFormData) => void;
  onLoadSampleData: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({ ...data, uploadedFileName: file.name });
    }
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string) as WizardFormData;
          onImportJson(imported);
        } catch {
          alert('Invalid JSON file. Please upload a valid wizard export file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <article className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-phantom-900">
          Let's Create Your Presentation
        </h1>
        <p className="text-phantom-600">
          Welcome to the Leave a Mark storytelling wizard. We'll guide you through a series of questions
          to help craft a compelling presentation that resonates with your audience.
        </p>
      </header>

      <hr className="border-phantom-200" />

      <div className="space-y-6 pt-2">
        <TextInput
          label="Project Name"
          value={data.projectName}
          onChange={(value) => onChange({ ...data, projectName: value })}
          placeholder="e.g., Q4 Sales Pitch, Product Launch 2024"
          required
        />

        <FormSection title="Upload Reference Material (Optional)">
          <p className="text-sm text-phantom-500 mb-3">
            Upload an existing deck or document to help inform your presentation structure.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,.pdf,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-between w-full px-4 py-3 bg-phantom-100 text-phantom-700 rounded-lg hover:bg-phantom-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="font-medium">
                {data.uploadedFileName || 'Upload Reference File'}
              </span>
            </div>
            <span className="text-xs text-phantom-500">PPTX/PDF/DOCX</span>
          </button>
        </FormSection>

        <FormSection title="Import Previous Work">
          <p className="text-sm text-phantom-500 mb-3">
            Have a saved wizard export? Import it to continue where you left off.
          </p>
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json"
            onChange={handleJsonImport}
            className="hidden"
          />
          <div className="flex gap-3">
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-phantom-300 text-phantom-600 rounded-lg hover:border-violet-400 hover:text-violet-600 transition-colors"
            >
              <FileJson className="w-4 h-4" />
              <span className="font-medium">Import JSON</span>
            </button>
            <button
              onClick={onLoadSampleData}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200 text-violet-700 rounded-lg hover:from-violet-200 hover:to-purple-200 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Fill Sample Data</span>
            </button>
          </div>
        </FormSection>
      </div>
    </article>
  );
}

function AudienceStep({ data, onChange }: StepContentProps<AudienceData>) {
  return (
    <article className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-phantom-900">
          Define Your Audience
        </h1>
        <p className="text-phantom-600">
          Understanding who you're speaking to is the foundation of any great presentation.
          Let's get specific about your audience.
        </p>
      </header>

      <hr className="border-phantom-200" />

      <div className="space-y-6 pt-2">
        <TextInput
          label="Who is your primary audience?"
          value={data.primaryAudience}
          onChange={(value) => onChange({ ...data, primaryAudience: value })}
          placeholder="e.g., C-suite executives at Fortune 500 companies"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectInput
            label="Audience Size"
            value={data.audienceSize}
            onChange={(value) => onChange({ ...data, audienceSize: value })}
            options={[
              { value: 'small', label: '1-10 people' },
              { value: 'medium', label: '11-50 people' },
              { value: 'large', label: '51-200 people' },
              { value: 'enterprise', label: '200+ people' }
            ]}
          />

          <SelectInput
            label="Knowledge Level"
            value={data.knowledgeLevel}
            onChange={(value) => onChange({ ...data, knowledgeLevel: value })}
            options={[
              { value: 'beginner', label: 'Beginner - New to topic' },
              { value: 'intermediate', label: 'Intermediate - Some familiarity' },
              { value: 'expert', label: 'Expert - Deep knowledge' },
              { value: 'mixed', label: 'Mixed - Varies' }
            ]}
          />
        </div>

        <MultiSelectChips
          label="Industry Focus"
          selected={data.industryFocus}
          onChange={(selected) => onChange({ ...data, industryFocus: selected })}
          options={['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Government']}
        />

        <TextInput
          label="Key Decision Makers"
          value={data.decisionMakers}
          onChange={(value) => onChange({ ...data, decisionMakers: value })}
          placeholder="e.g., VP of Engineering, CTO, Product Managers"
        />

        <TextArea
          label="What does your audience care about most?"
          value={data.whatTheyCareAbout}
          onChange={(value) => onChange({ ...data, whatTheyCareAbout: value })}
          placeholder="e.g., ROI, efficiency gains, competitive advantage, risk mitigation..."
          rows={4}
          required
          hint="Think about their priorities, pain points, and what success looks like to them"
        />
      </div>
    </article>
  );
}

function ChallengesStep({ data, onChange }: StepContentProps<ChallengesData>) {
  return (
    <article className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-phantom-900">
          Challenges & Opportunities
        </h1>
        <p className="text-phantom-600">
          What problems does your audience face? What opportunities can you help them seize?
          Understanding their world helps you connect.
        </p>
      </header>

      <hr className="border-phantom-200" />

      <div className="space-y-6 pt-2">
        <PriorityList
          label="Key Challenges"
          items={data.challenges}
          onChange={(challenges) => onChange({ ...data, challenges })}
          placeholder="Describe a challenge your audience faces..."
        />

        <SimpleItemList
          label="Opportunities"
          items={data.opportunities}
          onChange={(opportunities) => onChange({ ...data, opportunities })}
          placeholder="Describe an opportunity..."
        />

        <TextArea
          label="Current Situation"
          value={data.currentSituation}
          onChange={(value) => onChange({ ...data, currentSituation: value })}
          placeholder="Describe where your audience is today..."
          rows={3}
          hint="What's the status quo? What have they tried before?"
        />

        <TextArea
          label="Desired Outcome"
          value={data.desiredOutcome}
          onChange={(value) => onChange({ ...data, desiredOutcome: value })}
          placeholder="Where do they want to be?"
          rows={3}
          hint="Paint a picture of success for your audience"
        />
      </div>
    </article>
  );
}

function BigIdeaStep({ data, onChange }: StepContentProps<BigIdeaData>) {
  return (
    <article className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-phantom-900">
          The Big Idea
        </h1>
        <p className="text-phantom-600">
          What's the one thing you want your audience to remember? This is your core message—the
          transformative idea that will leave a mark.
        </p>
      </header>

      <hr className="border-phantom-200" />

      <div className="space-y-6 pt-2">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Pro Tip</p>
              <p className="text-sm text-amber-700 mt-1">
                A great Big Idea is specific, meaningful to your audience, and can be stated in one sentence.
                It should answer: "What do I want them to think, feel, or do differently?"
              </p>
            </div>
          </div>
        </div>

        <TextArea
          label="Your Big Idea"
          value={data.bigIdea}
          onChange={(value) => onChange({ ...data, bigIdea: value })}
          placeholder="In one sentence, what is the transformative idea you want to share?"
          rows={4}
          required
        />

        <DynamicList
          label="Supporting Points"
          items={data.supportingPoints}
          onChange={(supportingPoints) => onChange({ ...data, supportingPoints })}
          placeholder="Key point that supports your Big Idea"
          minItems={3}
        />

        <TextArea
          label="What makes this unique?"
          value={data.uniqueValue}
          onChange={(value) => onChange({ ...data, uniqueValue: value })}
          placeholder="What differentiates your idea/solution from alternatives?"
          rows={3}
        />

        <TextArea
          label="Proof Points"
          value={data.proofPoints}
          onChange={(value) => onChange({ ...data, proofPoints: value })}
          placeholder="Data, case studies, testimonials that back up your claims..."
          rows={3}
          hint="Evidence builds credibility and trust"
        />
      </div>
    </article>
  );
}

function JourneyStep({ data, onChange }: StepContentProps<JourneyData>) {
  return (
    <article className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-phantom-900">
          Audience Journey
        </h1>
        <p className="text-phantom-600">
          Map out the transformation you want your audience to experience. Where are they starting,
          and where will they end up?
        </p>
      </header>

      <hr className="border-phantom-200" />

      <div className="space-y-6 pt-2">
        <div className="grid grid-cols-2 gap-6">
          <TextArea
            label="Current State"
            value={data.currentState}
            onChange={(value) => onChange({ ...data, currentState: value })}
            placeholder="How does your audience think/feel now?"
            rows={4}
            hint="Their mindset before your presentation"
          />

          <TextArea
            label="Desired State"
            value={data.desiredState}
            onChange={(value) => onChange({ ...data, desiredState: value })}
            placeholder="How should they think/feel after?"
            rows={4}
            hint="Their mindset after your presentation"
          />
        </div>

        <SelectInput
          label="Starting Emotional State"
          value={data.emotionalJourney}
          onChange={(value) => onChange({ ...data, emotionalJourney: value })}
          options={[
            { value: 'skeptical', label: 'Skeptical - Doubtful, needs convincing' },
            { value: 'neutral', label: 'Neutral - Open but uncommitted' },
            { value: 'curious', label: 'Curious - Interested, wants to learn more' },
            { value: 'excited', label: 'Excited - Already bought in' }
          ]}
        />

        <DynamicList
          label="Key Milestones in Their Journey"
          items={data.keyMilestones}
          onChange={(keyMilestones) => onChange({ ...data, keyMilestones })}
          placeholder="e.g., Realize the problem is bigger than thought"
          minItems={3}
        />

        <TextArea
          label="Barriers to Change"
          value={data.barriers}
          onChange={(value) => onChange({ ...data, barriers: value })}
          placeholder="What might prevent them from accepting your message?"
          rows={3}
          hint="Anticipating resistance helps you address it proactively"
        />
      </div>
    </article>
  );
}

function ReceptivenessStep({ data, onChange }: StepContentProps<ReceptivenessData>) {
  return (
    <article className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-phantom-900">
          Receptiveness
        </h1>
        <p className="text-phantom-600">
          Understand how open your audience is to your message and what factors influence their trust.
          This helps you tailor your approach.
        </p>
      </header>

      <hr className="border-phantom-200" />

      <div className="space-y-6 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <SelectInput
            label="Audience Openness"
            value={data.audienceOpenness}
            onChange={(value) => onChange({ ...data, audienceOpenness: value })}
            options={[
              { value: 'resistant', label: 'Resistant - Strong opposition expected' },
              { value: 'cautious', label: 'Cautious - Skeptical but willing to listen' },
              { value: 'open', label: 'Open - Receptive to new ideas' },
              { value: 'eager', label: 'Eager - Actively seeking solutions' }
            ]}
          />

          <SelectInput
            label="Prior Exposure to Topic"
            value={data.priorExposure}
            onChange={(value) => onChange({ ...data, priorExposure: value })}
            options={[
              { value: 'none', label: 'None - Completely new' },
              { value: 'some', label: 'Some - Heard of it' },
              { value: 'familiar', label: 'Familiar - Understand basics' },
              { value: 'expert', label: 'Expert - Deep knowledge' }
            ]}
          />
        </div>

        <MultiSelectChips
          label="Potential Objections"
          selected={data.potentialObjections}
          onChange={(selected) => onChange({ ...data, potentialObjections: selected })}
          options={['Too expensive', 'Too risky', 'Not proven', 'Wrong timing', 'Already tried', 'Too complex']}
        />

        <MultiSelectChips
          label="Trust Factors"
          selected={data.trustFactors}
          onChange={(selected) => onChange({ ...data, trustFactors: selected })}
          options={['Data & research', 'Testimonials', 'Brand reputation', 'Personal relationship', 'Industry expertise', 'Case studies']}
        />

        <TextArea
          label="Emotional Triggers"
          value={data.emotionalTriggers}
          onChange={(value) => onChange({ ...data, emotionalTriggers: value })}
          placeholder="What emotions will resonate? Fear of missing out? Pride in innovation? Security concerns?"
          rows={3}
          hint="Emotions drive decisions—logic justifies them"
        />
      </div>
    </article>
  );
}

function CtaStep({ data, onChange }: StepContentProps<CtaData>) {
  return (
    <article className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-phantom-900">
          Call to Action
        </h1>
        <p className="text-phantom-600">
          Every great presentation ends with a clear ask. What do you want your audience to do
          after your presentation ends?
        </p>
      </header>

      <hr className="border-phantom-200" />

      <div className="space-y-6 pt-2">
        <TextInput
          label="Primary Call to Action"
          value={data.primaryCta}
          onChange={(value) => onChange({ ...data, primaryCta: value })}
          placeholder="e.g., Schedule a demo, Approve the budget, Sign the contract"
          required
        />

        <TextInput
          label="Secondary Call to Action"
          value={data.secondaryCta}
          onChange={(value) => onChange({ ...data, secondaryCta: value })}
          placeholder="e.g., Visit our website, Download the whitepaper"
        />

        <SelectInput
          label="Urgency Level"
          value={data.urgencyLevel}
          onChange={(value) => onChange({ ...data, urgencyLevel: value })}
          options={[
            { value: 'low', label: 'Low - No time pressure' },
            { value: 'medium', label: 'Medium - Should act soon' },
            { value: 'high', label: 'High - Time-sensitive opportunity' },
            { value: 'critical', label: 'Critical - Act now or lose out' }
          ]}
        />

        <DynamicList
          label="Immediate Next Steps"
          items={data.nextSteps}
          onChange={(nextSteps) => onChange({ ...data, nextSteps })}
          placeholder="e.g., Review proposal, Meet with team"
          minItems={1}
        />

        <TextArea
          label="Success Metrics"
          value={data.successMetrics}
          onChange={(value) => onChange({ ...data, successMetrics: value })}
          placeholder="How will you measure if the presentation was successful?"
          rows={3}
          hint="Define what success looks like so you can track it"
        />
      </div>
    </article>
  );
}

function StoryboardStep({ data, onChange }: StepContentProps<StoryboardData>) {
  return (
    <article className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-phantom-900">
          Storyboard Structure
        </h1>
        <p className="text-phantom-600">
          Time to bring it all together. Define the structure and style of your final presentation.
        </p>
      </header>

      <hr className="border-phantom-200" />

      <div className="space-y-6 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <SelectInput
            label="Presentation Style"
            value={data.presentationStyle}
            onChange={(value) => onChange({ ...data, presentationStyle: value })}
            options={[
              { value: 'formal', label: 'Formal - Professional, structured' },
              { value: 'conversational', label: 'Conversational - Relaxed, engaging' },
              { value: 'inspirational', label: 'Inspirational - Motivating, visionary' },
              { value: 'educational', label: 'Educational - Teaching, informative' }
            ]}
          />

          <SelectInput
            label="Target Slide Count"
            value={data.slideCount}
            onChange={(value) => onChange({ ...data, slideCount: value })}
            options={[
              { value: '5-7', label: '5-7 slides (Quick pitch)' },
              { value: '8-10', label: '8-10 slides (Standard)' },
              { value: '11-15', label: '11-15 slides (Detailed)' },
              { value: '15+', label: '15+ slides (Comprehensive)' }
            ]}
          />
        </div>

        <SelectInput
          label="Visual Style"
          value={data.visualStyle}
          onChange={(value) => onChange({ ...data, visualStyle: value })}
          options={[
            { value: 'minimal', label: 'Minimal - Clean, text-focused' },
            { value: 'data-heavy', label: 'Data-heavy - Charts, graphs, metrics' },
            { value: 'image-rich', label: 'Image-rich - Photos, illustrations' },
            { value: 'balanced', label: 'Balanced - Mix of all elements' }
          ]}
        />

        <TextArea
          label="Key Visuals Needed"
          value={data.keyVisuals}
          onChange={(value) => onChange({ ...data, keyVisuals: value })}
          placeholder="List specific charts, diagrams, or images you want to include..."
          rows={3}
        />

        <TextArea
          label="Opening Hook"
          value={data.openingHook}
          onChange={(value) => onChange({ ...data, openingHook: value })}
          placeholder="How will you capture attention in the first 30 seconds?"
          rows={3}
          hint="A compelling story, surprising statistic, or provocative question"
        />

        <TextArea
          label="Closing Statement"
          value={data.closingStatement}
          onChange={(value) => onChange({ ...data, closingStatement: value })}
          placeholder="The last words your audience will hear..."
          rows={3}
          hint="End strong—this is what they'll remember most"
        />
      </div>
    </article>
  );
}

function FinalStep({
  formData,
  onExportJson,
  onGeneratePptx,
  isGenerating
}: {
  formData: WizardFormData;
  onExportJson: () => void;
  onGeneratePptx: () => void;
  isGenerating: boolean;
}) {
  const completionStats = {
    audience: formData.audience.primaryAudience && formData.audience.whatTheyCareAbout,
    challenges: formData.challenges.challenges.length > 0 || formData.challenges.currentSituation,
    bigIdea: formData.bigIdea.bigIdea,
    journey: formData.journey.currentState || formData.journey.desiredState,
    receptiveness: formData.receptiveness.audienceOpenness,
    cta: formData.cta.primaryCta,
    storyboard: formData.storyboard.presentationStyle
  };

  const completedSections = Object.values(completionStats).filter(Boolean).length;
  const totalSections = Object.keys(completionStats).length;

  return (
    <article className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-phantom-900">
          You're Ready!
        </h1>
        <p className="text-phantom-600">
          Congratulations! You've completed the storytelling wizard. Now let's bring your presentation to life.
        </p>
      </header>

      <hr className="border-phantom-200" />

      {/* Completion Summary */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-emerald-800">Completion Summary</h3>
          <span className="text-sm font-medium text-emerald-600">
            {completedSections}/{totalSections} sections complete
          </span>
        </div>
        <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(completedSections / totalSections) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Preview */}
      <div className="bg-phantom-50 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-phantom-800">Quick Preview</h3>

        {formData.projectName && (
          <div>
            <span className="text-xs font-medium text-phantom-500">PROJECT</span>
            <p className="text-phantom-900">{formData.projectName}</p>
          </div>
        )}

        {formData.bigIdea.bigIdea && (
          <div>
            <span className="text-xs font-medium text-phantom-500">BIG IDEA</span>
            <p className="text-phantom-900 italic">"{formData.bigIdea.bigIdea}"</p>
          </div>
        )}

        {formData.audience.primaryAudience && (
          <div>
            <span className="text-xs font-medium text-phantom-500">AUDIENCE</span>
            <p className="text-phantom-900">{formData.audience.primaryAudience}</p>
          </div>
        )}

        {formData.cta.primaryCta && (
          <div>
            <span className="text-xs font-medium text-phantom-500">CALL TO ACTION</span>
            <p className="text-phantom-900">{formData.cta.primaryCta}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={onGeneratePptx}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Presentation...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Generate & Download PPTX
            </>
          )}
        </button>

        <button
          onClick={onExportJson}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-phantom-200 text-phantom-700 font-medium rounded-xl hover:bg-phantom-50 transition-colors"
        >
          <FileJson className="w-5 h-5" />
          Export Wizard Data (JSON)
        </button>
      </div>

      <p className="text-xs text-center text-phantom-500">
        Your progress is automatically saved. You can close this wizard and return anytime.
      </p>
    </article>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PresentationWizard({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useLocalStorage<WizardFormData>(STORAGE_KEY, initialFormData);
  const [savedStep, setSavedStep] = useLocalStorage<string>(STORAGE_STEP_KEY, 'upload');
  const [steps, setSteps] = useState<WizardStep[]>(() => {
    const initial = createInitialSteps();
    // Restore step states based on saved step
    const savedIdx = initial.findIndex(s => s.id === savedStep);
    if (savedIdx > 0) {
      return initial.map((step, idx) => ({
        ...step,
        completed: idx < savedIdx,
        active: idx === savedIdx,
        disabled: idx > savedIdx
      }));
    }
    return initial;
  });
  const [expandedStep, setExpandedStep] = useState(savedStep);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = steps.find(s => s.active);
  const currentStepIndex = steps.findIndex(s => s.active);
  const isLastStep = currentStepIndex === steps.length - 1;

  // Debounced save effect
  const debouncedFormData = useDebounce(formData, 500);
  useEffect(() => {
    // This effect runs after debounce, localStorage is already updated by useLocalStorage
  }, [debouncedFormData]);

  // Save current step
  useEffect(() => {
    if (currentStep) {
      setSavedStep(currentStep.id);
    }
  }, [currentStep, setSavedStep]);

  const handleImportJson = useCallback((imported: WizardFormData) => {
    setFormData(imported);
    // Jump to last step or first incomplete step
    const stepsToUnlock = createInitialSteps().map((step, idx) => ({
      ...step,
      completed: idx < 7,
      active: idx === 7,
      disabled: false
    }));
    setSteps(stepsToUnlock);
    setExpandedStep('storyboard');
  }, [setFormData]);

  const handleLoadSampleData = useCallback(async () => {
    try {
      const response = await fetch('/sample-wizard-data.json');
      if (!response.ok) throw new Error('Failed to load sample data');
      const sampleData = await response.json() as WizardFormData;
      handleImportJson(sampleData);
    } catch (err) {
      console.error('Error loading sample data:', err);
      setError('Failed to load sample data. Please try again.');
    }
  }, [handleImportJson]);

  const handleResetProgress = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      setFormData(initialFormData);
      setSteps(createInitialSteps());
      setExpandedStep('upload');
      setSavedStep('upload');
      setError(null);
    }
  }, [setFormData, setSavedStep]);

  const updateFormData = useCallback(<K extends keyof WizardFormData>(
    key: K,
    value: WizardFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, [setFormData]);

  const navigateToStep = useCallback((stepId: string) => {
    const targetIdx = steps.findIndex(s => s.id === stepId);
    if (targetIdx >= 0 && !steps[targetIdx].disabled) {
      setSteps(prev => prev.map((step, idx) => ({
        ...step,
        active: idx === targetIdx
      })));
      setExpandedStep(stepId);
    }
  }, [steps]);

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setSteps(prev => prev.map((step, idx) => {
        if (idx === currentStepIndex) return { ...step, completed: true, active: false };
        if (idx === currentStepIndex + 1) return { ...step, active: true, disabled: false };
        return step;
      }));
      setExpandedStep(steps[currentStepIndex + 1].id);
    }
  }, [currentStepIndex, steps]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setSteps(prev => prev.map((step, idx) => {
        if (idx === currentStepIndex) return { ...step, active: false };
        if (idx === currentStepIndex - 1) return { ...step, active: true };
        return step;
      }));
      setExpandedStep(steps[currentStepIndex - 1].id);
    }
  }, [currentStepIndex, steps]);

  const handleExportJson = useCallback(() => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.projectName || 'presentation-wizard'}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formData]);

  const handleGeneratePptx = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create a comprehensive prompt from the wizard data
      const prompt = `
Create a professional presentation with the following details:

PROJECT: ${formData.projectName}

AUDIENCE: ${formData.audience.primaryAudience}
- Size: ${formData.audience.audienceSize}
- Knowledge Level: ${formData.audience.knowledgeLevel}
- Industries: ${formData.audience.industryFocus.join(', ')}
- Decision Makers: ${formData.audience.decisionMakers}
- What they care about: ${formData.audience.whatTheyCareAbout}

CHALLENGES:
${formData.challenges.challenges.map(c => `- [${c.priority.toUpperCase()}] ${c.text}`).join('\n')}

OPPORTUNITIES:
${formData.challenges.opportunities.map(o => `- ${o.text}`).join('\n')}

Current Situation: ${formData.challenges.currentSituation}
Desired Outcome: ${formData.challenges.desiredOutcome}

THE BIG IDEA: ${formData.bigIdea.bigIdea}

Supporting Points:
${formData.bigIdea.supportingPoints.filter(p => p).map(p => `- ${p}`).join('\n')}

Unique Value: ${formData.bigIdea.uniqueValue}
Proof Points: ${formData.bigIdea.proofPoints}

AUDIENCE JOURNEY:
- From: ${formData.journey.currentState}
- To: ${formData.journey.desiredState}
- Emotional starting point: ${formData.journey.emotionalJourney}
- Key Milestones: ${formData.journey.keyMilestones.filter(m => m).join(', ')}
- Barriers: ${formData.journey.barriers}

RECEPTIVENESS:
- Openness: ${formData.receptiveness.audienceOpenness}
- Prior Exposure: ${formData.receptiveness.priorExposure}
- Potential Objections: ${formData.receptiveness.potentialObjections.join(', ')}
- Trust Factors: ${formData.receptiveness.trustFactors.join(', ')}
- Emotional Triggers: ${formData.receptiveness.emotionalTriggers}

CALL TO ACTION:
- Primary: ${formData.cta.primaryCta}
- Secondary: ${formData.cta.secondaryCta}
- Urgency: ${formData.cta.urgencyLevel}
- Next Steps: ${formData.cta.nextSteps.filter(s => s).join(', ')}
- Success Metrics: ${formData.cta.successMetrics}

STORYBOARD:
- Style: ${formData.storyboard.presentationStyle}
- Slides: ${formData.storyboard.slideCount}
- Visual Style: ${formData.storyboard.visualStyle}
- Key Visuals: ${formData.storyboard.keyVisuals}
- Opening Hook: ${formData.storyboard.openingHook}
- Closing Statement: ${formData.storyboard.closingStatement}
      `.trim();

      const apiBase = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${apiBase}/api/generate-presentation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate presentation');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${formData.projectName || 'presentation'}.pptx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }, [formData]);

  const canProceed = useCallback(() => {
    switch (currentStep?.id) {
      case 'upload':
        return formData.projectName.trim().length > 0;
      case 'audience':
        return formData.audience.primaryAudience.trim().length > 0;
      case 'challenges':
        return true; // Optional step
      case 'bigidea':
        return formData.bigIdea.bigIdea.trim().length > 0;
      case 'journey':
        return true; // Optional step
      case 'receptiveness':
        return true; // Optional step
      case 'cta':
        return formData.cta.primaryCta.trim().length > 0;
      case 'storyboard':
        return true; // All optional
      default:
        return true;
    }
  }, [currentStep, formData]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Wizard Sidebar */}
      <aside className="w-64 border-r border-phantom-200 bg-white flex flex-col p-5 overflow-y-auto">
        <div className="mb-4">
          <span className="text-xs text-phantom-500 font-medium flex items-center gap-1">
            Leave a Mark Storyteller
            <Info className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-bold text-phantom-900">
            {formData.projectName || 'New Project'}
          </span>
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
              onNavigate={() => navigateToStep(step.id)}
            />
          ))}
        </nav>

        {/* Auto-save indicator & Reset */}
        <div className="mt-auto pt-4 border-t border-phantom-100 space-y-3">
          <div className="flex items-center gap-2 text-xs text-phantom-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Progress auto-saved
          </div>
          <button
            onClick={handleResetProgress}
            className="flex items-center gap-1.5 text-xs text-phantom-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset progress
          </button>
        </div>
      </aside>

      {/* Vertical Separator */}
      <div className="w-px bg-phantom-200" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-12">
            {currentStep?.id === 'upload' && (
              <UploadStep
                data={{ projectName: formData.projectName, uploadedFileName: formData.uploadedFileName }}
                onChange={(data) => {
                  updateFormData('projectName', data.projectName);
                  updateFormData('uploadedFileName', data.uploadedFileName);
                }}
                onImportJson={handleImportJson}
                onLoadSampleData={handleLoadSampleData}
              />
            )}

            {currentStep?.id === 'audience' && (
              <AudienceStep
                data={formData.audience}
                onChange={(data) => updateFormData('audience', data)}
              />
            )}

            {currentStep?.id === 'challenges' && (
              <ChallengesStep
                data={formData.challenges}
                onChange={(data) => updateFormData('challenges', data)}
              />
            )}

            {currentStep?.id === 'bigidea' && (
              <BigIdeaStep
                data={formData.bigIdea}
                onChange={(data) => updateFormData('bigIdea', data)}
              />
            )}

            {currentStep?.id === 'journey' && (
              <JourneyStep
                data={formData.journey}
                onChange={(data) => updateFormData('journey', data)}
              />
            )}

            {currentStep?.id === 'receptiveness' && (
              <ReceptivenessStep
                data={formData.receptiveness}
                onChange={(data) => updateFormData('receptiveness', data)}
              />
            )}

            {currentStep?.id === 'cta' && (
              <CtaStep
                data={formData.cta}
                onChange={(data) => updateFormData('cta', data)}
              />
            )}

            {currentStep?.id === 'storyboard' && !isLastStep && (
              <StoryboardStep
                data={formData.storyboard}
                onChange={(data) => updateFormData('storyboard', data)}
              />
            )}

            {isLastStep && currentStep?.id === 'storyboard' && (
              <FinalStep
                formData={formData}
                onExportJson={handleExportJson}
                onGeneratePptx={handleGeneratePptx}
                isGenerating={isGenerating}
              />
            )}

            {/* Error display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-phantom-200 bg-white/75 backdrop-blur-sm px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStepIndex === 0
                  ? 'text-phantom-300 cursor-not-allowed'
                  : 'text-phantom-600 hover:bg-phantom-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {!isLastStep && (
              <button
                onClick={goToNextStep}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  canProceed()
                    ? 'bg-phantom-900 text-white hover:bg-phantom-800'
                    : 'bg-phantom-100 text-phantom-400 cursor-not-allowed'
                }`}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
