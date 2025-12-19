#!/bin/bash
# deploy-ai-assistant.sh
# Quick deployment script for AI Assistant to production

set -e

echo "🚀 Yellow Books AI Assistant - Production Deployment"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT="290817091060"
ECR_BACKEND="$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/uploadit-backend"
ECR_FRONTEND="$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/uploadit-frontend"
NAMESPACE="yellowbooks"

# Functions
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    log_error "AWS CLI not found. Please install it first."
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found. Please install it first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    log_error "Docker not found. Please install it first."
    exit 1
fi

log_info "All prerequisites met"
echo ""

# Check EKS connection
echo "🔗 Checking EKS connection..."
if ! kubectl get nodes &> /dev/null; then
    log_warn "Not connected to EKS cluster. Connecting..."
    aws eks update-kubeconfig --name hilarious-synth-crow --region $AWS_REGION
    log_info "Connected to EKS cluster"
else
    log_info "Already connected to EKS cluster"
fi
echo ""

# Login to ECR
echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com
log_info "ECR login successful"
echo ""

# Build and push backend
echo "🐳 Building backend image..."
docker build -f Dockerfile.backend -t uploadit-backend:ai-assistant .
docker tag uploadit-backend:ai-assistant $ECR_BACKEND:ai-assistant
docker tag uploadit-backend:ai-assistant $ECR_BACKEND:latest
log_info "Backend image built"

echo "📤 Pushing backend to ECR..."
docker push $ECR_BACKEND:ai-assistant
docker push $ECR_BACKEND:latest
log_info "Backend pushed to ECR"
echo ""

# Build and push frontend
echo "🐳 Building frontend image..."
docker build -f Dockerfile.frontend -t uploadit-frontend:ai-assistant .
docker tag uploadit-frontend:ai-assistant $ECR_FRONTEND:ai-assistant
docker tag uploadit-frontend:ai-assistant $ECR_FRONTEND:latest
log_info "Frontend image built"

echo "📤 Pushing frontend to ECR..."
docker push $ECR_FRONTEND:ai-assistant
docker push $ECR_FRONTEND:latest
log_info "Frontend pushed to ECR"
echo ""

# Apply Kubernetes manifests
echo "☸️  Deploying to Kubernetes..."

echo "  → Applying secrets..."
kubectl apply -f k8s/secrets.yaml
log_info "Secrets applied"

echo "  → Deploying backend..."
kubectl apply -f k8s/backend-deployment.yaml
log_info "Backend deployment applied"

echo "  → Deploying frontend..."
kubectl apply -f k8s/frontend-deployment.yaml
log_info "Frontend deployment applied"

echo ""
echo "⏳ Waiting for rollouts to complete..."

kubectl rollout status deployment/backend -n $NAMESPACE --timeout=5m
log_info "Backend rolled out successfully"

kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=5m
log_info "Frontend rolled out successfully"

echo ""

# Generate embeddings
echo "🤖 Generating embeddings..."
log_warn "This may take 2-5 minutes..."

BACKEND_POD=$(kubectl get pod -n $NAMESPACE -l app=backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it -n $NAMESPACE $BACKEND_POD -- npm run ai:embed || log_warn "Embedding generation may have failed. Check logs."

echo ""

# Verify deployment
echo "🔍 Verifying deployment..."

BACKEND_PODS=$(kubectl get pods -n $NAMESPACE -l app=backend --field-selector=status.phase=Running --no-headers | wc -l)
FRONTEND_PODS=$(kubectl get pods -n $NAMESPACE -l app=frontend --field-selector=status.phase=Running --no-headers | wc -l)

if [ "$BACKEND_PODS" -ge 2 ]; then
    log_info "Backend pods running: $BACKEND_PODS/2"
else
    log_error "Backend pods not running: $BACKEND_PODS/2"
fi

if [ "$FRONTEND_PODS" -ge 2 ]; then
    log_info "Frontend pods running: $FRONTEND_PODS/2"
else
    log_error "Frontend pods not running: $FRONTEND_PODS/2"
fi

echo ""

# Get access URLs
echo "🌐 Access URLs:"
kubectl get ingress -n $NAMESPACE -o wide | grep yellowbooks || log_warn "Ingress not found"

echo ""
echo "======================================================"
echo -e "${GREEN}✨ Deployment Complete!${NC}"
echo "======================================================"
echo ""
echo "📝 Next steps:"
echo "  1. Test AI endpoint:"
echo "     Visit: https://yellowbooks.54-86-232-109.nip.io:31529/assistant"
echo ""
echo "  2. Check logs:"
echo "     kubectl logs -n $NAMESPACE -l app=backend --tail=50"
echo ""
echo "  3. Monitor pods:"
echo "     kubectl get pods -n $NAMESPACE -w"
echo ""
echo "🎉 AI Assistant is now live in production!"
