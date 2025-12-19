# Yellow Books AI Assistant - Implementation Guide

## 🎯 Төслийн ерөнхий зорилго

Yellow Books вэб апп-д AI Assistant (semantic search + RAG) функц нэмсэн. Энэ систем нь:
- Монгол хэлний асуултыг ойлгох
- Embedding ашиглан semantic similarity хайлт хийх
- LLM-ээр байгалийн хэлээр хариу үүсгэх

## 🏗️ Технологийн стек

- **Frontend**: Next.js 15 (`/assistant` route)
- **Backend**: Express.js (NestJS бус, энгийн Express)
- **Database**: PostgreSQL + Prisma
- **Vector storage**: Prisma JSON field (pgvector биш)
- **Cache**: Redis (optional, graceful fallback)
- **AI Provider**: Google Gemini API
  - `embedding-001` - Embeddings
  - `gemini-pro` - Chat Completion

## 📊 Database Schema

```prisma
model YellowBook {
  // ... existing fields
  embedding    Json?    @db.JsonB  // ← NEW: Vector storage as JSON
}
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

Dependencies added:
- `@google/generative-ai` - Gemini SDK
- `ioredis` - Redis client (already installed)

### 2. Environment Variables

Add to your `.env`:

```env
# Gemini API Key
GEMINI_API_KEY=AIzaSyAJHQ7jY4Um0TfiOT86cgsf049fH_RCUb4

# Redis (optional - system works without it)
REDIS_URL=redis://localhost:6379

# API URL for frontend
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### 3. Database Migration

```bash
# Generate migration for embedding field
npx prisma migrate dev --name add_embedding_to_yellowbook

# Apply migration
npx prisma generate
```

### 4. Generate Embeddings

Run the offline script to generate embeddings for all businesses:

```bash
npx ts-node tools/embed-businesses.ts
```

This script:
- Fetches all businesses without embeddings
- Generates text: `name + category + city + state + description`
- Calls Gemini API to create embedding vectors
- Saves to database
- Rate limited: 1 request/second

**Expected output:**
```
🚀 Starting embedding generation...
📊 Found 150 businesses to process

Processing [1/150]: Restaurant Name
✅ Success (768 dimensions)

Processing [2/150]: Hotel Name
✅ Success (768 dimensions)
...
```

### 5. Start Services

```bash
# Terminal 1: Start Redis (optional)
redis-server

# Terminal 2: Start API
npm run start:api

# Terminal 3: Start Web
npm run start:web
```

### 6. Access AI Assistant

Open browser: `http://localhost:4200/assistant`

## 📁 File Structure

```
yellow-book/
├── tools/
│   └── embed-businesses.ts          # Offline embedding generator
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── main.ts               # Added AI endpoint
│   │       ├── services/
│   │       │   ├── ai.service.ts     # Gemini integration
│   │       │   └── cache.service.ts  # Redis caching
│   │       └── utils/
│   │           └── similarity.ts     # Cosine similarity
│   └── web/
│       └── src/
│           └── app/
│               └── assistant/
│                   └── page.tsx      # AI Assistant UI
└── prisma/
    └── schema.prisma                 # Updated with embedding field
```

## 🔄 AI Search Flow

```
User Question (Mongolian)
    ↓
1. Check Redis Cache (key: ai:q:hash(question+city))
    ↓ (cache miss)
2. Generate Question Embedding (Gemini embedding-001)
    ↓
3. Fetch Businesses from DB (with city/category filters)
    ↓
4. Calculate Cosine Similarity for each business
    ↓
5. Sort by similarity, take top 5
    ↓
6. Generate AI Answer using RAG (Gemini gemini-pro)
    ↓
7. Cache result (30 min TTL)
    ↓
8. Return { answer, businesses, metadata }
```

## 🎯 API Endpoint

### POST `/api/ai/yellow-books/search`

**Request:**
```json
{
  "question": "Төв дүүрэгт сайн ресторан байна уу?",
  "city": "Сүхбаатар",        // optional
  "category": "Ресторан",      // optional
  "limit": 5                    // optional, default 5
}
```

