import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Timer, ChefHat, Check, Lightbulb } from 'lucide-react';
import { Recipe } from '../types';

interface CookingModeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  onClose
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const steps = Array.isArray(recipe?.instructions) && recipe.instructions.length > 0
    ? recipe.instructions
    : [{ id: 'step-fallback', stepNumber: 1, instruction: 'Preparar y servir la receta según ingredientes indicados.' }];
  const currentStep = steps[currentStepIndex] || steps[0];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTime = (secs: number) => {
    setTimerSeconds((prev) => Math.max(0, prev + secs));
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-50 flex flex-col text-stone-900 overflow-hidden">
      {/* Top bar */}
      <header className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-white backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-bold shadow-xs">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-stone-900 line-clamp-1">{recipe.title}</h2>
            <p className="text-xs font-semibold text-stone-500">
              Paso {currentStepIndex + 1} de {steps.length}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition cursor-pointer border border-stone-200"
          title="Cerrar modo cocina"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Progress bar */}
      <div className="w-full bg-stone-200 h-2">
        <div
          className="bg-amber-500 h-2 transition-all duration-350"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-12 flex flex-col justify-between overflow-y-auto">
        <div className="my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            Fase de Cocina • Paso {currentStep?.stepNumber}
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-stone-900 leading-snug tracking-tight">
            {currentStep?.instruction}
          </h3>

          {currentStep?.tip && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5 text-stone-800 shadow-2xs">
              <Lightbulb className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-amber-900 block text-sm mb-1">Consejo del Chef:</span>
                <p className="text-sm text-stone-700 leading-relaxed font-medium">{currentStep.tip}</p>
              </div>
            </div>
          )}

          {/* Integrated Quick Timer Widget */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs inline-flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-stone-700 text-xs font-bold uppercase tracking-wider">
              <Timer className="w-4 h-4 text-amber-600" />
              <span>Temporizador:</span>
            </div>
            <div className="text-3xl font-mono font-extrabold text-amber-700">
              {formatTimer(timerSeconds)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? 'Pausar' : 'Iniciar'}</span>
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(300);
                }}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition cursor-pointer"
                title="Reiniciar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => addTime(60)}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 cursor-pointer"
              >
                +1 min
              </button>
            </div>
          </div>
        </div>

        {/* Navigation bottom controls */}
        <div className="pt-6 border-t border-stone-200 flex items-center justify-between gap-4 mt-8">
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 disabled:opacity-40 disabled:pointer-events-none text-stone-800 font-bold text-sm transition cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Paso Anterior</span>
          </button>

          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm transition shadow-sm hover:shadow cursor-pointer"
            >
              <span>Siguiente Paso</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition shadow-sm hover:shadow cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>¡Receta Completada!</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
