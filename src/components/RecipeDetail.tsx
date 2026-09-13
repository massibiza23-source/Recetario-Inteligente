import React, { useState } from 'react';
import {
  Clock,
  Users,
  Minus,
  Plus,
  Copy,
  Check,
  Printer,
  ChefHat,
  Lightbulb,
  ExternalLink,
  Flame,
  CheckCircle2,
  Circle,
  Play,
  Video as VideoIcon,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Camera,
  Share2,
  Trash2
} from 'lucide-react';
import { Recipe } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { getYouTubeEmbedUrl } from '../utils/videoHelpers';
import { ShareRecipeModal } from './ShareRecipeModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface RecipeDetailProps {
  recipe: Recipe;
  onStartCookingMode: () => void;
  onUpdateRecipe?: (updated: Recipe) => void;
  onDeleteRecipe?: (id: string) => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onStartCookingMode,
  onUpdateRecipe,
  onDeleteRecipe
}) => {
  const [currentServings, setCurrentServings] = useState<number>(recipe?.servings || 4);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const originalServings = recipe?.servings || 4;
  const ratio = currentServings / originalServings;

  const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const instructions = Array.isArray(recipe?.instructions) ? recipe.instructions : [];

  const youtubeEmbed = getYouTubeEmbedUrl(recipe?.videoUrl || recipe?.sourceUrl);
  const hasDirectVideo = !!recipe?.videoUrl;
  const hasVideo = !!youtubeEmbed || hasDirectVideo;

  const handleServingsChange = (delta: number) => {
    setCurrentServings((prev) => Math.max(1, Math.min(24, prev + delta)));
  };

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateAmount = (amount?: number | null): string => {
    if (amount === undefined || amount === null) return '';
    const scaled = amount * ratio;
    return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1).replace(/\.0$/, '');
  };

  const copyIngredientsToClipboard = () => {
    const text = ingredients
      .map((ing) => {
        const qty = calculateAmount(ing.amount);
        const unit = ing.unit ? ` ${ing.unit}` : '';
        const notes = ing.notes ? ` (${ing.notes})` : '';
        return `• ${qty}${unit} ${ing.item}${notes}`.trim();
      })
      .join('\n');

    const fullShoppingList = `🛒 Lista de Compras: ${recipe.title} (${currentServings} raciones)\n\n${text}`;
    navigator.clipboard.writeText(fullShoppingList).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateCover = (newImageUrl: string) => {
    if (onUpdateRecipe) {
      onUpdateRecipe({
        ...recipe,
        imageUrl: newImageUrl
      });
    }
  };

  const handleUpdateVideoUrl = (newVideoUrl: string) => {
    if (onUpdateRecipe) {
      onUpdateRecipe({
        ...recipe,
        videoUrl: newVideoUrl
      });
    }
  };

  const handleAttachVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blob = URL.createObjectURL(file);
      handleUpdateVideoUrl(blob);
    }
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleUpdateCover(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <article className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-sm">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 bg-stone-50/70 border-b border-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 shadow-2xs">
              {recipe.category || 'General'}
            </span>
            {recipe.difficulty && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                Dificultad: {recipe.difficulty}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Compartir receta por WhatsApp, Email o HTML Interactivo"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Compartir</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-300 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Imprimir receta"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onStartCookingMode}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition shadow-xs hover:shadow cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Modo Cocina</span>
            </button>
            {onDeleteRecipe && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="Eliminar receta"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Eliminar</span>
              </button>
            )}
          </div>
        </div>

        {/* Title and Cover Image Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2 leading-tight">
              {recipe.title}
            </h1>

            {recipe.description && (
              <p className="text-stone-700 text-sm leading-relaxed max-w-3xl mb-4">
                {recipe.description}
              </p>
            )}
          </div>

          {/* Recipe Cover Preview Badge */}
          {recipe.imageUrl && (
            <div className="shrink-0 w-full sm:w-48 bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-stone-100 mb-2 group">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-stone-900/80 text-[10px] font-semibold text-white flex items-center gap-1">
                  <Camera className="w-2.5 h-2.5 text-amber-400" />
                  <span>Portada</span>
                </div>

                <label className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold cursor-pointer gap-1">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Cambiar foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-[11px] text-stone-600 text-center block font-semibold">
                Foto de Portada Actual
              </span>
            </div>
          )}
        </div>

        {/* Recipe Meta Info */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3.5 text-xs text-stone-600 border-t border-stone-200">
          {recipe.author && (
            <div>
              <span className="text-stone-500">Autor: </span>
              <strong className="text-stone-900">{recipe.author}</strong>
            </div>
          )}
          {recipe.prepTimeMinutes && (
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Prep: <strong className="text-stone-900">{recipe.prepTimeMinutes}m</strong></span>
            </div>
          )}
          {recipe.cookTimeMinutes && (
            <div className="flex items-center gap-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Cocción: <strong className="text-stone-900">{recipe.cookTimeMinutes}m</strong></span>
            </div>
          )}
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold hover:underline ml-auto"
            >
              <span>Fuente original</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Enhanced Video Player Section */}
        {hasVideo ? (
          <div className="mt-5 pt-5 border-t border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-amber-600" />
                Visor de Video Culinario y Captura de Portada
              </span>
              <button
                type="button"
                onClick={() => setIsVideoOpen(!isVideoOpen)}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>{isVideoOpen ? 'Ocultar visor' : 'Mostrar visor de video'}</span>
                {isVideoOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isVideoOpen && (
              <VideoPlayer
                videoUrl={recipe.videoUrl}
                sourceUrl={recipe.sourceUrl}
                title={recipe.title}
                currentCoverImage={recipe.imageUrl}
                onUpdateCoverImage={handleUpdateCover}
                onUpdateVideoUrl={handleUpdateVideoUrl}
              />
            )}
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-700 font-medium">
              <VideoIcon className="w-4 h-4 text-amber-600" />
              <span>¿Tienes un video para esta receta? Vincúlalo para activar el visor y la captura de fotogramas.</span>
            </div>
            <label className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs">
              <Camera className="w-3.5 h-3.5" />
              <span>Subir video para capturar portada</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleAttachVideoFile}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Ingredients with Portions Scaler */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
            {/* Servings Scaler */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-xs text-stone-500 font-medium">Porciones calculadas</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span className="text-xl font-extrabold text-stone-900">{currentServings}</span>
                  <span className="text-xs text-stone-500">raciones</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-300 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleServingsChange(-1)}
                  disabled={currentServings <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleServingsChange(1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action to copy shopping list */}
            <div className="flex items-center justify-between py-3">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Ingredientes ({ingredients.length})
              </h2>
              <button
                onClick={copyIngredientsToClipboard}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar lista</span>
                  </>
                )}
              </button>
            </div>

            {/* Ingredients Checklist */}
            <ul className="space-y-2.5 mt-2">
              {ingredients.map((ing) => {
                const isChecked = !!checkedIngredients[ing.id];
                const displayAmount = calculateAmount(ing.amount);

                return (
                  <li
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                      isChecked
                        ? 'bg-stone-100/60 border-stone-200 text-stone-400 line-through'
                        : 'bg-white border-stone-200 text-stone-900 hover:border-amber-300 shadow-2xs'
                    }`}
                  >
                    <div className="pt-0.5">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-400" />
                      )}
                    </div>
                    <div className="text-sm flex-1">
                      <span className="font-bold text-amber-800 mr-1.5">
                        {displayAmount} {ing.unit}
                      </span>
                      <span className="font-medium">{ing.item}</span>
                      {ing.notes && (
                        <span className="block text-xs text-stone-500 italic mt-0.5">
                          {ing.notes}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Right Column: Step-by-Step Instructions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-600" />
              Paso a Paso Cronológico ({instructions.length})
            </h2>
            <span className="text-xs font-semibold text-stone-500">
              {Object.values(completedSteps).filter(Boolean).length} de {instructions.length} completados
            </span>
          </div>

          <div className="space-y-3.5">
            {instructions.map((step) => {
              const isCompleted = !!completedSteps[step.id];

              return (
                <div
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-stone-50 border-stone-200 opacity-70'
                      : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition shadow-2xs ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-stone-950'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : step.stepNumber}
                    </div>

                    <div className="flex-1">
                      <p className={`text-sm leading-relaxed ${isCompleted ? 'text-stone-400' : 'text-stone-800 font-normal'}`}>
                        {step.instruction}
                      </p>

                      {step.tip && (
                        <div className="mt-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200/80 flex items-start gap-2 text-xs text-amber-900">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-amber-800">Consejo del Chef: </strong>
                            <span>{step.tip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareRecipeModal
          recipe={recipe}
          currentServings={currentServings}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && onDeleteRecipe && (
        <DeleteConfirmModal
          recipe={recipe}
          onConfirm={() => {
            setIsDeleteModalOpen(false);
            onDeleteRecipe(recipe.id);
          }}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </article>
  );
};