**Response:**
```json
{
  "answer": "Тантай санал болгох хэд хэдэн ресторан...",
  "businesses": [
    {
      "id": "uuid",
      "businessName": "Restaurant XYZ",
      "category": "Ресторан",
      "city": "Сүхбаатар",
      "state": "Улаанбаатар",
      "address": "...",
      "phoneNumber": "...",
      "description": "...",
      "website": "...",
      "similarity": 0.87
    }
  ],
  "metadata": {
    "totalFound": 5,
    "filtered": {
      "city": "Сүхбаатар",
      "category": null
    },
    "model": "gemini-pro"
  },
  "fromCache": false
}
```

## 🤖 RAG Prompt Design

```typescript
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
```

## 🧮 Cosine Similarity Algorithm

```typescript
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

Result: 0 to 1 (higher = more similar)

## 💾 Caching Strategy

- **Key format**: `ai:q:${hash(question + city + category)}`
- **TTL**: 30 minutes
- **Graceful degradation**: Works without Redis
- **Cache invalidation**: Manual or TTL expiry

## 🎨 UI Features

### Assistant Page (`/assistant`)

1. **Search Form**
   - Main question input (textarea)
   - Optional city filter
   - Optional category filter
   - Submit button with loading state

2. **Example Questions**
   - Quick-fill buttons with Mongolian examples

3. **AI Response Display**
   - Formatted AI answer
   - Model indicator (gemini-pro)
   - Cache status indicator

4. **Business Cards**
   - Top 5 businesses
   - Similarity score (percentage)
   - Full contact details
   - Clickable phone/website

5. **Responsive Design**
   - Mobile-friendly
   - Tailwind CSS
   - Gradient accents

## 🔧 Testing

### Test Embedding Generation

```bash
# Test with one business
npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.yellowBook.findFirst({ where: { embedding: { not: null } } })
  .then(b => console.log('Embedding dimensions:', (b.embedding as any).length));
"
```

### Test AI Search

```bash
curl -X POST http://localhost:3333/api/ai/yellow-books/search \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Сүхбаатар дүүрэгт сайн ресторан байна уу?",
    "limit": 3
  }'
```

### Test Cache

1. Make request → should see `"fromCache": false`
2. Same request again → should see `"fromCache": true`

## 📊 Performance Considerations

- **Embedding generation**: ~1 second per business (rate limited)
- **Search query**: ~2-3 seconds (including LLM call)
- **Cached query**: ~50-100ms
- **Database**: Uses JSON field (consider pgvector for production)

## 🚧 Limitations & Future Improvements

### Current Limitations
1. JSON storage (not optimized for large scale)
2. No pgvector index
3. Single API key (no rate limit handling)
4. No user authentication on assistant page

### Future Improvements
1. **pgvector**: Native vector similarity in PostgreSQL
2. **Batch embedding**: Parallel processing
3. **Advanced filtering**: Price, rating, hours
4. **Conversation history**: Multi-turn dialogue
5. **Analytics**: Track popular questions
6. **A/B testing**: Different prompts/models

## 📝 Code Principles

- ✅ Simple, readable, demo-quality
- ✅ Graceful error handling
- ✅ Works without Redis
- ✅ Mongolian language support
- ✅ RAG pattern with strict prompt
- ✅ No hallucination (only DB data)
- ✅ Cache for performance

## 🎓 Educational Value

This implementation demonstrates:
- **Semantic Search**: Understanding meaning, not just keywords
- **RAG Pattern**: Grounding LLM with real data
- **Embedding**: Vector representations of text
- **Cosine Similarity**: Measuring semantic similarity
- **Caching**: Performance optimization
- **Full-stack AI**: Frontend → Backend → AI → Database

## 🆘 Troubleshooting

### Embedding generation fails
```
Error: quota exceeded
```
→ Wait and retry, or use different API key

### Redis connection error
```
Redis error: ECONNREFUSED
```
→ OK! System works without Redis

### No businesses found
```
"businesses": []
```
→ Run embedding script first: `npx ts-node tools/embed-businesses.ts`

### CORS error on frontend
```
Access-Control-Allow-Origin
```
→ Check `NEXT_PUBLIC_API_URL` in `.env`

## 📚 Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [Embeddings Guide](https://ai.google.dev/docs/embeddings_guide)
- [RAG Pattern](https://arxiv.org/abs/2005.11401)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)

---

**Status**: ✅ Lab Complete
**Date**: December 19, 2025
**Version**: 1.0.0
