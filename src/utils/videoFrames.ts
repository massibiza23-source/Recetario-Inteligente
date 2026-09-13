/**
 * Utility to extract keyframes from a local video file using Canvas API
 */
export interface ExtractedFrame {
  timestamp: number;
  dataUrl: string;
}

export interface VideoAnalysisResult {
  duration: number;
  frames: ExtractedFrame[];
  videoBlobUrl: string;
}

export async function extractKeyframesFromVideo(
  videoFile: File,
  numFrames: number = 4
): Promise<VideoAnalysisResult> {
  return new Promise((resolve, reject) => {
    const videoUrl = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;

    let isFinished = false;

    // Timeout safety fallback: never leave UI hanging
    const timeout = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        // Generate placeholder frames if video codec decoding took too long
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 480;
        dummyCanvas.height = 270;
        const dCtx = dummyCanvas.getContext('2d');
        if (dCtx) {
          dCtx.fillStyle = '#f59e0b';
          dCtx.fillRect(0, 0, 480, 270);
          dCtx.fillStyle = '#1c1917';
          dCtx.font = 'bold 20px sans-serif';
          dCtx.fillText('Fotograma de Video', 140, 140);
        }
        const dummyData = dummyCanvas.toDataURL('image/jpeg', 0.8);
        resolve({
          duration: 30,
          frames: [
            { timestamp: 0, dataUrl: dummyData }
          ],
          videoBlobUrl: videoUrl
        });
      }
    }, 6000);

    video.onloadedmetadata = async () => {
      if (isFinished) return;
      const duration = Math.max(1, video.duration || 10);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        clearTimeout(timeout);
        isFinished = true;
        reject(new Error('No se pudo inicializar el contexto de Canvas 2D'));
        return;
      }

      // Maintain aspect ratio with max width 480px to optimize performance and memory
      const naturalWidth = video.videoWidth || 640;
      const naturalHeight = video.videoHeight || 360;
      const scale = Math.min(1, 480 / naturalWidth);
      canvas.width = Math.round(naturalWidth * scale);
      canvas.height = Math.round(naturalHeight * scale);

      const frames: ExtractedFrame[] = [];
      const interval = duration / (numFrames + 1);

      try {
        for (let i = 1; i <= numFrames; i++) {
          const targetTime = interval * i;
          await seekToTime(video, targetTime);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
          frames.push({
            timestamp: Math.round(targetTime),
            dataUrl
          });
        }

        clearTimeout(timeout);
        isFinished = true;
        resolve({
          duration: Math.round(duration),
          frames,
          videoBlobUrl: videoUrl
        });
      } catch (err) {
        clearTimeout(timeout);
        isFinished = true;
        reject(err);
      }
    };

    video.onerror = () => {
      if (isFinished) return;
      clearTimeout(timeout);
      isFinished = true;
      reject(new Error('El formato del video no pudo ser decodificado por el navegador'));
    };
  });
}

function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        video.removeEventListener('seeked', onSeeked);
        resolve();
      }
    };
    const onSeeked = () => finish();
    video.addEventListener('seeked', onSeeked);
    video.currentTime = Math.min(time, Math.max(0, (video.duration || 10) - 0.1));
    // Guard against browsers that do not fire seeked when video is off-screen
    setTimeout(finish, 500);
  });
}
