import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Recipe } from '../types';

interface DeleteConfirmModalProps {
  recipe: Recipe;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  recipe,
  onConfirm,
  onCancel
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900">
                  ¿Eliminar esta receta?
                </h3>
                <button
                  onClick={onCancel}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Estás a punto de eliminar <strong className="text-stone-900 font-semibold">"{recipe.title}"</strong> de tu biblioteca de recetas. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-stone-150">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Sí, eliminar receta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
