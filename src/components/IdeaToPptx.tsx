import { useState } from 'react';
import { Lightbulb, Download, Loader2, ArrowLeft, Sparkles, Presentation } from 'lucide-react';

interface IdeaToPptxProps {
  onClose: () => void;
}

export function IdeaToPptx({ onClose }: IdeaToPptxProps) {
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!idea.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate presentation');
      }

      // Get the blob from response
      const blob = await response.blob();

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'presentation.pptx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      // Create download link
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
  };

  const exampleIdeas = [
    "A startup pitch for an AI-powered fitness app that creates personalized workout plans",
    "Quarterly business review highlighting sales growth and market expansion",
    "Product launch presentation for a sustainable packaging solution",
    "Team onboarding presentation covering company culture and processes"
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-phantom-50">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-phantom-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-phantom-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-phantom-900">Idea to Presentation</h1>
              <p className="text-phantom-500 text-sm">Describe your idea and get a polished PowerPoint</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-phantom-200 shadow-sm overflow-hidden">
          {/* Input Section */}
          <div className="p-6">
            <label className="block text-sm font-medium text-phantom-700 mb-2">
              Describe your presentation idea
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="E.g., A pitch deck for a sustainable fashion marketplace that connects eco-conscious consumers with ethical brands..."
              className="w-full h-40 px-4 py-3 rounded-xl border border-phantom-200 bg-phantom-50 text-phantom-900 placeholder:text-phantom-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
              disabled={isGenerating}
            />

            {/* Character count */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-phantom-400">
                {idea.length} characters
              </span>
              <span className="text-xs text-phantom-400">
                Recommended: 50-500 characters
              </span>
            </div>
          </div>

          {/* Example Ideas */}
          <div className="px-6 pb-6">
            <p className="text-xs font-medium text-phantom-500 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Try an example
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleIdeas.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setIdea(example)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 text-xs bg-phantom-100 hover:bg-phantom-200 text-phantom-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed truncate max-w-[200px]"
                  title={example}
                >
                  {example.substring(0, 40)}...
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <div className="p-6 bg-phantom-50 border-t border-phantom-100">
            <button
              onClick={handleGenerate}
              disabled={!idea.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating presentation...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate & Download PPTX
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-white rounded-2xl border border-phantom-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Presentation className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-phantom-900 mb-1">How it works</h3>
              <ul className="text-sm text-phantom-500 space-y-1">
                <li>1. Describe your idea in natural language</li>
                <li>2. Our AI analyzes and structures your content</li>
                <li>3. A professional PowerPoint is generated with 5-8 slides</li>
                <li>4. Download and customize in PowerPoint or Google Slides</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
