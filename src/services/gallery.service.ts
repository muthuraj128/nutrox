import { Injectable } from '@angular/core';
import { AnalysisResult } from './gemini.service';

export interface GalleryItem {
  id: number;
  date: string;
  imageBase64: string;
  analysisResult: AnalysisResult;
  thumbnailBase64: string;
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly STORAGE_KEY = 'plant_analysis_gallery';

  getGalleryItems(): GalleryItem[] {
    const itemsJson = localStorage.getItem(this.STORAGE_KEY);
    return itemsJson ? JSON.parse(itemsJson) : [];
  }

  async addGalleryItem(imageBase64: string, analysisResult: AnalysisResult): Promise<void> {
    const thumbnailBase64 = await this.createThumbnail(imageBase64);
    const newItem: GalleryItem = {
      id: Date.now(),
      date: new Date().toISOString(),
      imageBase64,
      analysisResult,
      thumbnailBase64
    };
    const items = this.getGalleryItems();
    items.unshift(newItem); // Add to the beginning for chronological order
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  deleteGalleryItem(id: number): void {
    let items = this.getGalleryItems();
    items = items.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  private createThumbnail(imageBase64: string, maxWidth = 150, maxHeight = 150): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${imageBase64}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg').split(',')[1]);
      };
      img.onerror = () => {
        // Fallback to original if something goes wrong
        resolve(imageBase64);
      };
    });
  }
}
