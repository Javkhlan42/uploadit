import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAJHQ7jY4Um0TfiOT86cgsf049fH_RCUb4';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate embedding vector for a text query
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(query);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating query embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate AI response using RAG pattern
 */
export async function generateAIResponse(
  question: string,
  businesses: any[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Format businesses as JSON context
    const businessesJson = JSON.stringify(businesses.map(b => ({
      name: b.businessName,
      category: b.category,
      city: b.city,
      state: b.state,
      address: b.address,
      phone: b.phoneNumber,
      description: b.description,
      website: b.website
    })), null, 2);
    
    // RAG Prompt - strictly following the design
    const prompt = `Та Yellow Books-ын туслах бөгөөд Улаанбаатар хотын бизнесүүдийг санал болгодог.

**Хэрэглэгчийн асуулт:**
${question}

**Контекст (Зөвхөн эдгээр өгөгдөл дээр тулгуурлан хариулна уу):**
\`\`\`json
${businessesJson}
\`\`\`

**Дүрэм:**
1. Зөвхөн дээрх JSON өгөгдөл дээр үндэслэн хариулна
2. 3-5 бизнес санал болгоно (хамгийн тохиромжтойг эхэлж)
3. Бизнесийн нэр болон байршлыг (дүүрэг) заавал дурдана
4. Найрсаг, энгийн монгол хэлээр хариулна
5. Хэрэв тохирох бизнес олдохгүй бол "Уучлаарай, таны хүссэн критерт тохирох газар олдсонгүй" гэж хариулна
6. Таамаглаж, зохиож бүү хариул - зөвхөн өгөгдсөн мэдээлэл ашигла

**Хариулт (Монгол хэлээр):**`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
}
