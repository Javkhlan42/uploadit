# 🚀 Production Deployment Guide - AI Assistant

## Танилцуулга

Энэхүү гарын авлага нь Yellow Books AI Assistant-ийг AWS EKS дээр production орчинд deploy хийх алхмуудыг тайлбарласан.

---

## 📋 Prerequisites

✅ Одоо байгаа EKS cluster: `hilarious-synth-crow`  
✅ AWS Region: `us-east-1`  
✅ AWS Account: `290817091060`  
✅ ECR Repository: `uploadit-backend`, `uploadit-frontend`  
✅ GitHub Actions OIDC configured  

### Шинээр нэмэгдсэн requirements:

- Gemini API Key (аль хэдийн secrets.yaml-д нэмсэн)
- Redis (optional - backend gracefully handles without it)
- PostgreSQL embedding support (JSON field - аль хэдийн бүтээсэн)

---

## 🔧 Step 1: Database Migration

AI Assistant-д шинээр `embedding` field нэмэгдсэн тул migration хийх шаардлагатай.

### Option A: Automatic Migration (Kubernetes Job)

Migration job аль хэдийн байгаа (`k8s/migration-job.yaml`):

```bash
# Update migration job to include new migration
kubectl apply -f k8s/migration-job.yaml

# Check migration status
kubectl logs -n yellowbooks -l job-name=prisma-migration
```

### Option B: Manual Migration (Local)

```bash
# 1. Connect to production database
export DATABASE_URL="postgresql://yellowbooks_user:YellowBooks2024!Secure@<RDS_ENDPOINT>:5432/yellowbooks"

# 2. Run migration
npx prisma migrate deploy

# 3. Verify
npx prisma studio
```

---

## 🐳 Step 2: Build & Push Docker Images

### 2.1 Build Backend with AI Services

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 290817091060.dkr.ecr.us-east-1.amazonaws.com

# Build backend image
docker build -f Dockerfile.backend -t uploadit-backend:ai-assistant .

# Tag for ECR
docker tag uploadit-backend:ai-assistant 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-backend:ai-assistant
docker tag uploadit-backend:ai-assistant 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-backend:latest

# Push to ECR
docker push 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-backend:ai-assistant
docker push 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-backend:latest
```

### 2.2 Build Frontend with Assistant Page

```bash
# Build frontend image
docker build -f Dockerfile.frontend -t uploadit-frontend:ai-assistant .

# Tag for ECR
docker tag uploadit-frontend:ai-assistant 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-frontend:ai-assistant
docker tag uploadit-frontend:ai-assistant 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-frontend:latest

# Push to ECR
docker push 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-frontend:ai-assistant
docker push 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-frontend:latest
```

---

## ☸️ Step 3: Update Kubernetes Secrets

Secrets-д GEMINI_API_KEY аль хэдийн нэмсэн:

```bash
# Apply updated secrets
kubectl apply -f k8s/secrets.yaml

# Verify secrets
kubectl get secret yellowbooks-secrets -n yellowbooks -o yaml
```

---

## 📦 Step 4: Deploy Updated Applications

### 4.1 Deploy Backend

```bash
# Apply updated backend deployment (with GEMINI_API_KEY env var)
kubectl apply -f k8s/backend-deployment.yaml

# Check rollout status
kubectl rollout status deployment/backend -n yellowbooks

# Verify pods
kubectl get pods -n yellowbooks -l app=backend
```

### 4.2 Deploy Frontend

```bash
# Apply frontend deployment
kubectl apply -f k8s/frontend-deployment.yaml

# Check rollout status
kubectl rollout status deployment/frontend -n yellowbooks

# Verify pods
kubectl get pods -n yellowbooks -l app=frontend
```

---

## 🗄️ Step 5: Generate Embeddings (CRITICAL!)

Энэ алхам маш чухал - бүх бизнесүүдийн embedding үүсгэх хэрэгтэй.

### Option A: One-time Job (Kubernetes)

Create a one-time job to generate embeddings:

```bash
# Create embedding generation job
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: generate-embeddings
  namespace: yellowbooks
