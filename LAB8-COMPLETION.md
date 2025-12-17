# Lab 8: AI-Powered Yellow Pages - Бүрэн дүүрэн хэрэгжсэн

## ✅ Хэрэгжүүлсэн зүйлс

### 1. Embedding field нэмсэн (Prisma)
**Файл:** `prisma/schema.prisma`
```prisma
model YellowBook {
  embedding    String?  @db.Text // Vector embedding for semantic search
}
```

**Migration:** `prisma/migrations/20251217160000_add_embedding_field/migration.sql`
```sql
ALTER TABLE "yellow_books" ADD COLUMN "embedding" TEXT;
```

### 2. Offline embedding script
**Файл:** `scripts/generate-embeddings.ts`
- OpenAI text-embedding-ada-002 model ашиглана
- Batch processing with 100ms rate limiting
- JSON.stringify() format
- All businesses without embeddings процесс хийнэ

**Ашиглах:**
```bash
npm install
npx ts-node scripts/generate-embeddings.ts
```

### 3. AI Search API endpoint
**Файл:** `apps/api/src/middleware/ai-search.middleware.ts`
- POST `/api/ai/yellow-books/search`
- Cosine similarity-based semantic search
- GPT-4 natural language responses
- Top 5 most similar businesses
- Express middleware (NestJS биш, Express backend ашиглаж байна)

**Ашиглалт:**
```typescript
// apps/api/src/main.ts
import { searchWithAI } from './middleware/ai-search.middleware';
app.post('/api/ai/yellow-books/search', searchWithAI);
```

### 4. Redis caching
**Файл:** `k8s/redis-deployment.yaml`
- Redis 7-alpine
- ClusterIP service (redis-service:6379)
- 1-hour TTL (3600 seconds)
- Cache key format: `ai-search:{query}`

**Middleware-т интеграцчлагдсан:**
```typescript
const cacheKey = `ai-search:${query.toLowerCase().trim()}`;
await redis.setex(cacheKey, 3600, JSON.stringify(result));
```

### 5. Assistant UI page
**Файл:** `apps/web/src/app/yellow-books/assistant/page.tsx`
- URL: `/yellow-books/assistant`
- Chat-like interface
- Query textarea
- Loading states with spinner
- Business cards grid
- Example queries
- Error handling

## 📊 Өгөгдөл

### Монгол бизнесүүд (10)
**Файл:** `prisma/seed.ts`

1. **Хаан банк** - Санхүү (Улаанбаатар)
2. **Шангри-Ла зочид буудал** - Зочид буудал (Улаанбаатар)
3. **Номин супермаркет** - Худалдаа (Улаанбаатар)
4. **Enerelt сургууль** - Боловсрол (Улаанбаатар)
5. **Сонгдо эмнэлэг** - Эрүүл мэнд (Улаанбаатар)
6. **MCS coca cola** - Үйлдвэрлэл (Улаанбаатар)
7. **Өрхөн гоёо** - Ресторан (Улаанбаатар)
8. **Модерн номын дэлгүүр** - Худалдаа (Улаанбаатар)
9. **Sky resort** - Амралт (Дархан)
10. **Эрдэнэт техникийн их сургууль** - Боловсрол (Эрдэнэт)

## 🔐 Configuration

### Environment Variables
**Файл:** `k8s/secrets.yaml` (base64 encoded)

```yaml
data:
  OPENAI_API_KEY: c2stcHJvai1pNTFTYTJtdEhEVldNU3l5... (base64)
  REDIS_URL: cmVkaXM6Ly9yZWRpcy1zZXJ2aWNlOjYzNzk= (base64)
  DATABASE_URL: ... (base64)
```

### OpenAI Models
- **Embeddings:** text-embedding-ada-002 (1536 dimensions)
- **Chat:** gpt-4 (temperature: 0.7, max_tokens: 500)

## 🚀 Deployment

