# 🚀 Installation Instructions

## ⚠️ ЧУХАЛ: Эхлэхийн өмнө

Та энэ лабораторийн ажлыг эхлэхээс өмнө дараах зүйлсийг хийх шаардлагатай:

### 1. Dependencies суулгах

```bash
npm install
```

**Анхаар**: `@google/generative-ai` package одоогоор `package.json`-д нэмэгдсэн боловч `node_modules`-д суугаагүй. Дээрх команд ажиллуулснаар суух болно.

### 2. TypeScript compilation errors

Одоогоор дараах алдаанууд харагдаж байна:
```
Cannot find module '@google/generative-ai'
```

Энэ нь `npm install` ажиллуулаагүйн улмаас гарч байгаа алдаа. Dependencies суусны дараа алдаа алга болно.

---

## 📦 Step-by-Step Setup

### Step 1: Install dependencies
```bash
npm install
```

Энэ нь дараах packages-ийг суулгана:
- `@google/generative-ai@^0.21.0`
- Бусад existing dependencies

### Step 2: Environment configuration
```bash
# .env файл байгаа эсэхийг шалгах
# Хэрэв байхгүй бол:
cp .env.example .env
```

`.env` файлд дараах мөрүүд байх ёстой:
```env
GEMINI_API_KEY=AIzaSyAJHQ7jY4Um0TfiOT86cgsf049fH_RCUb4
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_URL=http://localhost:3333
DATABASE_URL=postgresql://...
```

### Step 3: Database migration
```bash
# Prisma client үүсгэх
npx prisma generate

# Migration ажиллуулах
npx prisma migrate dev --name add_embedding_to_yellowbook
```

### Step 4: Generate embeddings
```bash
npm run ai:embed
```

Энэ нь:
- Бүх бизнесүүдийн embedding үүсгэнэ
- ~2-5 минут үргэлжилнэ
- Progress bar харагдана

### Step 5: Start servers
```bash
# Terminal 1: API server
npm run start:api

# Terminal 2: Web server (өөр terminal)
npm run start:web
```

### Step 6: Test
Browser дээр очих:
```
http://localhost:4200/assistant
```

---

## 🔍 Verification Steps

### 1. Check TypeScript compilation
```bash
npm run typecheck
```

Алдаа байх ёсгүй (npm install хийсний дараа).

### 2. Check database
```bash
npx prisma studio
```

YellowBook table дээр `embedding` field байгаа эсэхийг шалгах.

### 3. Check API endpoint
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3333/api"
```

Response ирэх ёстой.

### 4. Check embedding data
```bash
# PowerShell
npx prisma studio
# YellowBook table-ийн embedding column-д array өгөгдөл байвал OK
```

---

## 🆘 Troubleshooting

### Error: Cannot find module '@google/generative-ai'
**Solution**: 
```bash
npm install @google/generative-ai
```

### Error: Prisma client not generated
**Solution**: 
```bash
npx prisma generate
```

### Error: Database connection failed
**Solution**: 
1. `.env` файлд `DATABASE_URL` зөв эсэхийг шалгах
2. PostgreSQL server ажиллаж байгаа эсэхийг шалгах

### Error: Redis connection refused
**Solution**: 
Redis суугаагүй эсвэл асаагүй байж болно. Санаа зовох хэрэггүй - систем Redis-гүй ч ажиллана.

---

## ✅ Success Criteria

Setup амжилттай болсон эсэхийг дараах шалгууруудаар мэдэх:

1. ✅ `npm install` алдаагүй дууссан
2. ✅ `npm run typecheck` алдаа өгөхгүй
3. ✅ `npx prisma studio` ажиллаж, embedding field харагдаж байна
4. ✅ `npm run ai:embed` амжилттай дууссан (embeddings үүссэн)
5. ✅ API server асаж, `http://localhost:3333/api` хариу өгч байна
6. ✅ Web server асаж, `http://localhost:4200` нээгдэж байна
7. ✅ `/assistant` route ажиллаж, UI харагдаж байна
8. ✅ Жишээ асуулт оруулахад AI хариулт ирж байна

---

## 📚 Next Steps

Setup дууссаны дараа:

1. [QUICKSTART_AI.md](./QUICKSTART_AI.md) - Хурдан эхлэх гарын авлага
2. [AI_ASSISTANT_README.md](./AI_ASSISTANT_README.md) - Дэлгэрэнгүй баримт
3. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Төслийн хураангуй

---

## 🎯 Quick Commands Reference

```bash
# Install
npm install

# Database
npx prisma generate
npx prisma migrate dev
npx prisma studio

# AI
npm run ai:embed       # Generate embeddings
npm run ai:test        # Test API

# Development
npm run start:api      # Start backend
npm run start:web      # Start frontend
npm run dev            # Start both (concurrently)

# Verification
npm run typecheck      # Check TypeScript
npm run lint           # Check linting
npm test               # Run tests
```

---

**Анхаарал**: `npm install` ажиллуулах хүртэл TypeScript алдаануud байх болно. Энэ нь хэвийн үзэгдэл.

**Дараах алхам**: `npm install` ажиллуулж эхлэх!
