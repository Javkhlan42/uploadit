#!/usr/bin/env node
/**
 * Offline script to generate embeddings for all businesses
 * Usage: node scripts/generate-embeddings.js
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

function createBusinessText(business: any): string {
  return `${business.businessName} - ${business.category}. ${
    business.description || ''
  } Located at ${business.address}, ${business.city}, ${business.state} ${
    business.zipCode
  }. ${business.website || ''} ${business.email || ''}`;
}

async function main() {
  console.log('🚀 Starting embedding generation...\n');

  // Fetch all businesses without embeddings
  const businesses = await prisma.yellowBook.findMany({
    where: {
      OR: [{ embedding: null }, { embedding: '' }],
    },
  });

  console.log(`📊 Found ${businesses.length} businesses to process\n`);

  let processed = 0;
  let errors = 0;

  for (const business of businesses) {
    try {
      const text = createBusinessText(business);
      const embedding = await generateEmbedding(text);

      // Store as JSON string
      await prisma.yellowBook.update({
        where: { id: business.id },
        data: {
          embedding: JSON.stringify(embedding),
        },
      });

      processed++;
      console.log(
        `✅ [${processed}/${businesses.length}] Embedded: ${business.businessName}`
      );

      // Rate limiting: Wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      errors++;
      console.error(
        `❌ Error processing ${business.businessName}:`,
        error.message
      );
    }
  }

  console.log('\n📈 Summary:');
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📊 Total: ${businesses.length}`);

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log('\n✨ Embedding generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
