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
  pptx.layout = 'LAYOUT_16x9';

  // Clean, minimal Linear-style palette - monochromatic
  const colors = {
    background: 'FFFFFF',       // Pure white
    textPrimary: '000000',      // Pure black for titles
    textBody: '374151',         // Dark gray for body text
    textMuted: '9CA3AF',        // Light gray for secondary
    textSubtle: 'D1D5DB',       // Very light gray
    line: 'E5E7EB',             // Subtle divider lines
  };

  // Inter font (falls back to system fonts if not available)
  const font = 'Inter';

  const totalSlides = data.slides.length;

  for (let i = 0; i < data.slides.length; i++) {
    const slide = data.slides[i];
    const pptxSlide = pptx.addSlide();
    const slideNum = i + 1;

    // Clean white background
    pptxSlide.background = { color: colors.background };

    if (slide.layout === 'title') {
      // ==========================================
      // TITLE SLIDE - Clean, centered hero
      // ==========================================

      // Main title - large, bold, black
      pptxSlide.addText(slide.title, {
        x: 0.8,
        y: 2,
        w: 11.4,
        h: 1.4,
        fontSize: 48,
        fontFace: font,
        color: colors.textPrimary,
        bold: true,
        align: 'left',
        valign: 'bottom',
      });

      // Thin line under title
      pptxSlide.addShape('rect', {
        x: 0.8,
        y: 3.5,
        w: 1.5,
        h: 0.02,
        fill: { type: 'solid', color: colors.textPrimary },
        line: { width: 0 },
      });

      // Subtitle
      if (slide.content && slide.content.length > 0) {
        pptxSlide.addText(slide.content[0], {
          x: 0.8,
          y: 3.7,
          w: 8,
          h: 0.7,
          fontSize: 20,
          fontFace: font,
          color: colors.textMuted,
          align: 'left',
          valign: 'top',
        });
      }

      // Minimal branding at bottom
      pptxSlide.addText('Leave a Mark', {
        x: 0.8,
        y: 4.9,
        w: 2,
        h: 0.3,
        fontSize: 11,
        fontFace: font,
        color: colors.textSubtle,
      });

    } else if (slide.layout === 'twoColumn') {
      // ==========================================
      // TWO-COLUMN SLIDE
      // ==========================================

      // Slide title
      pptxSlide.addText(slide.title, {
        x: 0.8,
        y: 0.6,
        w: 11.4,
        h: 0.7,
        fontSize: 28,
        fontFace: font,
        color: colors.textPrimary,
        bold: true,
        align: 'left',
        valign: 'middle',
      });

      // Divider line
      pptxSlide.addShape('rect', {
        x: 0.8,
        y: 1.4,
        w: 11.4,
        h: 0.01,
        fill: { type: 'solid', color: colors.line },
        line: { width: 0 },
      });

      // Split content
      const midPoint = Math.ceil(slide.content.length / 2);
      const leftContent = slide.content.slice(0, midPoint);
      const rightContent = slide.content.slice(midPoint);

      // Left column bullets
      const leftBullets = leftContent.map(point => ({
        text: point,
        options: {
          bullet: { type: 'bullet' as const, characterCode: '2022', color: colors.textMuted },
          indentLevel: 0,
          paraSpaceAfter: 12,
        }
      }));

      pptxSlide.addText(leftBullets, {
        x: 0.8,
        y: 1.7,
        w: 5.4,
        h: 3,
        fontSize: 16,
        fontFace: font,
        color: colors.textBody,
        valign: 'top',
        lineSpacingMultiple: 1.5,
      });

      // Right column bullets
      const rightBullets = rightContent.map(point => ({
        text: point,
        options: {
          bullet: { type: 'bullet' as const, characterCode: '2022', color: colors.textMuted },
          indentLevel: 0,
          paraSpaceAfter: 12,
        }
      }));

      pptxSlide.addText(rightBullets, {
        x: 6.6,
        y: 1.7,
        w: 5.4,
        h: 3,
        fontSize: 16,
        fontFace: font,
        color: colors.textBody,
        valign: 'top',
        lineSpacingMultiple: 1.5,
      });

      // Slide number
      pptxSlide.addText(`${slideNum} / ${totalSlides}`, {
        x: 11.2,
        y: 5,
        w: 1,
        h: 0.3,
        fontSize: 10,
        fontFace: font,
        color: colors.textSubtle,
        align: 'right',
      });

    } else if (slide.layout === 'imageText' || i === data.slides.length - 1) {
      // ==========================================
      // CLOSING SLIDE - Simple and clear
      // ==========================================

      // Main title
      pptxSlide.addText(slide.title, {
        x: 0.8,
        y: 1.8,
        w: 11.4,
        h: 1.2,
        fontSize: 36,
        fontFace: font,
        color: colors.textPrimary,
        bold: true,
        align: 'left',
        valign: 'middle',
      });

      // Line accent
      pptxSlide.addShape('rect', {
        x: 0.8,
        y: 3.1,
        w: 1.2,
        h: 0.02,
        fill: { type: 'solid', color: colors.textPrimary },
        line: { width: 0 },
      });

      // CTA points
      if (slide.content && slide.content.length > 0) {
        const ctaPoints = slide.content.map(point => ({
          text: point,
          options: {
            bullet: { type: 'bullet' as const, characterCode: '2192', color: colors.textMuted },
            indentLevel: 0,
            paraSpaceAfter: 10,
          }
        }));

        pptxSlide.addText(ctaPoints, {
          x: 0.8,
          y: 3.3,
          w: 10,
          h: 1.5,
          fontSize: 18,
          fontFace: font,
          color: colors.textBody,
          valign: 'top',
          lineSpacingMultiple: 1.4,
        });
      }

      // Branding
      pptxSlide.addText('Leave a Mark', {
        x: 0.8,
        y: 4.9,
        w: 2,
        h: 0.3,
        fontSize: 11,
        fontFace: font,
        color: colors.textSubtle,
      });

    } else {
      // ==========================================
      // CONTENT SLIDE - Clean and readable
      // ==========================================

      // Slide title
      pptxSlide.addText(slide.title, {
        x: 0.8,
        y: 0.6,
        w: 11.4,
        h: 0.7,
        fontSize: 28,
        fontFace: font,
        color: colors.textPrimary,
        bold: true,
        align: 'left',
        valign: 'middle',
      });

      // Subtle divider
      pptxSlide.addShape('rect', {
        x: 0.8,
        y: 1.4,
        w: 11.4,
        h: 0.01,
        fill: { type: 'solid', color: colors.line },
        line: { width: 0 },
      });

      // Bullet points
      const bulletPoints = slide.content.map(point => ({
        text: point,
        options: {
          bullet: { type: 'bullet' as const, characterCode: '2022', color: colors.textMuted },
          indentLevel: 0,
          paraSpaceAfter: 14,
        }
      }));

      pptxSlide.addText(bulletPoints, {
        x: 0.8,
        y: 1.7,
        w: 11.4,
        h: 3,
        fontSize: 18,
        fontFace: font,
        color: colors.textBody,
        valign: 'top',
        lineSpacingMultiple: 1.6,
      });

      // Slide number
      pptxSlide.addText(`${slideNum} / ${totalSlides}`, {
        x: 11.2,
        y: 5,
        w: 1,
        h: 0.3,
        fontSize: 10,
        fontFace: font,
        color: colors.textSubtle,
        align: 'right',
      });
    }

    // Add speaker notes
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
