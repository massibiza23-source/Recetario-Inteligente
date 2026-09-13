import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Camera,
  RotateCcw,
  Check,
  ExternalLink,
  Film,
  Video as VideoIcon,
  Layers,
  Upload,
  AlertCircle
} from 'lucide-react';
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  captureFrameFromVideo
} from '../utils/videoHelpers';

interface VideoPlayerProps {
  videoUrl?: string;
  sourceUrl?: string;
  title: string;
  currentCoverImage?: string;
  onUpdateCoverImage: (newImageUrl: string) => void;
  onUpdateVideoUrl?: (newVideoUrl: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  sourceUrl,
  title,
  currentCoverImage,
  onUpdateCoverImage,
  onUpdateVideoUrl
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCapturedFlash, setIsCapturedFlash] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasError, setHasError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveUrl = videoUrl || sourceUrl;
  const youtubeEmbed = getYouTubeEmbedUrl(effectiveUrl);
  const youtubeThumb = getYouTubeThumbnailUrl(effectiveUrl, 'hq');

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);
    setFeedbackMessage(null);
  }, [effectiveUrl]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => setHasError(true));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setHasError(false);
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Capture current video frame using Canvas API
  const handleCaptureCurrentFrame = () => {
    if (!videoRef.current) return;
    const result = captureFrameFromVideo(videoRef.current);
    if (result.success && result.dataUrl) {
      onUpdateCoverImage(result.dataUrl);
      setIsCapturedFlash(true);
      showFeedback('success', '¡Fotograma actual capturado y guardado como portada!');
      setTimeout(() => setIsCapturedFlash(false), 1000);
    } else {
      showFeedback('error', result.error || 'No se pudo capturar el fotograma.');
    }
  };

  // Rewind to 0s and capture start frame
  const handleCaptureInitialFrame = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setTimeout(() => {
      if (videoRef.current) {
        const result = captureFrameFromVideo(videoRef.current);
        if (result.success && result.dataUrl) {
          onUpdateCoverImage(result.dataUrl);
          setIsCapturedFlash(true);
          showFeedback('success', '¡Imagen de inicio (0s) capturada y fijada como portada!');
          setTimeout(() => setIsCapturedFlash(false), 1000);
        } else {
          showFeedback('error', result.error || 'No se pudo capturar el fotograma inicial.');
        }
      }
    }, 200);
  };

  // For YouTube: grab high-res start thumbnail
  const handleSetYouTubeThumbnail = () => {
    if (youtubeThumb) {
      onUpdateCoverImage(youtubeThumb);
      setIsCapturedFlash(true);
      showFeedback('success', '¡Miniatura de inicio de YouTube capturada como portada!');
      setTimeout(() => setIsCapturedFlash(false), 1000);
    } else {
      showFeedback('error', 'No se pudo obtener la miniatura del video de YouTube.');
    }
  };

  // Handle manual video file upload directly into player
  const handleDirectVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    if (onUpdateVideoUrl) {
      onUpdateVideoUrl(blobUrl);
    }
    setHasError(false);
    showFeedback('success', `Video "${file.name}" cargado en el visor.`);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!effectiveUrl && !videoUrl) {
    return (
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center">
        <Film className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-stone-800">Esta receta no tiene un video vinculado.</p>
        <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer transition shadow-2xs">
          <Upload className="w-3.5 h-3.5" />
          <span>Cargar video MP4/WebM</span>
          <input
            type="file"
            accept="video/*"
            onChange={handleDirectVideoUpload}
            className="hidden"
          />
        </label>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 text-stone-100 shadow-md transition-all duration-300 ${
        isTheaterMode ? 'max-w-none w-full my-4' : 'max-w-3xl'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleDirectVideoUpload}
        className="hidden"
      />

      {/* Viewer Header */}
      <div className="px-4 py-2.5 bg-stone-950/90 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-stone-200 font-bold">
          <VideoIcon className="w-4 h-4 text-amber-500" />
          <span>Visor de Video Culinario</span>
          {youtubeEmbed ? (
            <span className="px-2 py-0.5 rounded bg-red-600/25 text-red-300 border border-red-500/40 text-[10px] font-bold">
              YouTube
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              Video HTML5 / Canvas
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Capture cover action */}
          {youtubeEmbed ? (
            <button
              type="button"
              onClick={handleSetYouTubeThumbnail}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                isCapturedFlash
                  ? 'bg-emerald-500 text-stone-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
              title="Guardar miniatura de inicio de YouTube como imagen de portada de la receta"
            >
              {isCapturedFlash ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Portada guardada!</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capturar imagen de inicio</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCaptureInitialFrame}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                title="Ir al segundo 0 y capturar imagen de inicio"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Capturar Inicio (0s)</span>
              </button>

              <button
                type="button"
                onClick={handleCaptureCurrentFrame}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                  isCapturedFlash
                    ? 'bg-emerald-500 text-stone-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                }`}
                title="Capturar fotograma actual como portada"
              >
                {isCapturedFlash ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Fotograma fijado!</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capturar fotograma actual</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mode switch */}
          <button
            type="button"
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
            title={isTheaterMode ? 'Vista compacta' : 'Modo teatro expandido'}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feedback banner inside player */}
      {feedbackMessage && (
        <div
          className={`px-4 py-2 text-xs font-semibold flex items-center justify-between transition ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-600 text-stone-950'
              : 'bg-red-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            OK
          </button>
        </div>
      )}

      {/* Media Display Area */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {youtubeEmbed ? (
          <iframe
            src={youtubeEmbed}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : hasError ? (
          <div className="p-6 text-center text-stone-400">
            <Film className="w-8 h-8 mx-auto mb-2 text-stone-600" />
            <p className="text-sm font-medium">El archivo o transmisión de video no se pudo reproducir.</p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 cursor-pointer transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Cargar video local</span>
              </button>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
                >
                  <span>Abrir enlace</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              crossOrigin="anonymous"
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onError={() => setHasError(true)}
              className="w-full h-full object-contain cursor-pointer"
              onClick={handlePlayPause}
            />

            {/* Flash animation on capture */}
            {isCapturedFlash && (
              <div className="absolute inset-0 bg-white/75 animate-pulse pointer-events-none transition-opacity duration-300 z-10" />
            )}

            {/* Center Big Play Button when paused */}
            {!isPlaying && (
              <button
                type="button"
                onClick={handlePlayPause}
                className="absolute w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-stone-950 flex items-center justify-center transition-all transform hover:scale-105 shadow-xl cursor-pointer"
              >
                <Play className="w-7 h-7 fill-current ml-1" />
              </button>
            )}
          </>
        )}
      </div>

      {/* HTML5 Custom Controls Bar (for non-youtube videos) */}
      {!youtubeEmbed && !hasError && (
        <div className="px-4 py-2.5 bg-stone-950 border-t border-stone-800 flex items-center gap-3 text-stone-300 text-xs">
          <button
            type="button"
            onClick={handlePlayPause}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-200 transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <span className="font-mono text-[11px] text-stone-400 select-none">
            {formatSeconds(currentTime)} / {formatSeconds(duration)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <button
            type="button"
            onClick={handleToggleMute}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 transition cursor-pointer"
            title="Pantalla completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
