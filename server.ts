import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini Client (lazy/safe)
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper: Extract YouTube video ID
function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1).split('?')[0] || null;
    }
    if (parsed.pathname.includes('/shorts/')) {
      const parts = parsed.pathname.split('/shorts/');
      return parts[1]?.split('/')[0]?.split('?')[0] || null;
    }
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

// Helper: Fetch YouTube metadata via oEmbed
async function fetchYouTubeOEmbed(url: string): Promise<{ title?: string; author_name?: string; thumbnail_url?: string } | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not fetch YouTube oEmbed:', err);
  }
  return null;
}

// Helper: Fetch HTML and extract basic metadata and main text
async function fetchWebPageContent(url: string): Promise<{
  title?: string;
  description?: string;
  image?: string;
  rawText?: string;
  schemaRecipe?: any;
}> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) {
      return {};
    }

    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const title = ogTitleMatch?.[1] || titleMatch?.[1]?.trim();

    // Extract description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = ogDescMatch?.[1] || metaDescMatch?.[1];

    // Extract og:image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const image = ogImageMatch?.[1];

    // Extract JSON-LD Recipe if present
    let schemaRecipe: any = null;
    const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of jsonLdMatches) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed['@type'] === 'Recipe' || (Array.isArray(parsed['@graph']) && parsed['@graph'].some((item: any) => item['@type'] === 'Recipe'))) {
          schemaRecipe = parsed['@type'] === 'Recipe' ? parsed : parsed['@graph'].find((item: any) => item['@type'] === 'Recipe');
          break;
        }
      } catch {
        // continue
      }
    }

    // Strip script, style, navigation and html tags to get readable text
    let cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Truncate to reasonable token length (~7000 chars)
    if (cleanText.length > 7000) {
      cleanText = cleanText.slice(0, 7000);
    }

    return { title, description, image, rawText: cleanText, schemaRecipe };
  } catch (err) {
    console.warn('Error fetching web page directly:', err);
    return {};
  }
}

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString()
  });
});

