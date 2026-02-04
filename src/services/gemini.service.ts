import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";

export const GEMINI_API_KEY = new InjectionToken<string>('GEMINI_API_KEY');

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
  private ai: GoogleGenAI | null = null;

  constructor() {
    // Check for API key from window (set in index.html or injected by hosting)
    const apiKey = (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) || '';
    
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async analyzePlantImage(imageBase64: string): Promise<AnalysisResult> {
    if (!this.ai) {
      throw new Error('Gemini API key is not configured. Please contact the administrator.');
    }

    const prompt = `You are an expert agronomist specializing in South Indian agriculture. Analyze the provided image of a plant leaf/plant. Identify diseases, pest attacks, and nutrient deficiencies. Provide a detailed diagnosis and actionable, step-by-step recommendations for treatment and prevention. Focus on solutions relevant to the South Indian context. Structure your response according to the provided JSON schema. If the image is not a plant or the quality is too poor to analyze, indicate that in the overallHealth summary.`;

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    };

    const textPart = { text: prompt };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallHealth: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, description: "A one-word health status (e.g., 'Healthy', 'Diseased', 'Stressed')." },
                  summary: { type: Type.STRING, description: "A concise, one or two-sentence summary of the plant's condition." },
                },
              },
              detectedIssues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "The common name of the disease, pest, or stressor." },
                    type: { type: Type.STRING, description: "The type of issue: 'Disease', 'Pest', or 'Stress'." },
                    description: { type: Type.STRING, description: "A brief explanation of the issue and its symptoms." },
                  },
                },
              },
              nutrientDeficiencies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nutrient: { type: Type.STRING, description: "The name of the deficient nutrient (e.g., 'Nitrogen', 'Iron')." },
                    symptoms: { type: Type.STRING, description: "The visible symptoms indicating this deficiency." },
                  },
                },
              },
              treatmentRecommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "A descriptive title for the treatment plan." },
                    steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of actionable steps for the treatment." },
                    type: { type: Type.STRING, description: "The category of treatment: 'Organic', 'Chemical', or 'Cultural'." },
                  },
                },
              },
              preventiveMeasures: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of general preventive measures to avoid future issues."
              }
            },
          },
        },
      });

      let jsonStr = response.text.trim();
      const parsedResult: AnalysisResult = JSON.parse(jsonStr);
      return parsedResult;

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to analyze the image. The AI model may be temporarily unavailable.');
    }
  }
}
