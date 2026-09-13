import React from 'react';
import { ChefHat, BookOpen, Sparkles, RotateCcw } from 'lucide-react';
import { RecipeCategory } from '../types';

interface NavbarProps {
  activeCategory: RecipeCategory | 'Todas';
  onSelectCategory: (cat: RecipeCategory | 'Todas') => void;
  recipesCount: number;
  onResetRecipes?: () => void;
}

const CATEGORIES: (RecipeCategory | 'Todas')[] = [
  'Todas',
  'Almuerzo/Cena',
  'Desayuno',
  'Postre',
  'Snack',
  'Panadería',
  'Bebida',
  'Otros'
];

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  recipesCount,
  onResetRecipes
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-stone-900 border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-stone-950 shadow-sm">
              <ChefHat className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-stone-900">Recetario Inteligente</span>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" /> IA
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">Extractor culinario multi-plataforma & gestor de cocina</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-100/90 px-3 py-1.5 rounded-lg border border-stone-200">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span><strong className="text-stone-900">{recipesCount}</strong> recetas guardadas</span>
            </div>

            {onResetRecipes && (
              <button
                type="button"
                onClick={onResetRecipes}
                title="Restablecer recetas originales si hay algún error"
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 border border-stone-200 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar border-t border-stone-100 text-xs">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
