
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface PassportExtractionResult {
  isPassport: boolean;
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  birthDate: string;
  expiryDate: string;
  isExpired: boolean;
  needsRenewalNotice: boolean; // صلاحية أقل من 6 أشهر
  confidenceScore: number;
}

/**
 * محرك Aero AI Vision v3.0
 * يقوم بالتحقق الفيزيائي من الجواز واستخراج البيانات بدقة
 */
export const extractPassportData = async (base64Image: string, flightDateISO: string): Promise<PassportExtractionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { 
            text: `بصفتك ضابط حدود رقمي ذكي، حلل هذه الصورة:
            1. تأكد تماماً أن هذه الصورة هي صفحة بيانات جواز سفر (isPassport). إذا كانت صورة شخصية أو منظر طبيعي أو وثيقة أخرى، أرجع isPassport: false.
            2. استخرج بدقة: الاسم الأول (firstName)، اللقب (lastName)، رقم الجواز (passportNumber)، الجنسية (nationality)، تاريخ الميلاد (birthDate)، تاريخ الانتهاء (expiryDate: YYYY-MM-DD).
            3. قارن تاريخ الانتهاء مع تاريخ الرحلة ${flightDateISO}:
               - هل هو منتهي؟ (isExpired).
               - هل المدة المتبقية بين تاريخ الانتهاء وتاريخ الرحلة أقل من 180 يوماً؟ (needsRenewalNotice: true).
            
            أرجع النتيجة بصيغة JSON حصراً.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isPassport: { type: Type.BOOLEAN },
            firstName: { type: Type.STRING },
            lastName: { type: Type.STRING },
            passportNumber: { type: Type.STRING },
            nationality: { type: Type.STRING },
            birthDate: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
            isExpired: { type: Type.BOOLEAN },
            needsRenewalNotice: { type: Type.BOOLEAN },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ['isPassport']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    if (!result.isPassport) {
       throw new Error("الوثيقة المرفوعة ليست جواز سفر صالح. يرجى رفع صفحة البيانات بوضوح.");
    }

    return result;
  } catch (error: any) {
    console.error("Aero Vision AI Failure:", error);
    throw new Error(error.message || "فشل محرك الرؤية في تحليل الوثيقة. حاول مجدداً.");
  }
};
