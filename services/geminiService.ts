/**
 * خدمة Gemini AI للذكاء الاصطناعي
 * Service Gemini AI pour l'intelligence artificielle
 * 
 * الغرض: توفير واجهة للتفاعل مع Google Gemini AI
 * But: Fournir une interface pour interagir avec Google Gemini AI
 * 
 * المؤلف: Assistant de Développement
 * Auteur: Assistant de Développement
 * تاريخ الإنشاء: 17 juillet 2025
 * Date de création: 17 juillet 2025
 * آخر تعديل: 17 juillet 2025
 * Dernière modification: 17 juillet 2025
 */

import { GoogleGenAI } from "@google/genai";

// التحقق من وجود مفتاح API في متغيرات البيئة
// Vérification de la présence de la clé API dans les variables d'environnement
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  console.error("⚠️ مفتاح API غير موجود في متغيرات البيئة");
  console.error("⚠️ Clé API manquante dans les variables d'environnement");
  console.error("💡 تأكد من إضافة GEMINI_API_KEY في ملف .env");
  console.error("💡 Assurez-vous d'ajouter GEMINI_API_KEY dans le fichier .env");
  throw new Error("مفتاح API مطلوب للعمل مع Gemini AI - API key required for Gemini AI");
}

// إنشاء مثيل من Google Generative AI
// Création d'une instance de Google Generative AI
export const ai = new GoogleGenAI({ apiKey });

// دالة للتحقق من صحة الاتصال
// Fonction pour vérifier la validité de la connexion
export const validateConnection = async (): Promise<boolean> => {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    await model.generateContent("اختبار الاتصال");
    return true;
  } catch (error) {
    console.error("فشل في الاتصال مع Gemini AI:", error);
    console.error("Échec de connexion avec Gemini AI:", error);
    return false;
  }
};

// دالة لإنشاء محادثة آمنة
// Fonction pour créer une conversation sécurisée
export const createSafeChat = async (systemPrompt?: string) => {
  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7, // توازن بين الإبداع والدقة
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    const chat = model.startChat({
      history: systemPrompt ? [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "model", 
          parts: [{ text: "مرحباً! أنا مساعدك الذكي وجاهز لمساعدتك." }]
        }
      ] : []
    });

    return chat;
  } catch (error) {
    console.error("خطأ في إنشاء المحادثة:", error);
    console.error("Erreur lors de la création de la conversation:", error);
    throw error;
  }
};