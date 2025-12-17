// Lab 6 & 7 - EKS Deployment with NextAuth and Role-based Access Control
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { YellowBookEntrySchema } from '@yellow-book/contract';
import * as fs from 'fs';
import { Organization } from './types/organization';
import { validateSession } from './middleware/session.middleware';
import { setCsrfToken, csrfProtection } from './middleware/csrf.middleware';
import { requireAdmin } from './middleware/auth.middleware';
import { searchWithAI } from './middleware/ai-search.middleware';

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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(validateSession);
app.use(setCsrfToken);
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.get('/api', (req, res) => {
  console.log('✅ API health check endpoint called');
  res.send({ message: 'Welcome to Yellow Book API!', status: 'healthy', timestamp: new Date().toISOString() });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    console.log('📋 Categories endpoint called, returning', categoriesData.length, 'categories');
    res.json(categoriesData);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
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

// Admin routes (protected)
app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  res.json({
    message: 'Welcome to admin dashboard',
    user: (req as any).user,
  });
});

app.post('/api/admin/organizations', csrfProtection, requireAdmin, async (req, res) => {
  try {
    // Create organization logic here
    res.json({ message: 'Organization created', data: req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  const token = req.cookies['csrf-token'];
  res.json({ csrfToken: token });
});

// AI-powered search endpoint
app.post('/api/ai/yellow-books/search', searchWithAI);

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