### Migration + Seed (автомат)
**Файл:** `k8s/migration-job.yaml`
```bash
npx prisma migrate deploy && npx prisma db seed
```

### Redis Deploy
```bash
kubectl apply -f k8s/redis-deployment.yaml
```

### Secrets Apply
```bash
kubectl apply -f k8s/secrets.yaml
```

### Backend Restart
```bash
kubectl rollout restart deployment/backend -n yellowbooks
```

### Complete Deployment Script
**Windows:** `scripts/deploy-lab8.ps1`
**Linux/Mac:** `scripts/deploy-lab8.sh`

## 📝 API Documentation

### POST /api/ai/yellow-books/search

**Request:**
```json
{
  "query": "Улаанбаатарт сайн ресторан олох"
}
```

**Response:**
```json
{
  "answer": "Based on your query, I recommend Өрхөн гоёо restaurant...",
  "businesses": [
    {
      "id": "uuid",
      "businessName": "Өрхөн гоёо",
      "category": "Ресторан",
      "phoneNumber": "7010-7777",
      "address": "Сөүлийн гудамж 3",
      "city": "Улаанбаатар",
      "state": "ХУД",
      "description": "Монголын үндэсний хоолны ресторан..."
    }
  ],
  "cached": false
}
```

## 🧪 Тестлэх

### 1. Frontend-аас
```
URL: http://sharnom.systems:31003/yellow-books/assistant
Асуулт: "Хаан банкны хаяг"
```

### 2. API шууд
```bash
curl -X POST http://sharnom.systems:31529/api/ai/yellow-books/search \
  -H "Content-Type: application/json" \
  -d '{"query":"Улаанбаатарт зочид буудал"}'
```

### 3. Redis cache шалгах
```bash
kubectl exec -it deployment/redis -n yellowbooks -- redis-cli
> KEYS "ai-search:*"
> GET "ai-search:улаанбаатарт зочид буудал"
```

### 4. Embeddings шалгах
```bash
kubectl exec -it deployment/postgres -n yellowbooks -- \
  psql -U yellowbooks_user -d yellowbooks \
  -c "SELECT business_name, LENGTH(embedding) FROM yellow_books WHERE embedding IS NOT NULL;"
```

## 📦 Dependencies

### Backend
- `openai`: ^4.x
- `ioredis`: ^5.x
- `@prisma/client`: ^6.x

### Scripts
- `dotenv`: ^16.x
- `ts-node`: ^10.x

## 🔄 Workflow

1. User submits query → Frontend
2. POST /api/ai/yellow-books/search
3. Check Redis cache (hit/miss)
4. Generate query embedding (OpenAI)
5. Calculate cosine similarity
6. Find top 5 businesses
7. Generate GPT-4 answer
8. Cache result (1 hour)
9. Return to frontend

## ✅ Checklist

- [x] Prisma schema embedding field
- [x] Migration 20251217160000_add_embedding_field
- [x] generate-embeddings.ts script
- [x] AI search middleware (Express)
- [x] Redis deployment manifest
- [x] OpenAI API key in secrets (base64)
- [x] Frontend /yellow-books/assistant page
- [x] Mongolian business seed data (10 entries)
- [x] Deployment scripts (PS1 & SH)
- [x] Documentation (DEPLOYMENT.md)
- [x] TypeScript errors fixed
- [x] ESLint warnings resolved
- [x] API endpoint tested (404 fixed)

## 🎯 Үр дүн

**Lab 8 бүрэн хэрэгжсэн!** 🎉

- Semantic search with OpenAI embeddings
- GPT-4 powered natural language responses
- Redis caching for performance
- Mongolian business data
- Production-ready deployment scripts

**Next Steps:**
1. Deploy to Kubernetes with `scripts/deploy-lab8.ps1`
2. Wait for migration job to complete
3. Test at http://sharnom.systems:31003/yellow-books/assistant
4. Monitor with GitHub Actions workflows
