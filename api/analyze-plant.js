import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert agronomist specializing in South Indian agriculture. Analyze the provided image of a plant leaf/plant. Identify diseases, pest attacks, and nutrient deficiencies. Provide a detailed diagnosis and actionable, step-by-step recommendations for treatment and prevention. Focus on solutions relevant to the South Indian context. Structure your response according to the provided JSON schema. If the image is not a plant or the quality is too poor to analyze, indicate that in the overallHealth summary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            overallHealth: {
              type: 'OBJECT',
              properties: {
                status: { type: 'STRING', description: "A one-word health status (e.g., 'Healthy', 'Diseased', 'Stressed')." },
                summary: { type: 'STRING', description: "A concise, one or two-sentence summary of the plant's condition." },
              },
            },
            detectedIssues: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING', description: "The common name of the disease, pest, or stressor." },
                  type: { type: 'STRING', description: "The type of issue: 'Disease', 'Pest', or 'Stress'." },
                  description: { type: 'STRING', description: "A brief explanation of the issue and its symptoms." },
                },
              },
            },
            nutrientDeficiencies: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  nutrient: { type: 'STRING', description: "The name of the deficient nutrient (e.g., 'Nitrogen', 'Iron')." },
                  symptoms: { type: 'STRING', description: "The visible symptoms indicating this deficiency." },
                },
              },
            },
            treatmentRecommendations: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING', description: "A descriptive title for the treatment plan." },
                  steps: { type: 'ARRAY', items: { type: 'STRING' }, description: "A list of actionable steps for the treatment." },
                  type: { type: 'STRING', description: "The category of treatment: 'Organic', 'Chemical', or 'Cultural'." },
                },
              },
            },
            preventiveMeasures: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: "A list of general preventive measures to avoid future issues."
            }
          },
        },
      },
    });

    const result = JSON.parse(response.text.trim());
    return res.status(200).json(result);

  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'Failed to analyze the image' });
  }
}
