/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Recipe, RecipeCategory } from './types';
import { INITIAL_RECIPES } from './initialRecipes';
import { Navbar } from './components/Navbar';
import { UrlExtractor } from './components/UrlExtractor';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { CookingModeModal } from './components/CookingModeModal';
import { ShareRecipeModal } from './components/ShareRecipeModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { getYouTubeThumbnailUrl } from './utils/videoHelpers';
import { ExtractedFrame } from './utils/videoFrames';

const STORAGE_KEY = 'recetario_ia_recipes_v1';

function sanitizeRecipe(r: any): Recipe {
  return {
    id: r?.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: r?.title || 'Receta Culinaria',
    description: r?.description || '',
    sourceUrl: r?.sourceUrl || '',
    sourcePlatform: r?.sourcePlatform || 'web',
    videoUrl: r?.videoUrl || undefined,
    author: r?.author,
    prepTimeMinutes: r?.prepTimeMinutes,
    cookTimeMinutes: r?.cookTimeMinutes,
    totalTimeMinutes: r?.totalTimeMinutes,
    servings: typeof r?.servings === 'number' && r.servings > 0 ? r.servings : 4,
    category: r?.category || 'Almuerzo/Cena',
    difficulty: r?.difficulty || 'Media',
    imageUrl: r?.imageUrl,
    tags: Array.isArray(r?.tags) ? r.tags : [],
    notes: r?.notes,
    createdAt: r?.createdAt || new Date().toISOString(),
    ingredients: Array.isArray(r?.ingredients) ? r.ingredients : [],
    instructions: Array.isArray(r?.instructions) ? r.instructions : []
  };
}

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeRecipe);
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_RECIPES;
  });

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const [activeCategory, setActiveCategory] = useState<RecipeCategory | 'Todas'>('Todas');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCookingModeOpen, setIsCookingModeOpen] = useState<boolean>(false);
  const [recipeToShare, setRecipeToShare] = useState<Recipe | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  useEffect(() => {
    try {
      const cleanToSave = recipes.map((r) => ({
        ...r,
        videoUrl: r.videoUrl?.startsWith('blob:') ? undefined : r.videoUrl
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanToSave));
    } catch (e) {
      console.warn('Could not save recipes to localStorage', e);
    }
  }, [recipes]);

  const handleResetRecipes = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setRecipes(INITIAL_RECIPES);
    setSelectedRecipeId(INITIAL_RECIPES[0].id);
    setStatusMessage({
      type: 'success',
      text: 'Recetas restablecidas a la configuración original.'
    });
  };

  const handleDeleteRecipe = (id: string) => {
    const toDelete = recipes.find((r) => r.id === id);
    const updated = recipes.filter((r) => r.id !== id);
    setRecipes(updated);
    if (selectedRecipeId === id) {
      setSelectedRecipeId(updated[0]?.id || '');
    }
    setRecipeToDelete(null);
    setStatusMessage({
      type: 'success',
      text: toDelete ? `Receta "${toDelete.title}" eliminada correctamente.` : 'Receta eliminada correctamente.'
    });
  };

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];

  const filteredRecipes = recipes.filter((r) => {
    if (activeCategory === 'Todas') return true;
    return r.category === activeCategory;
  });

  const handleExtractUrl = async (url: string) => {
    setIsLoading(true);
    setStatusMessage(null);

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      const response = await fetch('/api/extract-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Error del servidor al procesar la receta' }));
        throw new Error(errData.error || `Error ${response.status}: No se pudo extraer la receta.`);
      }

      const newRecipe: Recipe = await response.json();
      setRecipes((prev) => [newRecipe, ...prev]);
      setSelectedRecipeId(newRecipe.id);
      setStatusMessage({
        type: 'success',
        text: `¡Receta "${newRecipe.title}" extraída exitosamente con Inteligencia Artificial!`
      });
    } catch (err: any) {
      console.error('Error al extraer por API:', err);
      setStatusMessage({
        type: 'error',
        text: `No se pudo extraer la receta: ${err?.message || 'Comprueba el enlace e inténtalo de nuevo.'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractText = async (text: string) => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/extract-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Error al procesar el texto' }));
        throw new Error(errData.error || 'No se pudo estructurar el texto');
      }

      const newRecipe: Recipe = await response.json();
      setRecipes((prev) => [newRecipe, ...prev]);
      setSelectedRecipeId(newRecipe.id);
      setStatusMessage({
        type: 'success',
        text: `¡Receta "${newRecipe.title}" organizada y estructurada con IA!`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Error al procesar texto: ${err?.message || 'Revisa el texto ingresado.'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractVideo = async (
    videoFile: File,
    frames: ExtractedFrame[],
    videoBlobUrl: string,
    selectedCoverImage?: string
  ) => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const initialCover = selectedCoverImage || frames[0]?.dataUrl;

      // Send image frame to backend so Gemini 3.8 Flash visual analysis extracts the dish
      if (initialCover && initialCover.startsWith('data:image')) {
        const response = await fetch('/api/extract-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: initialCover,
            text: `Video del usuario: "${videoFile.name}". Analiza el fotograma capturado del plato y extrae la receta completa con ingredientes y pasos en español.`
          })
        });

        if (response.ok) {
          const apiRecipe: Recipe = await response.json();
          const mergedRecipe: Recipe = {
            ...apiRecipe,
            videoUrl: videoBlobUrl,
            sourcePlatform: 'video_upload',
            imageUrl: initialCover,
          };
          setRecipes((prev) => [mergedRecipe, ...prev]);
          setSelectedRecipeId(mergedRecipe.id);
          setStatusMessage({
            type: 'success',
            text: `¡Fotograma analizado por IA! Receta "${mergedRecipe.title}" creada con video vinculado.`
          });
          return;
        }
      }

      // Fallback if vision analysis failed
      const fallbackRecipe: Recipe = {
        id: `rec-vid-${Date.now()}`,
        title: `Receta de Video: ${videoFile.name.replace(/\.[^/.]+$/, '')}`,
        description: `Receta con video adjunto y fotogramas clave analizados.`,
        sourceUrl: '',
        videoUrl: videoBlobUrl,
        sourcePlatform: 'video_upload',
        author: 'Video Culinario',
        prepTimeMinutes: 15,
        cookTimeMinutes: 20,
        totalTimeMinutes: 35,
        servings: 4,
        category: 'Almuerzo/Cena',
        difficulty: 'Media',
        imageUrl: initialCover || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
        tags: ['Video Local', 'Cocina Casera'],
        createdAt: new Date().toISOString(),
        ingredients: [
          { id: 'i-1', item: 'Ingredientes según video', amount: 1, unit: 'unidad', notes: 'Editar en la receta' }
        ],
        instructions: [
          { id: 's-1', stepNumber: 1, instruction: 'Sigue la preparación en el visor de video interactivo.', tip: 'Usa los controles del visor para pausar y capturar fotogramas.' }
        ]
      };
      setRecipes((prev) => [fallbackRecipe, ...prev]);
      setSelectedRecipeId(fallbackRecipe.id);
      setStatusMessage({
        type: 'success',
        text: `¡Video cargado con éxito en el visor con su fotograma inicial!`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Error al procesar el video: ${err?.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRecipe = (updated: Recipe) => {
    setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setStatusMessage({
      type: 'success',
      text: '¡Imagen de portada actualizada exitosamente desde el visor de video!'
    });
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 selection:bg-amber-500 selection:text-stone-950 font-sans">
      {/* Navigation Bar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        recipesCount={recipes.length}
        onResetRecipes={handleResetRecipes}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status notification toast */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 border transition shadow-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="ml-auto text-xs opacity-75 hover:opacity-100 font-medium underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* URL Extractor Area */}
        <UrlExtractor
          onExtractUrl={handleExtractUrl}
          onExtractText={handleExtractText}
          onExtractVideo={handleExtractVideo}
          isLoading={isLoading}
        />

        {/* Main Content Area: Recipes List & Detail View */}
        <div className="space-y-8">
          {/* Active / Selected Recipe Detail */}
          {selectedRecipe ? (
            <RecipeDetail
              recipe={selectedRecipe}
              onStartCookingMode={() => setIsCookingModeOpen(true)}
              onUpdateRecipe={handleUpdateRecipe}
              onDeleteRecipe={handleDeleteRecipe}
            />
          ) : (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl shadow-xs">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-stone-900">No hay recetas guardadas</h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto mt-1">
                Pega una URL arriba para extraer tu primera receta con inteligencia artificial.
              </p>
            </div>
          )}

          {/* Recipe Library Grid */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                Biblioteca Culinaria ({filteredRecipes.length})
              </h2>
              {activeCategory !== 'Todas' && (
                <button
                  onClick={() => setActiveCategory('Todas')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                >
                  Ver todas
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSelected={recipe.id === selectedRecipe?.id}
                  onSelect={() => {
                    setSelectedRecipeId(recipe.id);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  onShare={() => setRecipeToShare(recipe)}
                  onDelete={() => setRecipeToDelete(recipe)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Guided Full-Screen Cooking Mode Modal */}
      {isCookingModeOpen && selectedRecipe && (
        <CookingModeModal
          recipe={selectedRecipe}
          onClose={() => setIsCookingModeOpen(false)}
        />
      )}

      {/* Quick Share Modal from Grid */}
      {recipeToShare && (
        <ShareRecipeModal
          recipe={recipeToShare}
          onClose={() => setRecipeToShare(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {recipeToDelete && (
        <DeleteConfirmModal
          recipe={recipeToDelete}
          onConfirm={() => handleDeleteRecipe(recipeToDelete.id)}
          onCancel={() => setRecipeToDelete(null)}
        />
      )}
    </div>
  );
}
