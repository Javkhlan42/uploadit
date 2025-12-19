// Lab 6 EKS Deployment - Fixed deployment strategy
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { YellowBookEntrySchema } from '@yellow-book/contract';
import * as fs from 'fs';
import { Organization } from './types/organization';
import { requireAdmin, csrfProtection, AuthRequest } from './middleware/auth';
import { cosineSimilarity, hashString } from './utils/similarity';
import { generateQueryEmbedding, generateAIResponse } from './services/ai.service';
import { getCachedResponse, cacheResponse } from './services/cache.service';

const app = express();
const prisma = new PrismaClient();

// Load JSON data
const organizationsData: Organization[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'organizations.json'), 'utf-8')
);
const categoriesData: string[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'categories.json'), 'utf-8')
);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.get('/api', (req, res) => {
  res.send({ 
    message: 'Welcome to Yellow Book API!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    res.json(categoriesData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get featured organizations (must be before /api/organizations/:id)
app.get('/api/organizations/featured', (req, res) => {
  try {
    const featuredOrganizations = organizationsData.filter(
      (org) => org.featured === true
    );
    res.json(featuredOrganizations);
  } catch (error) {
    console.error('Error fetching featured organizations:', error);
    res.status(500).json({ error: 'Failed to fetch featured organizations' });
  }
});

// Get all organizations
app.get('/api/organizations', (req, res) => {
  try {
    const { category, search } = req.query;
    let filteredOrganizations = [...organizationsData];

    // Filter by category
    if (category && category !== 'All Categories') {
      filteredOrganizations = filteredOrganizations.filter(
        (org) => org.category === category
      );
    }

    // Filter by search query
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredOrganizations = filteredOrganizations.filter(
        (org) =>
          org.name.toLowerCase().includes(searchLower) ||
          org.description.toLowerCase().includes(searchLower) ||
          org.category.toLowerCase().includes(searchLower)
      );
    }

    res.json(filteredOrganizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Get organization by ID
app.get('/api/organizations/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const organization = organizationsData.find((org) => org.id === id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    return res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

app.get('/api/yellow-books', async (req, res) => {
  try {
    const entries = await prisma.yellowBook.findMany({
      orderBy: { businessName: 'asc' },
    });

    // Validate response data
    const validatedEntries = entries.map((entry) =>
      YellowBookEntrySchema.parse(entry)
    );

    res.json(validatedEntries);
  } catch (error) {
    console.error('Error fetching yellow book entries:', error);
    res.status(500).json({ error: 'Failed to fetch yellow book entries' });
  }
});

// Admin Routes - Protected with role-based guard
app.get('/api/admin/stats', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userCount = await prisma.user.count();
    const stats = {
      users: userCount,
      organizations: organizationsData.length,
      categories: categoriesData.length,
      admin: req.user?.email
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

app.post('/api/admin/organizations', requireAdmin, csrfProtection, async (req: AuthRequest, res) => {
  try {
    // Admin-only: Create new organization
    // In production, this would save to database
    const newOrg = req.body;
    res.status(201).json({ 
      message: 'Organization created successfully',
      organization: newOrg,
      createdBy: req.user?.email
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// AI Assistant - Semantic Search with RAG
app.post('/api/ai/yellow-books/search', async (req, res) => {
  try {
    const { question, city, category, limit = 5 } = req.body;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    console.log('🤖 AI Search Request:', { question, city, category });
    
    // 1. Check Redis cache
    const cacheKey = `ai:q:${hashString(question + (city || '') + (category || ''))}`;
    const cached = await getCachedResponse(cacheKey);
    
    if (cached) {
      console.log('✅ Cache HIT');
      return res.json({ ...cached, fromCache: true });
    }
    
    console.log('❌ Cache MISS - processing...');
    
    // 2. Generate embedding for the question
    const questionEmbedding = await generateQueryEmbedding(question);
    
    // 3. Fetch businesses from DB with optional filters
    const whereClause: any = {
      embedding: { not: null }
    };
    
    if (city) {
      whereClause.city = { contains: city, mode: 'insensitive' };
    }
    
    if (category) {
      whereClause.category = { contains: category, mode: 'insensitive' };
    }
    
    const businesses = await prisma.yellowBook.findMany({
      where: whereClause,
      select: {
        id: true,
        businessName: true,
        category: true,
        city: true,
        state: true,
        address: true,
        phoneNumber: true,
        description: true,
        website: true,
        embedding: true
      }
    });
    
    if (businesses.length === 0) {
      const noResultResponse = {
        answer: 'Уучлаарай, таны хүссэн критерт тохирох газар олдсонгүй.',
        businesses: [],
        metadata: { totalFound: 0, filtered: { city, category } }
      };
      await cacheResponse(cacheKey, noResultResponse);
      return res.json(noResultResponse);
    }
    
    // 4. Calculate cosine similarity for each business
    interface BusinessWithScore {
      business: typeof businesses[0];
      similarity: number;
    }
    
    const businessesWithScores: BusinessWithScore[] = businesses
      .map(business => {
        try {
          const embedding = business.embedding as any as number[];
          if (!Array.isArray(embedding)) {
            return null;
          }
          const similarity = cosineSimilarity(questionEmbedding, embedding);
          return { business, similarity };
        } catch (error) {
          console.error(`Error calculating similarity for ${business.businessName}:`, error);
          return null;
        }
      })
      .filter((item): item is BusinessWithScore => item !== null);
    
    // 5. Sort by similarity (descending) and take top N
    businessesWithScores.sort((a, b) => b.similarity - a.similarity);
    const topBusinesses = businessesWithScores.slice(0, Math.min(limit, 10));
    
    if (topBusinesses.length === 0) {
      const noResultResponse = {
        answer: 'Уучлаарай, таны асуултад тохирох газар олдсонгүй.',
        businesses: [],
        metadata: { totalFound: 0, filtered: { city, category } }
      };
      await cacheResponse(cacheKey, noResultResponse);
      return res.json(noResultResponse);
    }
    
    // 6. Generate AI response using RAG
    const businessesForRAG = topBusinesses.map(item => {
      const { embedding, ...businessData } = item.business;
      return businessData;
    });
    
    const aiAnswer = await generateAIResponse(question, businessesForRAG);
    
    // 7. Prepare response
    const response = {
      answer: aiAnswer,
      businesses: topBusinesses.map(item => ({
        ...item.business,
        embedding: undefined, // Don't send embedding to frontend
        similarity: item.similarity
      })),
      metadata: {
        totalFound: topBusinesses.length,
        filtered: { city, category },
        model: 'gemini-pro'
      }
    };
    
    // 8. Cache the response
    await cacheResponse(cacheKey, response);
    
    console.log('✅ AI Search completed');
    res.json({ ...response, fromCache: false });
    
  } catch (error: any) {
    console.error('Error in AI search:', error);
    return res.status(500).json({ 
      error: 'Failed to process AI search',
      details: error?.message || 'Unknown error'
    });
  }
});

// ..

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Lab 6 deployment - 100/100 complete
