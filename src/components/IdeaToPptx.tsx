import { useState } from 'react';
import { Lightbulb, Download, Loader2, ArrowRight, Sparkles, Presentation } from 'lucide-react';

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
      const apiBase = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${apiBase}/api/generate-presentation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'יצירת המצגת נכשלה');
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
      setError(err instanceof Error ? err.message : 'משהו השתבש');
    } finally {
      setIsGenerating(false);
    }
  };

  const exampleIdeas = [
    "פיץ' לסטארטאפ על אפליקציית כושר מונעת AI שיוצרת תוכניות אימון מותאמות אישית",
    "סיכום עסקי רבעוני המדגיש צמיחה במכירות והתרחבות בשוק",
    "מצגת השקת מוצר לפתרון אריזה בר-קיימא",
    "מצגת קליטת צוות המכסה תרבות החברה ותהליכים"
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
            <ArrowRight className="w-5 h-5 text-phantom-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-phantom-900">מרעיון למצגת</h1>
              <p className="text-phantom-500 text-sm">תארו את הרעיון וקבלו PowerPoint מלוטש</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-phantom-200 shadow-sm overflow-hidden">
          {/* Input Section */}
          <div className="p-6">
            <label className="block text-sm font-medium text-phantom-700 mb-2">
              תארו את רעיון המצגת שלכם
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="למשל, מצגת פיץ' לשוק אופנה בר-קיימא המחבר צרכנים מודעים לסביבה עם מותגים אתיים..."
              className="w-full h-40 px-4 py-3 rounded-xl border border-phantom-200 bg-phantom-50 text-phantom-900 placeholder:text-phantom-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
              disabled={isGenerating}
            />

            {/* Character count */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-phantom-400">
                {idea.length} תווים
              </span>
              <span className="text-xs text-phantom-400">
                מומלץ: 50-500 תווים
              </span>
            </div>
          </div>

          {/* Example Ideas */}
          <div className="px-6 pb-6">
            <p className="text-xs font-medium text-phantom-500 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              נסו דוגמה
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
                  יוצר מצגת...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  יצירה והורדת PPTX
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
              <h3 className="font-medium text-phantom-900 mb-1">איך זה עובד</h3>
              <ul className="text-sm text-phantom-500 space-y-1">
                <li>1. תארו את הרעיון שלכם בשפה טבעית</li>
                <li>2. ה-AI שלנו מנתח ומבנה את התוכן</li>
                <li>3. נוצרת מצגת PowerPoint מקצועית עם 5-8 שקפים</li>
                <li>4. הורידו והתאימו ב-PowerPoint או Google Slides</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
