import React from 'react';
import { Clock, Users, Youtube, Instagram, Globe, Video, ArrowUpRight, Film, Share2, Trash2 } from 'lucide-react';
import { Recipe, PlatformType } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onSelect: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isSelected,
  onSelect,
  onShare,
  onDelete
}) => {
  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-3.5 h-3.5 text-red-600" />;
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
      case 'tiktok':
        return <Video className="w-3.5 h-3.5 text-teal-600" />;
      case 'video_upload':
        return <Film className="w-3.5 h-3.5 text-amber-600" />;
      case 'facebook':
        return <Globe className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
        isSelected
          ? 'bg-amber-50/60 border-amber-500 shadow-md ring-2 ring-amber-500/25'
          : 'bg-white hover:bg-stone-50/80 border-stone-200 hover:border-stone-300 shadow-xs hover:shadow-sm'
      }`}
    >
      <div>
        {recipe.imageUrl && (
          <div className="relative h-44 -mx-4 -mt-4 mb-3.5 rounded-t-2xl overflow-hidden bg-stone-100">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-stone-200 shadow-2xs text-[11px] font-semibold text-stone-800">
              {getPlatformIcon(recipe.sourcePlatform)}
              <span className="capitalize">{recipe.sourcePlatform === 'video_upload' ? 'Video' : recipe.sourcePlatform}</span>
            </div>

            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              {recipe.category && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-[11px] font-bold shadow-xs">
                  {recipe.category}
                </span>
              )}
              {onShare && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                  className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-amber-700 flex items-center justify-center shadow-xs transition cursor-pointer"
                  title="Compartir receta"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="w-7 h-7 rounded-full bg-white/90 hover:bg-red-50 text-stone-600 hover:text-red-600 flex items-center justify-center shadow-xs transition cursor-pointer"
                  title="Eliminar receta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {!recipe.imageUrl && (
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-medium">
              {getPlatformIcon(recipe.sourcePlatform)}
              <span className="capitalize">{recipe.sourcePlatform === 'video_upload' ? 'Video' : recipe.sourcePlatform}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {recipe.category && (
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold">
                  {recipe.category}
                </span>
              )}
              {onShare && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                  className="p-1 rounded text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                  title="Compartir receta"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1 rounded text-stone-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Eliminar receta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-1.5 leading-snug">
          {recipe.title}
        </h3>

        {recipe.description && (
          <p className="text-xs text-stone-600 line-clamp-2 mb-3 leading-relaxed">
            {recipe.description}
          </p>
        )}
      </div>

      <div>
        <div className="pt-3 border-t border-stone-150 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-stone-600">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {recipe.totalTimeMinutes || (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) || 20}m
            </span>
            <span className="flex items-center gap-1 font-medium text-stone-600">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              {recipe.servings} raciones
            </span>
          </div>

          <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform">
            Ver receta <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
