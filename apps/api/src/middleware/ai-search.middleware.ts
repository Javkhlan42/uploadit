import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Redis client for caching
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Generate embedding for query
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data[0].embedding;
}

// Find similar businesses using embeddings
async function findSimilarBusinesses(queryEmbedding: number[], limit = 5) {
  const businesses = await prisma.yellowBook.findMany({
    where: {
      embedding: {
        not: null,
      },
    },
  });

  const similarities = businesses.map((business) => {
    const embedding = JSON.parse(business.embedding!);
    const similarity = cosineSimilarity(queryEmbedding, embedding);
    return { business, similarity };
  });

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((item) => item.business);
}

// Generate AI response using GPT-4
async function generateAIResponse(
  query: string,
  businesses: any[]
): Promise<string> {
  const context = businesses
    .map(
      (b, i) =>
        `${i + 1}. ${b.businessName} (${b.category})\n   Address: ${b.address}, ${b.city}, ${b.state}\n   Phone: ${b.phoneNumber}\n   ${b.description || ''}`
    )
    .join('\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful Yellow Pages assistant. Provide concise, friendly recommendations based on the businesses provided. Include business names, addresses, and phone numbers in your response.',
      },
      {
        role: 'user',
        content: `User query: "${query}"\n\nRelevant businesses:\n${context}\n\nProvide a helpful response with recommendations.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content || 'No response generated.';
}

export async function searchWithAI(req: Request, res: Response) {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`🔍 AI Search query: "${query}"`);

    // Check cache first
    const cacheKey = `ai-search:${query.toLowerCase().trim()}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log('✅ Cache hit!');
      return res.json(JSON.parse(cached));
    }

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Find similar businesses
    const businesses = await findSimilarBusinesses(queryEmbedding);

    if (businesses.length === 0) {
      return res.json({
        answer: 'I couldn\'t find any businesses matching your query. Try rephrasing or broadening your search.',
        businesses: [],
      });
    }

    // Generate AI response
    const answer = await generateAIResponse(query, businesses);

    const result = {
      answer,
      businesses: businesses.map((b) => ({
        id: b.id,
        businessName: b.businessName,
        category: b.category,
        phoneNumber: b.phoneNumber,
        address: b.address,
        city: b.city,
        state: b.state,
        description: b.description,
      })),
    };

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(result));

    console.log(`✅ AI response generated with ${businesses.length} businesses`);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in AI search:', error);
    return res.status(500).json({
      error: 'Failed to process AI search',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
