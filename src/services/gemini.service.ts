import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    try {
      // The API key is assumed to be available in the execution environment
      // via `process.env.API_KEY` as per the instructions.
      this.ai = new GoogleGenAI({ apiKey: (process as any).env.API_KEY });
    } catch (e) {
      console.error("Gemini API key not configured or available. The Stargazing Companion will be disabled.", e);
    }
  }

  isConfigured(): boolean {
    return !!this.ai;
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.ai) {
      throw new Error("Gemini Service is not configured. Please provide an API key.");
    }
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are an expert astronomer and stargazing guide. When a user describes something they see in the night sky, identify the celestial object(s) they are likely observing. Provide interesting facts, mythology, and context about what they are seeing. Keep your responses concise, engaging, and suitable for an amateur astronomer. Respond in markdown format, using headings, bold text, and lists where appropriate."
        }
      });

      return response.text;
    } catch (error) {
      console.error("Error generating content with Gemini:", error);
      throw new Error("Failed to get a response from the AI. The cosmic signals might be weak.");
    }
  }
}
