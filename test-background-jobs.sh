#!/bin/bash
# Background Job System - Testing Script
# This script demonstrates how to test the background job system locally

echo "═══════════════════════════════════════════════════════════"
echo "Background Job System Testing"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}[1/5] Checking prerequisites...${NC}"

# Check if Redis is running
if command -v redis-cli &> /dev/null; then
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis is running${NC}"
    else
        echo -e "${YELLOW}⚠ Redis is not running. Start with: redis-server${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Redis CLI not found. Make sure Redis is running.${NC}"
fi

# Check Node
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js is installed$(node --version)${NC}"
else
    echo -e "${YELLOW}⚠ Node.js not found${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}[2/5] Installing dependencies...${NC}"
npm install --quiet

echo ""
echo -e "${BLUE}[3/5] Running database migration...${NC}"
npx prisma migrate dev --skip-generate 2>/dev/null || echo -e "${YELLOW}⚠ Using existing database${NC}"

echo ""
echo -e "${BLUE}[4/5] Starting API server in background...${NC}"
npm run start:api &
API_PID=$!
sleep 3
echo -e "${GREEN}✓ API server started (PID: $API_PID)${NC}"

echo ""
echo -e "${BLUE}[5/5] Starting worker in background...${NC}"
npm run worker &
WORKER_PID=$!
sleep 3
echo -e "${GREEN}✓ Worker started (PID: $WORKER_PID)${NC}"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "System is ready! Running tests..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 1: Health check
echo -e "${BLUE}TEST 1: API Health Check${NC}"
HEALTH=$(curl -s http://localhost:3333/api | jq -r '.message')
if [[ "$HEALTH" == "Welcome to Yellow Book API!"* ]]; then
    echo -e "${GREEN}✓ API is responsive${NC}"
else
    echo -e "${YELLOW}⚠ API health check failed${NC}"
fi

echo ""

# Test 2: Enqueue sign-in notification
echo -e "${BLUE}TEST 2: Enqueue Sign-In Notification${NC}"
JOB_ID=$(curl -s -X POST http://localhost:3333/api/jobs/signin-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "test@example.com",
    "name": "Test User",
    "provider": "github",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 Test Browser"
  }' | jq -r '.jobId')

if [[ ! -z "$JOB_ID" && "$JOB_ID" != "null" ]]; then
    echo -e "${GREEN}✓ Job enqueued successfully${NC}"
    echo "   Job ID: $JOB_ID"
else
    echo -e "${YELLOW}⚠ Failed to enqueue job${NC}"
fi

echo ""

# Test 3: Check job status
echo -e "${BLUE}TEST 3: Check Job Status${NC}"
sleep 2 # Give worker time to process
if [[ ! -z "$JOB_ID" && "$JOB_ID" != "null" ]]; then
    STATUS=$(curl -s http://localhost:3333/api/jobs/$JOB_ID | jq -r '.status')
    echo -e "${GREEN}✓ Job Status: $STATUS${NC}"
    curl -s http://localhost:3333/api/jobs/$JOB_ID | jq '.'
else
    echo -e "${YELLOW}⚠ Cannot check status without valid job ID${NC}"
fi

echo ""

# Test 4: Rate limiting test
echo -e "${BLUE}TEST 4: Rate Limiting (10 emails per user per hour)${NC}"
SUCCESS=0
FAILED=0
for i in {1..12}; do
    RESULT=$(curl -s -X POST http://localhost:3333/api/jobs/signin-notification \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": \"rate-limit-user\",
        \"email\": \"rate-limit-user@example.com\",
        \"name\": \"Rate Limit User\",
        \"provider\": \"github\",
        \"ipAddress\": \"192.168.1.$((i % 255))\",
        \"userAgent\": \"Test Browser\"
      }" | jq -r '.message // .error')
    
    if [[ "$RESULT" == "Sign-in notification job enqueued"* ]]; then
        ((SUCCESS++))
    else
        ((FAILED++))
    fi
done

echo "   Enqueued: $SUCCESS, Rate Limited: $FAILED"
if [[ $FAILED -gt 0 ]]; then
    echo -e "${GREEN}✓ Rate limiting is working${NC}"
else
    echo -e "${YELLOW}⚠ Rate limiting may not be active${NC}"
fi

echo ""

# Test 5: DLQ check
echo -e "${BLUE}TEST 5: Check Dead Letter Queue${NC}"
DLQ=$(curl -s http://localhost:3333/api/admin/dlq | jq '.count')
echo -e "${GREEN}✓ DLQ entries: $DLQ${NC}"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Testing complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Services running:"
echo "  - API Server: http://localhost:3333"
echo "  - Redis: localhost:6379"
echo ""
echo "Useful commands:"
echo "  redis-cli KEYS 'bull:*'              # View all jobs"
echo "  redis-cli LRANGE 'bull:*:waiting' 0 -1  # View waiting jobs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
