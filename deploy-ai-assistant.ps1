# deploy-ai-assistant.ps1
# Quick deployment script for AI Assistant to production (Windows)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Yellow Books AI Assistant - Production Deployment" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$AWS_REGION = "us-east-1"
$AWS_ACCOUNT = "290817091060"
$ECR_BACKEND = "$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/uploadit-backend"
$ECR_FRONTEND = "$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/uploadit-frontend"
$NAMESPACE = "yellowbooks"

# Functions
function Log-Info {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Log-Warn {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Log-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Log-Error "AWS CLI not found. Please install it first."
    exit 1
}

if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Log-Error "kubectl not found. Please install it first."
    exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Log-Error "Docker not found. Please install it first."
    exit 1
}

Log-Info "All prerequisites met"
Write-Host ""

# Check EKS connection
Write-Host "🔗 Checking EKS connection..." -ForegroundColor Cyan
try {
    kubectl get nodes 2>&1 | Out-Null
    Log-Info "Already connected to EKS cluster"
} catch {
    Log-Warn "Not connected to EKS cluster. Connecting..."
    aws eks update-kubeconfig --name hilarious-synth-crow --region $AWS_REGION
    Log-Info "Connected to EKS cluster"
}
Write-Host ""

# Login to ECR
Write-Host "🔐 Logging in to ECR..." -ForegroundColor Cyan
$password = aws ecr get-login-password --region $AWS_REGION
$password | docker login --username AWS --password-stdin "$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com"
Log-Info "ECR login successful"
Write-Host ""

# Build and push backend
Write-Host "🐳 Building backend image..." -ForegroundColor Cyan
docker build -f Dockerfile.backend -t uploadit-backend:ai-assistant .
docker tag uploadit-backend:ai-assistant "$ECR_BACKEND:ai-assistant"
docker tag uploadit-backend:ai-assistant "$ECR_BACKEND:latest"
Log-Info "Backend image built"

Write-Host "📤 Pushing backend to ECR..." -ForegroundColor Cyan
docker push "$ECR_BACKEND:ai-assistant"
docker push "$ECR_BACKEND:latest"
Log-Info "Backend pushed to ECR"
Write-Host ""

# Build and push frontend
Write-Host "🐳 Building frontend image..." -ForegroundColor Cyan
docker build -f Dockerfile.frontend -t uploadit-frontend:ai-assistant .
docker tag uploadit-frontend:ai-assistant "$ECR_FRONTEND:ai-assistant"
docker tag uploadit-frontend:ai-assistant "$ECR_FRONTEND:latest"
Log-Info "Frontend image built"

Write-Host "📤 Pushing frontend to ECR..." -ForegroundColor Cyan
docker push "$ECR_FRONTEND:ai-assistant"
docker push "$ECR_FRONTEND:latest"
Log-Info "Frontend pushed to ECR"
Write-Host ""

# Apply Kubernetes manifests
Write-Host "☸️  Deploying to Kubernetes..." -ForegroundColor Cyan

Write-Host "  → Applying secrets..."
kubectl apply -f k8s/secrets.yaml
Log-Info "Secrets applied"

Write-Host "  → Deploying backend..."
kubectl apply -f k8s/backend-deployment.yaml
Log-Info "Backend deployment applied"

Write-Host "  → Deploying frontend..."
kubectl apply -f k8s/frontend-deployment.yaml
Log-Info "Frontend deployment applied"

Write-Host ""
Write-Host "⏳ Waiting for rollouts to complete..." -ForegroundColor Cyan

kubectl rollout status deployment/backend -n $NAMESPACE --timeout=5m
Log-Info "Backend rolled out successfully"

kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=5m
Log-Info "Frontend rolled out successfully"

Write-Host ""

# Generate embeddings
Write-Host "🤖 Generating embeddings..." -ForegroundColor Cyan
Log-Warn "This may take 2-5 minutes..."

$BACKEND_POD = kubectl get pod -n $NAMESPACE -l app=backend -o jsonpath='{.items[0].metadata.name}'
try {
    kubectl exec -it -n $NAMESPACE $BACKEND_POD -- npm run ai:embed
} catch {
    Log-Warn "Embedding generation may have failed. Check logs."
}

Write-Host ""

# Verify deployment
Write-Host "🔍 Verifying deployment..." -ForegroundColor Cyan

$BACKEND_PODS = (kubectl get pods -n $NAMESPACE -l app=backend --field-selector=status.phase=Running --no-headers | Measure-Object).Count
$FRONTEND_PODS = (kubectl get pods -n $NAMESPACE -l app=frontend --field-selector=status.phase=Running --no-headers | Measure-Object).Count

if ($BACKEND_PODS -ge 2) {
    Log-Info "Backend pods running: $BACKEND_PODS/2"
} else {
    Log-Error "Backend pods not running: $BACKEND_PODS/2"
}

if ($FRONTEND_PODS -ge 2) {
    Log-Info "Frontend pods running: $FRONTEND_PODS/2"
} else {
    Log-Error "Frontend pods not running: $FRONTEND_PODS/2"
}

Write-Host ""

# Get access URLs
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
kubectl get ingress -n $NAMESPACE -o wide

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "✨ Deployment Complete!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test AI endpoint:"
Write-Host "     Visit: https://yellowbooks.54-86-232-109.nip.io:31529/assistant"
Write-Host ""
Write-Host "  2. Check logs:"
Write-Host "     kubectl logs -n $NAMESPACE -l app=backend --tail=50"
Write-Host ""
Write-Host "  3. Monitor pods:"
Write-Host "     kubectl get pods -n $NAMESPACE -w"
Write-Host ""
Write-Host "🎉 AI Assistant is now live in production!" -ForegroundColor Green
