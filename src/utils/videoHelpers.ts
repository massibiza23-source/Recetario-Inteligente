/**
 * Comprehensive video and YouTube helpers for cooking recipes
 */

export function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const cleanUrl = url.trim();
    // Matches:
    // - youtube.com/watch?v=ID
    // - youtube.com/shorts/ID
    // - youtube.com/embed/ID
    // - youtu.be/ID
    // - m.youtube.com/watch?v=ID
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = cleanUrl.match(regExp);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(url?: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1` : null;
}

export function getYouTubeThumbnailUrl(url?: string, quality: 'maxres' | 'hq' = 'hq'): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return quality === 'maxres'
    ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export interface CaptureResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

/**
 * Captures current frame from an HTMLVideoElement into a compressed base64 JPEG Data URL
 * Constrained to a max width of 640px to ensure it fits comfortably in localStorage (<60KB)
 */
export function captureFrameFromVideo(video: HTMLVideoElement, maxWidth: number = 640): CaptureResult {
  try {
    if (!video) {
      return { success: false, error: 'Elemento de video no disponible' };
    }

    const naturalWidth = video.videoWidth || 640;
    const naturalHeight = video.videoHeight || 360;

    if (naturalWidth === 0 || naturalHeight === 0) {
      return { success: false, error: 'El video no ha cargado sus dimensiones. Reproduce o espera 1 segundo.' };
    }

    const canvas = document.createElement('canvas');
    const scale = Math.min(1, maxWidth / naturalWidth);
    canvas.width = Math.round(naturalWidth * scale);
    canvas.height = Math.round(naturalHeight * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { success: false, error: 'No se pudo crear el lienzo Canvas 2D' };
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

    return {
      success: true,
      dataUrl
    };
  } catch (err: any) {
    console.error('Error al capturar fotograma de video:', err);
    if (err?.name === 'SecurityError') {
      return {
        success: false,
        error: 'El video proviene de un servidor externo que restringe la captura directa de fotogramas por CORS.'
      };
    }
    return {
      success: false,
      error: err?.message || 'Error desconocido al capturar el fotograma'
    };
  }
}
