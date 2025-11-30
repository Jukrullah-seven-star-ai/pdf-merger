import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: In a real deployment, ensure your API key is secure or use a proxy.
// For client-side demos, this assumes process.env.API_KEY is available.
const apiKey = process.env.API_KEY || ''; 

export const generateSmartFilename = async (contextString: string): Promise<string> => {
  if (!apiKey) {
    console.warn("No API Key found for Gemini. Using default filename.");
    return "merged-document.pdf";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // We use Gemini Flash for speed and efficiency
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I am merging PDF files. Based on this metadata from the first file: "${contextString}", suggest a short, professional filename ending in .pdf. Do not include spaces, use hyphens or underscores. Return ONLY the filename.`,
    });

    const text = response.text;
    if (text) {
        return text.trim().replace(/`/g, '');
    }
    return "merged-document.pdf";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "merged-document.pdf";
  }
};