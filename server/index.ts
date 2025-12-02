import 'dotenv/config';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { connectDB, getDB, ObjectId } from './db';
import { analyzeTranscript, generateSlideContent, generatePresentationContent, createPptxBuffer } from './gemini';
import ragRoutes from './routes/rag';
import { existsSync, readFileSync } from 'fs';

const app = new Hono();

// Middleware
app.use('/*', cors());

// RAG routes
app.route('/api/rag', ragRoutes);

// Health check (use /api/health for API, / will serve frontend in production)
app.get('/api/health', (c) => c.json({ status: 'ok', message: 'Leave a Mark API' }));

// ============ PROJECTS ============

// Get all projects
app.get('/api/projects', async (c) => {
  try {
    const db = await getDB();
    const projects = await db.collection('projects')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    return c.json(projects);
  } catch (error) {
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

// Get single project
app.get('/api/projects/:id', async (c) => {
  try {
    const db = await getDB();
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(c.req.param('id'))
    });
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    return c.json(project);
  } catch (error) {
    return c.json({ error: 'Failed to fetch project' }, 500);
  }
});

// Create project
app.post('/api/projects', async (c) => {
  try {
    const body = await c.req.json();
    const db = await getDB();

    const project = {
      name: body.name || 'New Project',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      transcript: null,
      analysis: null,
      slides: [],
      wizardStep: 'upload',
      wizardData: {}
    };

    const result = await db.collection('projects').insertOne(project);
    return c.json({ ...project, _id: result.insertedId }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

// Update project
app.patch('/api/projects/:id', async (c) => {
  try {
    const body = await c.req.json();
    const db = await getDB();

    const result = await db.collection('projects').findOneAndUpdate(
      { _id: new ObjectId(c.req.param('id')) },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return c.json({ error: 'Project not found' }, 404);
    }
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

// Delete project
app.delete('/api/projects/:id', async (c) => {
  try {
    const db = await getDB();
    await db.collection('projects').deleteOne({
      _id: new ObjectId(c.req.param('id'))
    });
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

// ============ AI ANALYSIS ============

// Analyze transcript
app.post('/api/analyze', async (c) => {
  try {
    const { transcript, projectId } = await c.req.json();

    if (!transcript) {
      return c.json({ error: 'Transcript is required' }, 400);
    }

    console.log('Analyzing transcript...');
    const analysis = await analyzeTranscript(transcript);
    console.log('Analysis complete:', analysis);

    // Save to project if projectId provided
    if (projectId) {
      const db = await getDB();
      await db.collection('projects').updateOne(
        { _id: new ObjectId(projectId) },
        {
          $set: {
            transcript,
            analysis,
            updatedAt: new Date()
          }
        }
      );
    }

    return c.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return c.json({ error: 'Failed to analyze transcript' }, 500);
  }
});

// Generate slide content
app.post('/api/generate-slide', async (c) => {
  try {
    const { slideType, context } = await c.req.json();

    if (!slideType || !context) {
      return c.json({ error: 'slideType and context are required' }, 400);
    }

    const content = await generateSlideContent(slideType, context);
    return c.json(content);
  } catch (error) {
    console.error('Slide generation error:', error);
    return c.json({ error: 'Failed to generate slide content' }, 500);
  }
});

// Generate presentation from idea
app.post('/api/generate-presentation', async (c) => {
  try {
    const { idea } = await c.req.json();

    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      return c.json({ error: 'Idea description is required' }, 400);
    }

    console.log('Generating presentation for idea:', idea.substring(0, 100) + '...');

    // Generate presentation content using Gemini
    const presentationData = await generatePresentationContent(idea);
    console.log('Generated presentation structure:', presentationData.title);

    // Create PPTX file
    const pptxBuffer = await createPptxBuffer(presentationData);
    console.log('PPTX buffer created, size:', pptxBuffer.length);

    // Return the file as a download
    const filename = `${presentationData.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.pptx`;

    return new Response(pptxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pptxBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error('Presentation generation error:', error);
    return c.json({ error: 'Failed to generate presentation' }, 500);
  }
});

// ============ WIZARD DATA ============

// Save wizard step data
app.post('/api/projects/:id/wizard', async (c) => {
  try {
    const { step, data } = await c.req.json();
    const db = await getDB();

    const result = await db.collection('projects').findOneAndUpdate(
      { _id: new ObjectId(c.req.param('id')) },
      {
        $set: {
          wizardStep: step,
          [`wizardData.${step}`]: data,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Failed to save wizard data' }, 500);
  }
});

// ============ STATIC FILES (Production) ============

const isProduction = process.env.NODE_ENV === 'production' || existsSync('./dist');

if (isProduction && existsSync('./dist/index.html')) {
  console.log('Production mode: serving static files from ./dist');

  // Serve static assets (js, css, images, etc.)
  app.use('/assets/*', serveStatic({ root: './dist' }));

  // Serve specific static files (json, svg, etc.)
  app.get('/*.json', serveStatic({ root: './dist' }));
  app.get('/*.svg', serveStatic({ root: './dist' }));
  app.get('/*.ico', serveStatic({ root: './dist' }));
  app.get('/*.png', serveStatic({ root: './dist' }));
  app.get('/*.jpg', serveStatic({ root: './dist' }));

  // Serve index.html for root
  app.get('/', (c) => {
    const html = readFileSync('./dist/index.html', 'utf-8');
    return c.html(html);
  });

  // SPA fallback - serve index.html for all non-API, non-static routes
  app.get('*', (c) => {
    const path = c.req.path;
    // Skip API routes and static file extensions
    if (path.startsWith('/api') || /\.[a-zA-Z0-9]+$/.test(path)) {
      return c.notFound();
    }
    const html = readFileSync('./dist/index.html', 'utf-8');
    return c.html(html);
  });
} else {
  // Development mode - API only, frontend served by Vite
  app.get('/', (c) => c.json({ status: 'ok', message: 'Leave a Mark API (dev mode - use Vite for frontend)' }));
}

// ============ START SERVER ============

const port = parseInt(process.env.PORT || '3001');

async function start() {
  try {
    await connectDB();

    serve({
      fetch: app.fetch,
      port
    }, (info) => {
      console.log(`Server running at http://localhost:${info.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
