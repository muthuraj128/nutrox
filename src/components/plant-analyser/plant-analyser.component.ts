import { Component, ChangeDetectionStrategy, signal, inject, ViewChild, ElementRef, OnDestroy, output, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, AnalysisResult } from '../../services/gemini.service';
import { Deficiency } from '../../models';
import { GalleryService, GalleryItem } from '../../services/gallery.service';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';

type View = 'idle' | 'camera' | 'preview' | 'analyzing' | 'result' | 'error' | 'gallery';

@Component({
  selector: 'app-plant-analyser',
  templateUrl: './plant-analyser.component.html',
  styleUrls: ['./plant-analyser.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ImageGalleryComponent]
})
export class PlantAnalyserComponent implements OnDestroy, OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  generateFertilizer = output<Deficiency[]>();

  private geminiService = inject(GeminiService);
  private galleryService = inject(GalleryService);
  private stream: MediaStream | null = null;

  view = signal<View>('idle');
  imageBase64 = signal<string | null>(null);
  analysisResult = signal<AnalysisResult | null>(null);
  errorMessage = signal<string | null>(null);
  cameraError = signal<string | null>(null);
  galleryItems = signal<GalleryItem[]>([]);
  
  hasNpkDeficiency = computed(() => {
    const result = this.analysisResult();
    if (!result || !result.nutrientDeficiencies) return false;
    
    const lowerCaseNutrients = result.nutrientDeficiencies.map(d => d.nutrient.toLowerCase());
    return lowerCaseNutrients.includes('nitrogen') ||
           lowerCaseNutrients.includes('phosphorus') ||
           lowerCaseNutrients.includes('potassium');
  });

  ngOnInit(): void {
    this.galleryItems.set(this.galleryService.getGalleryItems());
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
  
  async startCamera(): Promise<void> {
    this.resetStateForNewImage();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer rear camera
            });
            this.videoElement.nativeElement.srcObject = this.stream;
            this.view.set('camera');
        } catch (err: any) {
            console.error("Error accessing camera: ", err);
            this.cameraError.set("Could not access the camera. Please ensure you have granted permission and are using a secure (HTTPS) connection.");
        }
    } else {
        this.cameraError.set("Camera access is not supported by your browser.");
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.stream = null;
    if (this.videoElement) {
       this.videoElement.nativeElement.srcObject = null;
    }
    if(this.view() === 'camera') {
        this.view.set('idle');
    }
  }

  capturePhoto(): void {
    if (this.view() !== 'camera') return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    const base64String = dataUrl.split(',')[1];
    
    this.imageBase64.set(base64String);
    this.stopCamera();
    this.view.set('preview');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.resetStateForNewImage();
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = (e.target?.result as string).split(',')[1];
        this.imageBase64.set(base64String);
        this.view.set('preview');
      };
      reader.readAsDataURL(file);
    }
  }

  async analyzeImage(): Promise<void> {
    const currentImage = this.imageBase64();
    if (!currentImage) return;

    this.view.set('analyzing');
    this.errorMessage.set(null);

    try {
      const result = await this.geminiService.analyzePlantImage(currentImage);
      this.analysisResult.set(result);
      await this.galleryService.addGalleryItem(currentImage, result);
      this.galleryItems.set(this.galleryService.getGalleryItems());
      this.view.set('result');
    } catch (error: any) {
      const message = error.message || 'An unknown error occurred.';
      if (message.includes('API key')) {
        this.errorMessage.set('Gemini API key is not configured. Please set your API key in index.html.');
      } else {
        this.errorMessage.set(message);
      }
      this.view.set('error');
    }
  }

  reset(): void {
    this.stopCamera();
    this.view.set('idle');
    this.imageBase64.set(null);
    this.analysisResult.set(null);
    this.errorMessage.set(null);
    this.cameraError.set(null);
  }

  showGallery(): void {
    this.view.set('gallery');
  }

  handleViewFromGallery(item: GalleryItem): void {
    this.imageBase64.set(item.imageBase64);
    this.analysisResult.set(item.analysisResult);
    this.view.set('result');
  }

  handleReanalyzeFromGallery(item: GalleryItem): void {
    this.imageBase64.set(item.imageBase64);
    this.analysisResult.set(null);
    this.analyzeImage();
  }

  handleDeleteFromGallery(id: number): void {
    this.galleryService.deleteGalleryItem(id);
    this.galleryItems.set(this.galleryService.getGalleryItems());
  }

  onGenerateFertilizer(): void {
    const result = this.analysisResult();
    if (!result) return;

    const npkMapping: { [key: string]: 'N' | 'P' | 'K' } = {
      'nitrogen': 'N',
      'phosphorus': 'P',
      'potassium': 'K'
    };

    const deficiencies: Deficiency[] = result.nutrientDeficiencies
      .map(def => {
        const key = def.nutrient.toLowerCase();
        if (npkMapping[key]) {
          return {
            nutrient: npkMapping[key],
            level: 'Deficient', // Assign a default level from analysis
            weight: 1           // Assign a default weight
          };
        }
        return null;
      })
      .filter((d): d is Deficiency => d !== null);

    if (deficiencies.length > 0) {
      this.generateFertilizer.emit(deficiencies);
    }
  }

  private resetStateForNewImage(): void {
    this.analysisResult.set(null);
    this.errorMessage.set(null);
    this.cameraError.set(null);
    this.imageBase64.set(null);
  }
}
