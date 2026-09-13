import React, { useState } from 'react';
import {
  X,
  Share2,
  Send,
  Mail,
  Copy,
  Check,
  Download,
  Code,
  Eye,
  FileCode2,
  ExternalLink,
  Sparkles,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { Recipe } from '../types';
import {
  formatRecipeText,
  getWhatsAppShareUrl,
  getEmailShareUrl,
  generateInteractiveHtml,
  downloadInteractiveHtmlFile
} from '../utils/shareHelpers';

interface ShareRecipeModalProps {
  recipe: Recipe;
  currentServings?: number;
  onClose: () => void;
}

export const ShareRecipeModal: React.FC<ShareRecipeModalProps> = ({
  recipe,
  currentServings,
  onClose
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  const servings = currentServings || recipe.servings || 4;
  const whatsappUrl = getWhatsAppShareUrl(recipe, servings);
  const emailUrl = getEmailShareUrl(recipe, servings);
  const interactiveHtml = generateInteractiveHtml(recipe, servings);

  const handleCopyText = async () => {
    try {
      const text = formatRecipeText(recipe, servings);
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2200);
    } catch (e) {
      console.error('Error al copiar texto:', e);
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(interactiveHtml);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2200);
    } catch (e) {
      console.error('Error al copiar HTML:', e);
    }
  };

  const handleDownloadHtml = () => {
    downloadInteractiveHtmlFile(recipe, servings);
    setShareSuccess('¡Archivo HTML interactivo descargado!');
    setTimeout(() => setShareSuccess(null), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: formatRecipeText(recipe, servings),
          url: recipe.videoUrl || recipe.sourceUrl || window.location.href
        });
      } catch {
        // User cancelled or failed
      }
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg sm:text-xl">
                Compartir Receta
              </h3>
              <p className="text-xs text-stone-500 truncate max-w-sm sm:max-w-md">
                {recipe.title} • {servings} porciones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {shareSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{shareSuccess}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Direct Sharing Options (WhatsApp, Email, Native) */}
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-3">
              Canales Rápidos
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-950 transition group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Send className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-emerald-950 flex items-center gap-1">
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600 opacity-60" />
                  </div>
                  <span className="text-[11px] text-emerald-800">
                    Enviar con lista y enlace de video
                  </span>
                </div>
              </a>

              {/* Email Button */}
              <a
                href={emailUrl}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-950 transition group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-blue-950 flex items-center gap-1">
                    <span>Correo Electrónico</span>
                    <ExternalLink className="w-3 h-3 text-blue-600 opacity-60" />
                  </div>
                  <span className="text-[11px] text-blue-800">
                    Enviar receta completa formateada
                  </span>
                </div>
              </a>
            </div>

            {/* Native Mobile Share / Copy Text Row */}
            <div className="mt-3 flex flex-wrap gap-2.5">
              {hasNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-stone-600" />
                  <span>Compartir en Apps del Móvil</span>
                </button>
              )}

              <button
                onClick={handleCopyText}
                className="flex-1 min-w-[160px] px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">¡Texto Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-600" />
                    <span>Copiar Texto Formateado</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive HTML Section */}
          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-amber-600" />
                HTML Interactivo Autónomo
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                100% Funcional Offline
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 mb-4">
              <p className="text-xs text-stone-700 leading-relaxed mb-3">
                Genera un archivo web interactivo completo con <strong>escalador de porciones</strong>, <strong>casillas de verificación para ingredientes</strong>, <strong>progreso de pasos paso a paso</strong> y el <strong>reproductor de video</strong> embebido.
              </p>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handleDownloadHtml}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Archivo .HTML</span>
                </button>

                <button
                  onClick={handleCopyHtml}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-300 flex items-center gap-2 transition cursor-pointer shadow-2xs"
                >
                  {copiedHtml ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">¡Código HTML Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Code className="w-4 h-4 text-stone-500" />
                      <span>Copiar Código HTML</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowHtmlPreview(!showHtmlPreview)}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-300 flex items-center gap-2 transition cursor-pointer shadow-2xs ml-auto"
                >
                  <Eye className="w-4 h-4 text-stone-500" />
                  <span>{showHtmlPreview ? 'Ocultar Vista Previa' : 'Previsualizar'}</span>
                </button>
              </div>
            </div>

            {/* Embedded Live Preview of the Interactive HTML */}
            {showHtmlPreview && (
              <div className="mt-4 border border-stone-300 rounded-xl overflow-hidden bg-stone-100">
                <div className="p-2.5 bg-stone-200/80 border-b border-stone-300 flex items-center justify-between text-xs text-stone-600 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-stone-700 font-semibold ml-2">Vista Previa Interactiva</span>
                  </div>
                  <span className="text-[11px] text-stone-500">Prueba los botones de porciones y casillas</span>
                </div>
                <iframe
                  srcDoc={interactiveHtml}
                  title="Vista previa HTML interactivo"
                  className="w-full h-80 bg-white"
                  sandbox="allow-scripts"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
