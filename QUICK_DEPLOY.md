# ⚡ Production Deploy - Quick Reference

## 🚀 One-Line Deploy

```powershell
# Windows PowerShell (RECOMMENDED)
cd "c:\Users\user\Desktop\web ahisan\yellow-book"
.\deploy-ai-assistant.ps1
```

```bash
# Linux/Mac
cd yellow-book
chmod +x deploy-ai-assistant.sh
./deploy-ai-assistant.sh
```

---

## 📋 Prerequisites Checklist

- [x] AWS CLI configured
- [x] kubectl configured (EKS access)
- [x] Docker running
- [x] GitHub repo: Javkhlan42/uploadit
- [x] Files updated:
  - [x] k8s/secrets.yaml (GEMINI_API_KEY)
  - [x] k8s/backend-deployment.yaml (env vars)

---

## 🔧 Manual Commands (if needed)

```bash
# 1. Login ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 290817091060.dkr.ecr.us-east-1.amazonaws.com

# 2. Build & Push
docker build -f Dockerfile.backend -t 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-backend:latest . && docker push 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-backend:latest
docker build -f Dockerfile.frontend -t 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-frontend:latest . && docker push 290817091060.dkr.ecr.us-east-1.amazonaws.com/uploadit-frontend:latest

# 3. Deploy
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# 4. Generate Embeddings
kubectl exec -it -n yellowbooks deployment/backend -- npm run ai:embed
```

---

## ✅ Verify Deployment

```bash
# Pods
kubectl get pods -n yellowbooks

# Logs
kubectl logs -n yellowbooks -l app=backend --tail=50

# Test API
curl -X POST http://54.86.232.109:31003/api/ai/yellow-books/search \
  -H "Content-Type: application/json" \
  -d '{"question":"Төв дүүрэгт ресторан байна уу?","limit":3}'
```

---

## 🌐 Production URLs

**Frontend**: https://yellowbooks.54-86-232-109.nip.io:31529/assistant

**API**: http://54.86.232.109:31003/api/ai/yellow-books/search

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot find module | `kubectl rollout restart deployment/backend -n yellowbooks` |
| No businesses found | `kubectl exec -it -n yellowbooks deployment/backend -- npm run ai:embed` |
| Pod crash | `kubectl logs -n yellowbooks -l app=backend --previous` |
| Rollback | `kubectl rollout undo deployment/backend -n yellowbooks` |

---

## 📊 Success Indicators

✅ Pods: `kubectl get pods -n yellowbooks` → All Running  
✅ API: `curl http://54.86.232.109:31003/api` → 200 OK  
✅ UI: Visit /assistant → Page loads  
✅ Logs: No errors about missing modules  

---

## 📚 Full Documentation

- **Step-by-step**: [DEPLOY_AI_ASSISTANT.md](DEPLOY_AI_ASSISTANT.md)
- **Summary**: [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- **Technical**: [AI_ASSISTANT_README.md](AI_ASSISTANT_README.md)

---

**Estimated Time**: 10-15 minutes

**Status**: ✅ Ready to deploy

**Command**: `.\deploy-ai-assistant.ps1`
