import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("La variable d'environnement API_KEY n'est pas définie.");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });