# Yellow Book Web Application

![CI/CD Pipeline](https://github.com/Javkhlan42/yellow-book/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-20.x-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

A modern Yellow Pages-style directory web application built with Nx monorepo, featuring a Next.js frontend and Express.js backend with Prisma ORM.

## 🤖 Lab 8: AI-Powered Search
- **OpenAI Integration**: Semantic search using text-embedding-ada-002
- **Redis Caching**: 1-hour TTL for AI responses
- **Mongolian Business Data**: 10 businesses from Ulaanbaatar, Darkhan, Erdenet
- **GPT-4 Responses**: Natural language answers to user queries

## 🏗️ Architecture

``` d 
yellow-book/
├── apps/
│   ├── web/          # Next.js frontend (Port 3000)
│   ├── api/          # Express.js backend (Port 3333)
│   ├── web-e2e/      # Playwright E2E tests
│   └── api-e2e/      # API E2E tests
├── libs/
│   ├── contract/     # Shared Zod schemas
│   └── config/       # Shared configuration
├── prisma/           # Database schema & migrations
├── .github/          # CI/CD workflows
└── docker-compose.yml # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x
- npm or yarn
- Docker & Docker Compose (optional)

### Local Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Start both API and Web in development mode
npm run dev

# Or start individually
npx nx serve api    # http://localhost:3333
npx nx serve web    # http://localhost:3000
```

## 🐳 Docker

### Build Images Locally

```bash
# Build API image
docker build -f apps/api/Dockerfile -t yellow-book-api:latest .

# Build Web image
docker build -f apps/web/Dockerfile -t yellow-book-web:latest .
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Test Docker Images Locally

```bash
# Test API
docker run -p 3333:3333 -e DATABASE_URL="file:./dev.db" yellow-book-api:latest

# Test Web
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL="http://localhost:3333" yellow-book-web:latest

# Check health
curl http://localhost:3333/api
curl http://localhost:3000/api/health
```

## 🏗️ CI/CD Pipeline

Our GitHub Actions pipeline includes:

1. **Health Check & Lint** - Code quality checks (ESLint, TypeScript)
2. **Test** - Unit and integration tests with Jest
3. **Build** - Build all applications with Nx
4. **Docker Build & Push** - Build Docker images and push to AWS ECR
5. **Security Scan** - Trivy vulnerability scanning

### Pipeline Status

Check the [Actions tab](https://github.com/Javkhlan42/yellow-book/actions) for the latest run.

### Pipeline Badges

![CI/CD](https://github.com/Javkhlan42/yellow-book/actions/workflows/ci.yml/badge.svg)

## ☁️ AWS ECR Deployment

### Prerequisites

1. AWS Account with ECR enabled
2. IAM Role with ECR permissions
3. GitHub OIDC configured for AWS

### ECR Setup

```powershell
# 1. Configure AWS CLI
aws configure

# 2. Create ECR repositories
aws ecr create-repository `
    --repository-name yellow-book-api `
    --region us-east-1 `
    --image-scanning-configuration scanOnPush=true

aws ecr create-repository `
    --repository-name yellow-book-web `
    --region us-east-1 `
    --image-scanning-configuration scanOnPush=true

# 3. Login to ECR
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$ECR_REGISTRY = "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"

aws ecr get-login-password --region us-east-1 | `
    docker login --username AWS --password-stdin $ECR_REGISTRY

# 4. Tag and push images
docker tag yellow-book-api:latest "$ECR_REGISTRY/yellow-book-api:latest"
docker tag yellow-book-web:latest "$ECR_REGISTRY/yellow-book-web:latest"

docker push "$ECR_REGISTRY/yellow-book-api:latest"
docker push "$ECR_REGISTRY/yellow-book-web:latest"

# 5. Verify images in ECR
aws ecr describe-images --repository-name yellow-book-api --region us-east-1
aws ecr describe-images --repository-name yellow-book-web --region us-east-1
```

### Required GitHub Secrets

Add these secrets in your GitHub repository settings:

- `AWS_ROLE_ARN` - ARN of IAM role with ECR permissions (e.g., `arn:aws:iam::123456789012:role/GitHubActionsRole`)

### ECR Lifecycle Policy

Apply this policy to keep only the last 10 images:

```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
```

### IAM Role Setup (GitHub OIDC)

1. Create an OIDC Identity Provider in AWS IAM:
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`

2. Create IAM Role with Trust Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:Javkhlan42/yellow-book:*"
        }
      }
    }
  ]
}
```

3. Attach ECR Permissions Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:DescribeImages"
      ],
      "Resource": "*"
    }
  ]
}
```

## 📊 Monitoring & Health Checks

### API Health Check
```bash
curl http://localhost:3333/api
```

### Web Health Check
```bash
curl http://localhost:3000/api/health
```

### Docker Health Status
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific app tests
npx nx test api
npx nx test web

# E2E tests
npx nx e2e web-e2e
npx nx e2e api-e2e

# Run tests in watch mode
npx nx test api --watch
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both API and Web in dev mode |
| `npm run build` | Build all applications |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all code |
| `npm run typecheck` | TypeScript type checking |
| `npx nx serve api` | Start API server (port 3333) |
| `npx nx serve web` | Start Web server (port 3000) |
| `npx nx build api` | Build API |
| `npx nx build web` | Build Web |

## 🔐 Environment Variables

### API (.env)
```env
DATABASE_URL="file:./dev.db"
PORT=3333
NODE_ENV=development
```

### Web (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
REVALIDATION_SECRET=your-secret-token
NODE_ENV=development
```

## 📦 Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, Radix UI
- **Backend**: Express.js, Prisma ORM
- **Database**: SQLite (dev), PostgreSQL (prod ready)
- **Monorepo**: Nx
- **Testing**: Jest, Playwright
- **CI/CD**: GitHub Actions
- **Container**: Docker, Docker Compose
- **Cloud**: AWS ECR (current), AWS EKS (upcoming)

## 🎯 Project Features

- 📖 Directory listing with search and filtering
- 🏢 Organization details pages with ISR caching
- 🔄 On-demand revalidation API
- 📱 Responsive design with TailwindCSS
- 🔍 Full-text search capabilities
- 🏗️ Monorepo structure with Nx
- 🐳 Docker-ready for production deployment
- ☁️ AWS ECR integration
- 🔒 Health checks and monitoring

## 🚀 Deployment Checklist

- [x] Dockerfiles for API and Web (30 points)
- [x] Docker Compose for local testing (10 points)
- [x] AWS ECR repositories created (20 points)
- [x] GitHub Actions CI/CD pipeline (30 points)
- [x] README with badges and documentation (10 points)

**Total: 100 points**

## 🔜 Next Steps

- [ ] Deploy to AWS EKS cluster
- [ ] Setup Kubernetes manifests
- [ ] Configure ingress and load balancing
- [ ] Add monitoring with CloudWatch
- [ ] Setup production PostgreSQL database

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Javkhlan42** - [GitHub](https://github.com/Javkhlan42)

---

**Ready for AWS EKS deployment!** 🚀 🐳
