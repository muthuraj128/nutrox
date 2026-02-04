import { Injectable } from '@angular/core';

export interface AnalysisResult {
  overallHealth: {
    status: string;
    summary: string;
  };
  detectedIssues: {
    name: string;
    type: 'Disease' | 'Pest' | 'Stress';
    description: string;
  }[];
  nutrientDeficiencies: {
    nutrient: string;
    symptoms: string;
  }[];
  treatmentRecommendations: {
    title: string;
    steps: string[];
    type: 'Organic' | 'Chemical' | 'Cultural';
  }[];
  preventiveMeasures: string[];
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  // API endpoint - uses relative path for Vercel serverless function
  private apiEndpoint = '/api/analyze-plant';

  constructor() {}

  async analyzePlantImage(imageBase64: string): Promise<AnalysisResult> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze the image');
      }

      const result: AnalysisResult = await response.json();
      return result;

    } catch (error) {
      console.error('Error calling analysis API:', error);
      throw new Error('Failed to analyze the image. The service may be temporarily unavailable.');
    }
  }
}
