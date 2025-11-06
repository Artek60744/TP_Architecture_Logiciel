import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScreenshotService {

  // Retourne une Data URL string
  async capture(): Promise<string> {
    // Si Electron API exposée par preload
    const win: any = window as any;
    if (win?.electronAPI?.captureScreen) {
      // electronAPI.captureScreen devrait renvoyer une dataURL (base64)
      return win.electronAPI.captureScreen();
    }

    // Fallback navigateur : getDisplayMedia
    if (navigator.mediaDevices && (navigator.mediaDevices as any).getDisplayMedia) {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      try {
          const image = await this._captureFrameFromStream(stream);
          return image;
      } finally {
          // ensure stop (typed parameter to satisfy --noImplicitAny)
          stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      }
    }

    throw new Error('Capture d\'écran non supportée dans cet environnement.');
  }

  private _captureFrameFromStream(stream: MediaStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.style.position = 'fixed';
      video.style.left = '-10000px';
      video.autoplay = true;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };
      video.onerror = (e) => reject(e);
    });
  }

  /**
   * Save a data URL screenshot using the Electron main process when available.
   * Returns an object with saved:boolean and optional path or error.
   */
  async save(dataUrl: string): Promise<{ saved: boolean; path?: string; error?: string }> {
    const win: any = window as any;
    if (win?.electronAPI?.saveScreenshot) {
      try {
        return await win.electronAPI.saveScreenshot(dataUrl);
      } catch (err: any) {
        return { saved: false, error: err?.message || String(err) };
      }
    }

    // Fallback for browser: trigger a download via anchor
    try {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return { saved: true };
    } catch (err: any) {
      return { saved: false, error: err?.message || String(err) };
    }
  }
}