// API Route: Extract Recipe from URL, text, or image
app.post('/api/extract-recipe', async (req: Request, res: Response) => {
  try {
    const { url, text, imageBase64, mimeType } = req.body;

    if (!url && !text && !imageBase64) {
      return res.status(400).json({
        error: 'Debes proporcionar una URL, un texto o una imagen para extraer la receta.'
      });
    }

    const ai = getGeminiClient();
    const isYoutube = url && (url.includes('youtube.com') || url.includes('youtu.be'));
    const isInstagram = url && url.includes('instagram.com');
    const isTiktok = url && url.includes('tiktok.com');
    const isFacebook = url && (url.includes('facebook.com') || url.includes('fb.watch'));

    let sourcePlatform = isYoutube
      ? 'youtube'
      : isInstagram
      ? 'instagram'
      : isTiktok
      ? 'tiktok'
      : isFacebook
      ? 'facebook'
      : url
      ? 'web'
      : 'manual';

    let ytId: string | null = null;
    let ytMeta: { title?: string; author_name?: string; thumbnail_url?: string } | null = null;
    let webContent: { title?: string; description?: string; image?: string; rawText?: string; schemaRecipe?: any } = {};

    if (url) {
      if (isYoutube) {
        ytId = extractYouTubeVideoId(url);
        ytMeta = await fetchYouTubeOEmbed(url);
      } else {
        webContent = await fetchWebPageContent(url);
      }
    }

    // Default image candidate
    let chosenImageUrl = '';
    if (ytId) {
      chosenImageUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    } else if (webContent.image) {
      chosenImageUrl = webContent.image;
    } else if (webContent.schemaRecipe?.image) {
      const img = webContent.schemaRecipe.image;
      chosenImageUrl = Array.isArray(img) ? img[0] : typeof img === 'string' ? img : img?.url || '';
    }

    // If Gemini client is NOT available, build structured recipe from fetched metadata
    if (!ai) {
      console.warn('GEMINI_API_KEY not configured. Falling back to parsed web metadata.');
      const fallbackTitle = ytMeta?.title || webContent.title || 'Receta Importada';
      const fallbackAuthor = ytMeta?.author_name || (url ? new URL(url).hostname : 'Cocinero');

      const ingredientsList = webContent.schemaRecipe?.recipeIngredient
        ? (webContent.schemaRecipe.recipeIngredient as string[]).map((ing: string, idx: number) => ({
            id: `i-${idx + 1}`,
            item: ing,
            amount: 1,
            unit: 'al gusto'
          }))
        : [
            { id: 'i-1', item: 'Ingredientes principales según video/enlace', amount: 1, unit: 'unidad', notes: 'Consultar fuente' }
          ];

      const instructionsList = webContent.schemaRecipe?.recipeInstructions
        ? (webContent.schemaRecipe.recipeInstructions as any[]).map((inst: any, idx: number) => ({
            id: `s-${idx + 1}`,
            stepNumber: idx + 1,
            instruction: typeof inst === 'string' ? inst : inst.text || inst.name || `Paso ${idx + 1}`,
            tip: undefined
          }))
        : [
            {
              id: 's-1',
              stepNumber: 1,
              instruction: `Revisa la preparación en la fuente original (${url || 'archivo adjunto'}). Para extracción automática profunda con IA paso a paso, asegúrate de activar tu clave en Ajustes.`,
              tip: 'Puedes editar los ingredientes y pasos manualmente con el botón Editar.'
            }
          ];

      const fallbackRecipe = {
        id: `rec-${Date.now()}`,
        title: fallbackTitle,
        description: webContent.description || `Receta extraída desde ${url || 'fuente local'}.`,
        sourceUrl: url,
        videoUrl: isYoutube ? url : undefined,
        sourcePlatform,
        author: fallbackAuthor,
        prepTimeMinutes: 15,
        cookTimeMinutes: 25,
        totalTimeMinutes: 40,
        servings: 4,
        category: 'Almuerzo/Cena',
        difficulty: 'Media',
        imageUrl: chosenImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        tags: [sourcePlatform.toUpperCase(), 'Cocina Casera'],
        createdAt: new Date().toISOString(),
        ingredients: ingredientsList,
        instructions: instructionsList,
      };

      return res.json(fallbackRecipe);
    }

    // Call Gemini 3.8 Flash to extract and structure the recipe
    let promptContext = '';
    if (url) {
      promptContext += `URL de la receta/video: ${url}\n`;
      promptContext += `Plataforma detectada: ${sourcePlatform}\n`;
      if (ytMeta) {
        promptContext += `Título del video de YouTube: ${ytMeta.title || ''}\n`;
        promptContext += `Canal / Creador: ${ytMeta.author_name || ''}\n`;
      }
      if (webContent.title) {
        promptContext += `Título de la página web: ${webContent.title}\n`;
      }
      if (webContent.description) {
        promptContext += `Descripción web: ${webContent.description}\n`;
      }
      if (webContent.schemaRecipe) {
        promptContext += `Datos Schema.org Recipe encontrados:\n${JSON.stringify(webContent.schemaRecipe, null, 2)}\n`;
      }
      if (webContent.rawText) {
        promptContext += `Contenido de la página:\n${webContent.rawText}\n`;
      }
    }

    if (text) {
      promptContext += `Texto / Transcripción aportada por el usuario:\n${text}\n`;
    }

    const systemInstruction = `Eres un chef profesional experto en gastronomía y extracción de recetas estructuradas.
Tu tarea es analizar los datos proporcionados (enlace, video, web, texto o imagen) y extraer o reconstruir la receta culinaria completa y precisa en ESPAÑOL.

Reglas estrictas:
1. Extrae el título real del plato (ej: "Lasaña Boloñesa Clásica", "Tarta de Queso Vasca La Viña").
2. Si es un video de YouTube, TikTok, Instagram o blog culinario conocido, usa tu conocimiento gastronómico y busca los ingredientes exactos con sus cantidades y unidades métricas (g, ml, cda, cdta, unidad, pizca).
3. Separa cada paso del método de cocción con claridad y añade consejos de chef (tips) útiles.
4. Categorías válidas para 'category': 'Desayuno', 'Almuerzo/Cena', 'Postre', 'Snack', 'Panadería', 'Bebida', 'Otros'.
5. Dificultades válidas para 'difficulty': 'Fácil', 'Media', 'Difícil'.
6. Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura, sin texto adicional ni bloques markdown extra:
{
  "title": "Nombre descriptivo de la receta",
  "description": "Breve sinopsis apetitosa del plato",
  "author": "Nombre del creador o fuente culinaria",
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 30,
  "totalTimeMinutes": 45,
  "servings": 4,
  "category": "Almuerzo/Cena",
  "difficulty": "Fácil",
  "tags": ["Pasta", "Italiana", "Cena Rápida"],
  "ingredients": [
    { "item": "Harina de trigo", "amount": 250, "unit": "g", "notes": "tamizada" }
  ],
  "instructions": [
    { "stepNumber": 1, "instruction": "Descripción detallada del paso...", "tip": "Consejo opcional" }
  ]
}`;

    const contents: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    contents.push({
      text: `Por favor extrae la receta completa y precisa a partir de la siguiente información:\n\n${promptContext}`,
    });

    console.log(`Extracting recipe with Gemini for: ${url || 'text/image'}`);

    let parsedData: any = null;
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting generation with model: ${modelName}`);
        const geminiResponse = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        const responseText = geminiResponse.text || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          parsedData = JSON.parse(responseText.trim());
        }

        if (parsedData && parsedData.title) {
          console.log(`Successfully extracted with ${modelName}: "${parsedData.title}"`);
          break; // Success!
        }
      } catch (geminiErr: any) {
        console.warn(`Model ${modelName} failed:`, geminiErr?.message || geminiErr);
      }
    }

    // If Gemini was unavailable, use rich metadata fallback from YouTube / Web so the user never gets an error
    if (!parsedData) {
      console.warn('Gemini extraction unavailable, falling back to parsed metadata.');
      const fallbackTitle = ytMeta?.title || webContent.title || (url ? 'Receta de ' + new URL(url).hostname : 'Receta Culinaria');
      const fallbackAuthor = ytMeta?.author_name || (url ? new URL(url).hostname : 'Chef');

      const ingredientsList = webContent.schemaRecipe?.recipeIngredient
        ? (webContent.schemaRecipe.recipeIngredient as string[]).map((ing: string, idx: number) => ({
            id: `i-${Date.now()}-${idx + 1}`,
            item: ing,
            amount: 1,
            unit: 'unidad'
          }))
        : [
            { id: `i-${Date.now()}-1`, item: 'Ingredientes según preparación en video/fuente', amount: 1, unit: 'unidad', notes: 'Puedes editar o añadir tus ingredientes' }
          ];

      const instructionsList = webContent.schemaRecipe?.recipeInstructions
        ? (webContent.schemaRecipe.recipeInstructions as any[]).map((inst: any, idx: number) => ({
            id: `s-${Date.now()}-${idx + 1}`,
            stepNumber: idx + 1,
            instruction: typeof inst === 'string' ? inst : inst.text || inst.name || `Paso ${idx + 1}`,
            tip: undefined
          }))
        : [
            {
              id: `s-${Date.now()}-1`,
              stepNumber: 1,
              instruction: `Sigue los pasos mostrados en el visor interactivo de video o en la fuente original (${url || 'archivo'}).`,
              tip: 'Usa el visor para reproducir, pausar y capturar el fotograma deseado.'
            }
          ];

      const fallbackRecipe = {
        id: `rec-${Date.now()}`,
        title: fallbackTitle,
        description: webContent.description || (ytMeta ? `Video de cocina de ${ytMeta.author_name || 'YouTube'}.` : `Receta importada desde ${url || 'fuente local'}.`),
        sourceUrl: url || undefined,
        videoUrl: isYoutube ? url : undefined,
        sourcePlatform,
        author: fallbackAuthor,
        prepTimeMinutes: 15,
        cookTimeMinutes: 20,
        totalTimeMinutes: 35,
        servings: 4,
        category: 'Almuerzo/Cena',
        difficulty: 'Media',
        imageUrl: chosenImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        tags: [sourcePlatform.toUpperCase(), 'Video Culinario'],
        createdAt: new Date().toISOString(),
        ingredients: ingredientsList,
        instructions: instructionsList,
      };

      return res.json(fallbackRecipe);
    }

    // Build the final complete recipe object
    const finalRecipe = {
      id: `rec-${Date.now()}`,
      title: parsedData.title || ytMeta?.title || webContent.title || 'Receta Culinaria',
      description: parsedData.description || webContent.description || 'Receta extraída y procesada con éxito.',
      sourceUrl: url || undefined,
      videoUrl: isYoutube ? url : undefined,
      sourcePlatform,
      author: parsedData.author || ytMeta?.author_name || (url ? new URL(url).hostname : 'Cocinero'),
      prepTimeMinutes: Number(parsedData.prepTimeMinutes) || 15,
      cookTimeMinutes: Number(parsedData.cookTimeMinutes) || 20,
      totalTimeMinutes: (Number(parsedData.prepTimeMinutes) || 15) + (Number(parsedData.cookTimeMinutes) || 20),
      servings: Number(parsedData.servings) || 4,
      category: parsedData.category || 'Almuerzo/Cena',
      difficulty: parsedData.difficulty || 'Media',
      imageUrl: chosenImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      tags: Array.isArray(parsedData.tags) && parsedData.tags.length > 0 ? parsedData.tags : [sourcePlatform.toUpperCase(), 'Receta IA'],
      createdAt: new Date().toISOString(),
      ingredients: Array.isArray(parsedData.ingredients)
        ? parsedData.ingredients.map((ing: any, idx: number) => ({
            id: `i-${Date.now()}-${idx + 1}`,
            item: String(ing.item || ing.name || 'Ingrediente'),
            amount: typeof ing.amount === 'number' ? ing.amount : parseFloat(ing.amount) || 1,
            unit: String(ing.unit || 'unidad'),
            notes: ing.notes ? String(ing.notes) : undefined,
          }))
        : [
            { id: `i-${Date.now()}-1`, item: 'Ingredientes varios según receta', amount: 1, unit: 'unidad' }
          ],
      instructions: Array.isArray(parsedData.instructions)
        ? parsedData.instructions.map((step: any, idx: number) => ({
            id: `s-${Date.now()}-${idx + 1}`,
            stepNumber: step.stepNumber || idx + 1,
            instruction: String(step.instruction || step.step || step.text || ''),
            tip: step.tip ? String(step.tip) : undefined,
          }))
        : [
            { id: `s-${Date.now()}-1`, stepNumber: 1, instruction: 'Seguir los pasos del creador.', tip: undefined }
          ],
    };

    return res.json(finalRecipe);
  } catch (error: any) {
    console.error('Error in /api/extract-recipe:', error);
    return res.status(500).json({
      error: error?.message || 'Error al procesar y extraer la receta con Inteligencia Artificial.'
    });
  }
});

// Vite middleware & Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (dev/production mode ready)`);
  });
}

// Only start the server automatically if not running on Vercel
if (!process.env.VERCEL) {
  startServer();
}

export default app;
