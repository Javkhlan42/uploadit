import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

interface SearchRequest {
  query: string;
}

interface SearchResponse {
  answer: string;
  businesses: Array<{
    id: string;
    businessName: string;
    category: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    description: string | null;
    website: string | null;
    email: string | null;
    similarity: number;
  }>;
  cached: boolean;
}

@Controller('ai/yellow-books')
export class AiYellowBooksController {
  @Post('search')
  async search(@Body() body: SearchRequest): Promise<SearchResponse> {
    const { query } = body;

    if (!query || query.trim().length === 0) {
      throw new HttpException('Query is required', HttpStatus.BAD_REQUEST);
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new HttpException(
        'OpenAI API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    try {
      // Check cache first
      const cacheKey = `ai:search:${query.toLowerCase().trim()}`;
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log('✅ Cache hit for query:', query);
          return { ...JSON.parse(cached), cached: true };
        }
      }

      // Generate embedding for query
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query,
      });
      const queryEmbedding = embeddingResponse.data[0].embedding;

      // Fetch all businesses with embeddings
      const businesses = await prisma.yellowBook.findMany({
        where: {
          embedding: {
            not: null,
          },
        },
      });

      // Calculate cosine similarity
      const results = businesses
        .map((business) => {
          if (!business.embedding) return null;

          const businessEmbedding = JSON.parse(business.embedding);
          const similarity = cosineSimilarity(queryEmbedding, businessEmbedding);

          return {
            id: business.id,
            businessName: business.businessName,
            category: business.category,
            phoneNumber: business.phoneNumber,
            address: business.address,
            city: business.city,
            state: business.state,
            zipCode: business.zipCode,
            description: business.description,
            website: business.website,
            email: business.email,
            similarity,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5); // Top 5 results

      // Generate AI answer using GPT
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant for a Yellow Pages directory. Answer user questions about businesses based on the provided search results. Be concise and helpful. If no relevant businesses are found, say so politely.`,
          },
          {
            role: 'user',
            content: `User question: "${query}"\n\nRelevant businesses:\n${results
              .map(
                (b, i) =>
                  `${i + 1}. ${b.businessName} (${b.category}) - ${b.description || 'No description'}\n   ${b.address}, ${b.city}, ${b.state} ${b.zipCode}\n   Phone: ${b.phoneNumber}${b.website ? `\n   Website: ${b.website}` : ''}${b.email ? `\n   Email: ${b.email}` : ''}`
              )
              .join('\n\n')}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const answer = completion.choices[0].message.content || 'No answer available';

      const response: SearchResponse = {
        answer,
        businesses: results,
        cached: false,
      };

      // Cache the result for 1 hour
      if (redis) {
        await redis.setex(cacheKey, 3600, JSON.stringify(response));
        console.log('💾 Cached response for query:', query);
      }

      return response;
    } catch (error) {
      console.error('Error in AI search:', error);
      throw new HttpException(
        `AI search failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

// Cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}
