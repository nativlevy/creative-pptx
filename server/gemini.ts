import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface SlideData {
  title: string;
  content: string[];
  speakerNotes?: string;
  layout: 'title' | 'content' | 'twoColumn' | 'imageText';
}

export interface PresentationData {
  title: string;
  subtitle?: string;
  slides: SlideData[];
}

export async function generatePresentationContent(idea: string): Promise<PresentationData> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are an expert presentation designer. Create a compelling PowerPoint presentation based on this idea:

"${idea}"

Generate a structured presentation with 5-8 slides. Return a JSON object:
{
  "title": "Main presentation title",
  "subtitle": "Optional subtitle",
  "slides": [
    {
      "title": "Slide title",
      "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "speakerNotes": "Notes for presenter",
      "layout": "title" | "content" | "twoColumn"
    }
  ]
}

Guidelines:
- First slide should be a title slide (layout: "title")
- Last slide should be a conclusion/call-to-action
- Each content slide should have 3-5 bullet points
- Keep bullet points concise (max 15 words each)
- Make content engaging and professional

Return ONLY valid JSON, no markdown or extra text.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleanJson);
}

export async function createPptxBuffer(data: PresentationData): Promise<Buffer> {
  // Dynamic import to handle ESM/CJS interop properly with tsx
  const PptxGenModule = await import('pptxgenjs');
  const PptxGenJS = PptxGenModule.default;
  const pptx = new PptxGenJS();

  pptx.title = data.title;
  pptx.author = 'Leave a Mark';
  pptx.subject = data.subtitle || data.title;

  // Define color scheme
  const colors = {
    primary: '2563EB',    // Blue
    secondary: '1E40AF',  // Darker blue
    accent: '3B82F6',     // Light blue
    text: '1F2937',       // Dark gray
    lightText: '6B7280',  // Medium gray
    background: 'FFFFFF'
  };

  for (const slide of data.slides) {
    const pptxSlide = pptx.addSlide();

    if (slide.layout === 'title') {
      // Title slide layout
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 2.5,
        w: '90%',
        h: 1.5,
        fontSize: 44,
        fontFace: 'Arial',
        color: colors.primary,
        bold: true,
        align: 'center',
        valign: 'middle'
      });

      if (slide.content && slide.content.length > 0) {
        pptxSlide.addText(slide.content[0], {
          x: 0.5,
          y: 4,
          w: '90%',
          h: 0.8,
          fontSize: 24,
          fontFace: 'Arial',
          color: colors.lightText,
          align: 'center',
          valign: 'middle'
        });
      }
    } else {
      // Content slide layout
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 0.3,
        w: '90%',
        h: 1,
        fontSize: 32,
        fontFace: 'Arial',
        color: colors.primary,
        bold: true
      });

      // Add bullet points
      const bulletPoints = slide.content.map(point => ({
        text: point,
        options: { bullet: { type: 'bullet' as const }, indentLevel: 0 }
      }));

      pptxSlide.addText(bulletPoints, {
        x: 0.5,
        y: 1.5,
        w: '90%',
        h: 4,
        fontSize: 20,
        fontFace: 'Arial',
        color: colors.text,
        valign: 'top',
        lineSpacingMultiple: 1.5
      });
    }

    // Add speaker notes if available
    if (slide.speakerNotes) {
      pptxSlide.addNotes(slide.speakerNotes);
    }
  }

  // Generate buffer
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer as Buffer;
}

export async function analyzeTranscript(transcript: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are an expert presentation consultant. Analyze this meeting transcript and extract key insights for building a pitch deck.

Return a JSON object with the following structure:
{
  "keyInsights": ["insight1", "insight2", ...],
  "audienceProfile": {
    "primaryAudience": "description",
    "concerns": ["concern1", "concern2"],
    "motivations": ["motivation1", "motivation2"]
  },
  "challenges": ["challenge1", "challenge2", ...],
  "opportunities": ["opportunity1", "opportunity2", ...],
  "bigIdea": "The main transformative message",
  "suggestedSlides": [
    { "section": "INTRO", "slides": ["Hi", "Aperitif", "Team"] },
    { "section": "PROBLEM / SOLUTION", "slides": ["Problem", "Solution", "Product"] },
    { "section": "BUSINESS", "slides": ["Market", "Business Model", "Competition"] },
    { "section": "CLOSE", "slides": ["Traction", "Ask", "Bye"] }
  ]
}

Transcript:
${transcript}

Return ONLY valid JSON, no markdown or extra text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Clean up response - remove markdown code blocks if present
    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function generateSlideContent(slideType: string, context: {
  bigIdea: string;
  audience: string;
  challenges: string[];
  opportunities: string[];
}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Generate content for a "${slideType}" slide in a pitch deck.

Context:
- Big Idea: ${context.bigIdea}
- Audience: ${context.audience}
- Challenges: ${context.challenges.join(', ')}
- Opportunities: ${context.opportunities.join(', ')}

Return a JSON object:
{
  "title": "Slide title",
  "subtitle": "Optional subtitle",
  "bulletPoints": ["point1", "point2", "point3"],
  "speakerNotes": "Notes for the presenter"
}

Return ONLY valid JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
