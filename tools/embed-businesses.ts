import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAJHQ7jY4Um0TfiOT86cgsf049fH_RCUb4';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate embedding text from business data
 * Format: name + categories + location + description
 */
function generateEmbeddingText(business: any): string {
  const parts: string[] = [];
  
  if (business.businessName) parts.push(business.businessName);
  if (business.category) parts.push(business.category);
  if (business.city) parts.push(business.city);
  if (business.state) parts.push(business.state);
  if (business.description) parts.push(business.description);
  
  return parts.join(' ');
}

/**
 * Generate embedding vector using Gemini API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Process all businesses and generate embeddings
 */
async function embedAllBusinesses() {
  console.log('🚀 Starting embedding generation...\n');
  
  try {
    // Fetch all businesses without embeddings
    const businesses = await prisma.yellowBook.findMany({
      where: {
        OR: [
          { embedding: null },
          { embedding: { equals: null } }
        ]
      }
    });
    
    console.log(`📊 Found ${businesses.length} businesses to process\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];
      try {
        console.log(`Processing [${i + 1}/${businesses.length}]: ${business.businessName}`);
        
        // Generate text for embedding
        const text = generateEmbeddingText(business);
        
        // Generate embedding
        const embedding = await generateEmbedding(text);
        
        // Update database
        await prisma.yellowBook.update({
          where: { id: business.id },
          data: { embedding: embedding as any }
        });
        
        successCount++;
        console.log(`✅ Success (${embedding.length} dimensions)\n`);
        
        // Rate limiting: wait 1 second between requests
        if (i < businesses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Error: ${error?.message || 'Unknown error'}\n`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Total: ${businesses.length}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
embedAllBusinesses()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
