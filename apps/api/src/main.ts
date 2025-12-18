// Lab 6 EKS Deployment - Fixed deployment strategy
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { YellowBookEntrySchema } from '@yellow-book/contract';
import * as fs from 'fs';
import { Organization } from './types/organization';

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
  res.send({ message: 'Welcome to Yellow Book API!' });
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
