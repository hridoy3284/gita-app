import { GoogleGenAI, Type } from "@google/genai";
import { Verse } from "../data/gita";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function fetchVerseDetails(chapter: number, verse: number): Promise<Verse | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Fetch Bhagavad Gita Chapter ${chapter}, Verse ${verse}. 
      Provide the Sanskrit Shloka, Transliteration, Bengali Translation, and a simple Bengali Explanation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chapter: { type: Type.NUMBER },
            verse: { type: Type.NUMBER },
            shloka: { type: Type.STRING },
            transliteration: { type: Type.STRING },
            translation: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["chapter", "verse", "shloka", "transliteration", "translation", "explanation"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching verse:", error);
    return null;
  }
}

export async function searchVerses(query: string): Promise<Verse[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search Bhagavad Gita for verses related to: "${query}". 
      Return a list of up to 5 relevant verses with their chapter, verse number, shloka, and Bengali translation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              chapter: { type: Type.NUMBER },
              verse: { type: Type.NUMBER },
              shloka: { type: Type.STRING },
              transliteration: { type: Type.STRING },
              translation: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
          },
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error searching verses:", error);
    return [];
  }
}
