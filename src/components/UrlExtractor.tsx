import React, { useState, useRef } from 'react';
import {
  Link2,
  Sparkles,
  Youtube,
  Instagram,
  Globe,
  Video,
  Loader2,
  ArrowRight,
  Upload,
  Camera,
  Film,
  Clock,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { PlatformType } from '../types';
import { extractKeyframesFromVideo, ExtractedFrame } from '../utils/videoFrames';

interface UrlExtractorProps {
  onExtractUrl: (url: string) => Promise<void>;
  onExtractText?: (text: string) => Promise<void>;
  onExtractVideo?: (
    videoFile: File,
    frames: ExtractedFrame[],
    videoBlobUrl: string,
    selectedCoverImage?: string
  ) => Promise<void>;
  isLoading: boolean;
}

export const UrlExtractor: React.FC<UrlExtractorProps> = ({
  onExtractUrl,
  onExtractText,
  onExtractVideo,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'video'>('url');
  const [inputUrl, setInputUrl] = useState('');
  const [inputText, setInputText] = useState('');

  // Local video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(0);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectPlatform = (url: string): PlatformType => {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('instagram.com')) return 'instagram';
    if (lower.includes('tiktok.com')) return 'tiktok';
    if (lower.includes('facebook.com') || lower.includes('fb.watch')) return 'facebook';
    return 'web';
  };

  const detected = inputUrl ? detectPlatform(inputUrl) : null;

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isLoading) return;
    let clean = inputUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    onExtractUrl(clean);
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || !onExtractText) return;
    onExtractText(inputText.trim());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    setIsExtractingFrames(true);
    setExtractedFrames([]);
    setSelectedFrameIndex(0);

    try {
      const result = await extractKeyframesFromVideo(file, 4);
      setExtractedFrames(result.frames);
      setVideoBlobUrl(result.videoBlobUrl);
    } catch (err) {
      console.error('Error al analizar fotogramas de video:', err);
    } finally {
      setIsExtractingFrames(false);
    }
  };

  const handleProcessVideo = async () => {
    if (!videoFile || !onExtractVideo || isLoading) return;
    const chosenCover = extractedFrames[selectedFrameIndex]?.dataUrl || extractedFrames[0]?.dataUrl;
    await onExtractVideo(videoFile, extractedFrames, videoBlobUrl || '', chosenCover);
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-7 shadow-sm mb-8">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-stone-150">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Extractor Universal de Recetas con IA
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Analiza enlaces de redes sociales (YouTube, Instagram, TikTok), texto/notas o sube videos con captura de fotograma.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Pegar Enlace</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Pegar Texto</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'video'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-amber-600" />
            <span>Subir Video y Capturar</span>
          </button>
        </div>
      </div>

      {activeTab === 'url' ? (
        <>
          <div className="flex items-center gap-2 text-stone-600 text-xs mb-3 flex-wrap">
            <span className="text-stone-400 font-medium">Compatible con:</span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-50 border border-stone-200 text-stone-700">
              <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-50 border border-stone-200 text-stone-700">
              <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram Reels
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-50 border border-stone-200 text-stone-700">
              <Video className="w-3.5 h-3.5 text-teal-600" /> TikTok
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-50 border border-stone-200 text-stone-700">
              <Globe className="w-3.5 h-3.5 text-blue-500" /> Blogs y Webs Culinarias
            </span>
          </div>

          <form onSubmit={handleSubmitUrl} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Link2 className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Pega aquí la URL (ej: https://www.youtube.com/watch?v=... o receta web)"
                required
                disabled={isLoading}
                className="w-full pl-11 pr-24 py-3 bg-stone-50 hover:bg-white focus:bg-white text-stone-900 placeholder-stone-400 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-sm transition shadow-2xs font-medium"
              />
              {detected && (
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-stone-100 text-amber-700 border border-stone-200">
                    {detected}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-sm transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extrayendo con IA...</span>
                </>
              ) : (
                <>
                  <span>Extraer Receta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick sample URLs */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span className="text-stone-400 font-medium">Ejemplos de prueba:</span>
            <button
              type="button"
              onClick={() => setInputUrl('https://www.youtube.com/watch?v=3AAdEl33DyM')}
              className="text-stone-600 hover:text-amber-600 underline underline-offset-2 transition cursor-pointer"
            >
              YouTube Video
            </button>
            <span className="text-stone-300">•</span>
            <button
              type="button"
              onClick={() => setInputUrl('https://www.bonappetit.com/recipe/classic-carbonara')}
              className="text-stone-600 hover:text-amber-600 underline underline-offset-2 transition cursor-pointer"
            >
              Receta Carbonara Web
            </button>
          </div>
        </>
      ) : activeTab === 'text' ? (
        /* Text/Transcript Extraction Tab */
        <form onSubmit={handleSubmitText} className="space-y-3">
          <p className="text-xs text-stone-600">
            ¿Tienes la receta en texto, la transcripción de un video o el texto del pie de foto de Instagram/TikTok? Pégalo aquí para que la IA extraiga los ingredientes, cantidades y pasos estructurados:
          </p>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ejemplo: Para hacer panqueques necesitas 200g de harina, 2 huevos, 250ml de leche, 1 cucharada de azúcar y una pizca de sal. Mezcla todo en un bol y cocina en sartén caliente 2 minutos por lado..."
            rows={4}
            disabled={isLoading}
            className="w-full p-3.5 bg-stone-50 hover:bg-white focus:bg-white text-stone-900 placeholder-stone-400 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-sm transition font-normal"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Estructurando receta...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Estructurar con IA</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Video Upload & Canvas Keyframe Extractor Tab */
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!videoFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl p-8 text-center cursor-pointer transition bg-stone-50 hover:bg-amber-50/20"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-stone-900">
                Haz clic para subir un video o grabar con la cámara
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Formatos compatibles: MP4, WebM, MOV. Extrae fotogramas y selecciona la imagen de inicio como portada.
              </p>
            </div>
          ) : (
            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-stone-900">{videoFile.name}</span>
                  <span className="text-xs text-stone-500">
                    ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                >
                  Cambiar video
                </button>
              </div>

              {/* Extracted Frames Visualizer with Cover Selection */}
              <div>
                <div className="flex items-center justify-between text-xs text-stone-600 mb-2.5">
                  <span className="font-semibold flex items-center gap-1.5 text-stone-800">
                    <Camera className="w-3.5 h-3.5 text-amber-600" />
                    Fotogramas clave extraídos (Haz clic para elegir la imagen de portada):
                  </span>
                  {isExtractingFrames && (
                    <span className="text-amber-700 flex items-center gap-1 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analizando video...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {extractedFrames.map((frame, idx) => {
                    const isSelected = selectedFrameIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedFrameIndex(idx)}
                        className={`relative rounded-xl overflow-hidden border-2 bg-stone-200 aspect-video group cursor-pointer transition shadow-xs ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-500/30'
                            : 'border-stone-300 hover:border-amber-400'
                        }`}
                      >
                        <img
                          src={frame.dataUrl}
                          alt={`Fotograma ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-stone-900/80 text-[10px] font-mono text-white flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-amber-400" /> {frame.timestamp}s
                        </span>

                        {isSelected ? (
                          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <CheckCircle className="w-3 h-3" />
                            <span>Portada</span>
                          </div>
                        ) : (
                          <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 rounded-full bg-stone-900/80 text-white text-[10px] font-medium flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5" />
                            <span>Elegir portada</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-stone-500 font-medium hidden sm:inline-block">
                  ✓ El fotograma a los <strong>{extractedFrames[selectedFrameIndex]?.timestamp || 0}s</strong> será guardado como imagen de inicio.
                </span>
                <button
                  type="button"
                  onClick={handleProcessVideo}
                  disabled={isLoading || isExtractingFrames || extractedFrames.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition shadow-xs disabled:opacity-50 cursor-pointer ml-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extrayendo Receta por IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generar Receta con Esta Portada</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
