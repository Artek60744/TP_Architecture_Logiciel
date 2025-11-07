import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenshotService } from '../screenshot.service';

@Component({
  selector: 'app-screenshot-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './screenshot-button.component.html',
  styleUrl: './screenshot-button.component.css'
})
export class ScreenshotButtonComponent {
  imageDataUrl: string | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  savedPath: string | null = null;

  constructor(private ss: ScreenshotService) {}

  async onCapture() {
    this.loading = true;
    this.error = null;
    this.successMessage = null;
    this.savedPath = null;
    
    try {
      this.imageDataUrl = await this.ss.capture();
    } catch (err: any) {
      this.error = err?.message || 'Erreur lors de la capture';
      this.imageDataUrl = null;
    } finally {
      this.loading = false;
    }
  }

  async onDownload() {
    if (!this.imageDataUrl) return;
    this.successMessage = null;
    this.savedPath = null;
    try {
      const saveResult = await this.ss.save(this.imageDataUrl);
      if (saveResult.saved) {
        this.successMessage = 'Screenshot sauvegardé avec succès!';
        if (saveResult.path) {
          this.savedPath = saveResult.path;
        }
      } else if (saveResult.error) {
        this.error = `Erreur lors de la sauvegarde: ${saveResult.error}`;
      }
    } catch (err: any) {
      this.error = err?.message || 'Erreur lors de la sauvegarde';
    }
  }

  onEdit() {
    // Action d'édition à implémenter plus tard
    alert('Fonctionnalité édition à venir !');
  }
}