spec:
  template:
    spec:
      containers:
      - name: embedding-generator
        image: 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-backend:latest
        command: ["npx", "ts-node", "tools/embed-businesses.ts"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: yellowbooks-secrets
              key: DATABASE_URL
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: yellowbooks-secrets
              key: GEMINI_API_KEY
      restartPolicy: Never
  backoffLimit: 3
EOF

# Monitor job
kubectl logs -n yellowbooks -l job-name=generate-embeddings -f

# Check completion
kubectl get job generate-embeddings -n yellowbooks
```

### Option B: Manual from Pod

```bash
# Execute in backend pod
kubectl exec -it -n yellowbooks deployment/backend -- npx ts-node tools/embed-businesses.ts
```

### Option C: Local then Upload

```bash
# Run locally
npm run ai:embed

# Database will be updated
```

---

## 🧪 Step 6: Test AI Assistant

### 6.1 Check API Endpoint

```bash
# Get service endpoint
kubectl get svc -n yellowbooks

# Test AI search endpoint
BACKEND_URL=$(kubectl get svc backend -n yellowbooks -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

curl -X POST "http://$BACKEND_URL:4000/api/ai/yellow-books/search" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Төв дүүрэгт сайн ресторан байна уу?",
    "limit": 3
  }'
```

### 6.2 Test Frontend UI

```bash
# Get ingress URL
kubectl get ingress -n yellowbooks

# Access in browser:
# https://yellowbooks.54-86-232-109.nip.io:31529/assistant
```

### 6.3 Verify Logs

```bash
# Backend logs
kubectl logs -n yellowbooks -l app=backend --tail=100

# Frontend logs  
kubectl logs -n yellowbooks -l app=frontend --tail=100

# Look for:
# ✅ "AI Search Request"
# ✅ "Cache HIT" or "Cache MISS"
# ✅ "AI Search completed"
```

---

## 🔍 Step 7: Monitoring & Verification

### 7.1 Check All Pods

```bash
kubectl get pods -n yellowbooks

# Expected:
# backend-xxx-xxx        2/2     Running
# frontend-xxx-xxx       2/2     Running
# postgres-xxx-xxx       1/1     Running
```

### 7.2 Check HPA (Auto-scaling)

```bash
kubectl get hpa -n yellowbooks

# Backend and frontend should auto-scale based on CPU
```

### 7.3 Check Ingress & TLS

```bash
kubectl get ingress -n yellowbooks -o wide

# Should show HTTPS endpoints
```

### 7.4 Database Check

```bash
# Connect to PostgreSQL
kubectl exec -it -n yellowbooks deployment/postgres -- psql -U yellowbooks_user -d yellowbooks

# Check embeddings
SELECT id, business_name, 
  CASE WHEN embedding IS NOT NULL THEN 'HAS EMBEDDING' ELSE 'NO EMBEDDING' END 
FROM yellow_books 
LIMIT 5;

# Exit
\q
```

---

## 🚀 Step 8: GitHub Actions CI/CD

Updated workflows автоматаар deploy хийнэ:

### Backend Workflow (`.github/workflows/backend.yml`)

```yaml
# Already configured with OIDC
# Pushes to ECR and updates EKS deployment
```

### Trigger Deployment

```bash
# Push to main branch
git add .
git commit -m "feat: Add AI Assistant to production"
git push origin main

# GitHub Actions will:
# 1. Build Docker image
# 2. Push to ECR
# 3. Update EKS deployment
# 4. Wait for rollout
```

Monitor at: https://github.com/Javkhlan42/uploadit/actions

---

## ⚙️ Configuration Reference

### Environment Variables (Production)

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://...` | Secret |
| `GEMINI_API_KEY` | `AIzaSyA...` | Secret |
| `REDIS_URL` | `redis://localhost:6379` | Secret (optional) |
| `NODE_ENV` | `production` | ConfigMap |
| `PORT` | `4000` | ConfigMap |
| `NEXT_PUBLIC_API_URL` | `/` | Frontend build-time |

### Resource Limits

```yaml
Backend:
  requests: 256Mi / 250m CPU
  limits: 512Mi / 500m CPU
  replicas: 2 (auto-scale to 10)

Frontend:
  requests: 256Mi / 250m CPU
  limits: 512Mi / 500m CPU
  replicas: 2 (auto-scale to 10)
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@google/generative-ai'"

**Cause**: npm install didn't run properly in Docker build

**Solution**:
```bash
# Rebuild image
docker build --no-cache -f Dockerfile.backend -t uploadit-backend:latest .
docker push 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-backend:latest

# Force restart
kubectl rollout restart deployment/backend -n yellowbooks
```

### Issue: "No businesses found" in AI search

**Cause**: Embeddings not generated

**Solution**:
```bash
# Run embedding job
kubectl apply -f k8s/embedding-job.yaml  # (if created)
# OR
kubectl exec -it -n yellowbooks deployment/backend -- npm run ai:embed
```

### Issue: "Quota exceeded" from Gemini API

**Cause**: Rate limit reached

**Solution**:
- Wait 1-2 minutes
- Check API quota in Google Cloud Console
- Consider increasing quota

### Issue: Redis connection errors

**Cause**: Redis not running in cluster

**Solution**: 
- System works without Redis (graceful fallback)
- To add Redis, create deployment:
```bash
kubectl apply -f k8s/redis-deployment.yaml  # (need to create)
```

### Issue: Backend pod CrashLoopBackOff

**Check logs**:
```bash
kubectl logs -n yellowbooks -l app=backend --previous

# Common fixes:
# 1. Database connection issue → Check DATABASE_URL
# 2. Missing secrets → Verify secrets.yaml applied
# 3. Migration not run → Run migration job
```

---

## 📊 Performance Monitoring

### Metrics to Watch

1. **Response Times**
   - Uncached AI search: < 3s
   - Cached AI search: < 100ms
   - Regular API: < 200ms

2. **Pod Health**
   ```bash
   kubectl top pods -n yellowbooks
   ```

3. **HPA Scaling**
   ```bash
   watch kubectl get hpa -n yellowbooks
   ```

4. **Error Rates**
   ```bash
   kubectl logs -n yellowbooks -l app=backend | grep -i error
   ```

---

## 🎯 Success Criteria

✅ **Backend Deployed**
- Pods running: 2/2
- Health checks passing
- AI endpoint responding

✅ **Frontend Deployed**
- Pods running: 2/2
- `/assistant` route accessible
- UI rendering correctly

✅ **Database**
- Migration completed
- Embeddings generated for all businesses
- `embedding` column populated

✅ **AI Functionality**
- Semantic search working
- Mongolian language responses
- Top 5 businesses returned
- Similarity scores calculated

✅ **Performance**
- Response time < 3s (uncached)
- HPA scaling based on load
- No memory/CPU issues

✅ **Security**
- HTTPS working
- Secrets properly configured
- OIDC authentication active

---

## 📝 Post-Deployment Checklist

- [ ] All pods running
- [ ] Migrations completed
- [ ] Embeddings generated
- [ ] AI endpoint tested
- [ ] Frontend `/assistant` working
- [ ] HTTPS access confirmed
- [ ] Logs clean (no errors)
- [ ] HPA configured
- [ ] GitHub Actions workflows updated
- [ ] Documentation updated

---

## 🔄 Rollback Plan

Хэрэв алдаа гарвал:

```bash
# Rollback backend
kubectl rollout undo deployment/backend -n yellowbooks

# Rollback frontend
kubectl rollout undo deployment/frontend -n yellowbooks

# Restore previous image
kubectl set image deployment/backend backend=290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-backend:previous -n yellowbooks
```

---

## 📞 Support & Next Steps

### Documentation
- [AI_ASSISTANT_README.md](../AI_ASSISTANT_README.md) - Technical details
- [QUICKSTART_AI.md](../QUICKSTART_AI.md) - Local development
- [DEPLOY.md](../DEPLOY.md) - Main deployment guide

### Monitoring
- GitHub Actions: https://github.com/Javkhlan42/uploadit/actions
- AWS Console: https://console.aws.amazon.com/eks
- Application: https://yellowbooks.54-86-232-109.nip.io:31529

### Future Enhancements
- Add Redis deployment for better caching
- Set up CloudWatch monitoring
- Configure log aggregation
- Add Prometheus metrics
- Implement rate limiting

---

**Status**: ✅ **Ready for Production Deployment**

**Last Updated**: December 19, 2025

**Version**: AI Assistant v1.0.0

---

## 🚀 Quick Deploy Commands

```bash
# Complete deployment in one go:

# 1. Apply secrets
kubectl apply -f k8s/secrets.yaml

# 2. Build and push images (or let GitHub Actions do it)
# ... (see Step 2 above)

# 3. Deploy applications
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# 4. Generate embeddings
kubectl exec -it -n yellowbooks deployment/backend -- npm run ai:embed

# 5. Test
curl -X POST "http://$(kubectl get svc backend -n yellowbooks -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'):4000/api/ai/yellow-books/search" \
  -H "Content-Type: application/json" \
  -d '{"question": "Төв дүүрэгт ресторан байна уу?", "limit": 3}'

# Done! 🎉
```
