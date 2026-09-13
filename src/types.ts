export type PlatformType = 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'web' | 'manual' | 'video_upload';
export type RecipeCategory = 'Desayuno' | 'Almuerzo/Cena' | 'Postre' | 'Snack' | 'Panadería' | 'Bebida' | 'Otros';
export type RecipeDifficulty = 'Fácil' | 'Media' | 'Difícil';

export interface Ingredient {
  id: string;
  item: string;
  amount?: number | null;
  unit?: string;
  notes?: string;
  checked?: boolean;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  tip?: string;
  completed?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  sourceUrl: string;
  sourcePlatform: PlatformType;
  videoUrl?: string;
  author?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  servings: number;
  category: RecipeCategory;
  difficulty?: RecipeDifficulty;
  ingredients: Ingredient[];
  instructions: RecipeStep[];
  imageUrl?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
}
