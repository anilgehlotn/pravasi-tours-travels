# Docker Environment Setup Guide
## How to Run Your FastAPI Backend in Docker (Correctly!)

---

## ❌ What Was Wrong (The Error)

Your original Dockerfile had this line:
```dockerfile
COPY .env .
```

**Why it failed:**
- Docker tried to copy `.env` file INTO the image during build
- But `.env` wasn't found in the build context
- Error: `"failed to calculate checksum: '/.env': not found"`

---

## ✅ What's Fixed Now

**Removed** the `.env` copy line entirely!

**Why this is better:**
- ✅ Secrets (passwords, API keys) are NOT hardcoded in the image
- ✅ Same image can be used in dev, staging, and production
- ✅ Follows Docker/security best practices
- ✅ Environment variables passed at **runtime**, not build time

---

## 📋 Quick Start - 3 Ways to Run Your Container

### **Method 1: Using `--env-file` (Recommended for docker-compose)**

```bash
# 1. Make sure you have .env in your backend directory
cat backend/.env

# 2. Run container with --env-file
docker run -d \
  --name pravasi-backend \
  --env-file ./backend/.env \
  -p 8000:8000 \
  pravasi-backend:fixed
```

### **Method 2: Pass Environment Variables Directly**

```bash
docker run -d \
  --name pravasi-backend \
  -e MONGO_URL="mongodb+srv://anilgehlotn:anil30@..." \
  -e DB_NAME="luxtravel" \
  -e GOOGLE_API_KEY="AIzaSy..." \
  -e API_KEY="your-secret" \
  -e CORS_ORIGINS="*" \
  -p 8000:8000 \
  pravasi-backend:fixed
```

### **Method 3: Using docker-compose (Best for Production)**

```bash
# Run with your .env file
docker-compose --env-file ./backend/.env up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

---

## 🐳 Your Updated Dockerfile

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY server.py .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/').read()" || exit 1

# Run the application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Key differences:**
- ❌ Removed: `COPY .env .`
- ✅ Secrets passed at runtime via environment variables

---

## 📝 Your `.env` File (For Reference)

Keep this in your `backend/` folder but **DON'T commit to git**:

```bash
# backend/.env
MONGO_URL=mongodb+srv://anilgehlotn:anil30@recoil-cluster.5bd16z2.mongodb.net/
DB_NAME=luxtravel
GOOGLE_API_KEY=AIzaSyBOYMtfiP_j6WuRMC2R4nXCJjitQ12tXp8
CORS_ORIGINS=*
API_KEY=your-secret-api-key-here
```

**Important:** Add `.env` to `.gitignore` so secrets are never committed!

```bash
# .gitignore
.env
.env.local
.env.*.local
```

---

## 🚀 Your docker-compose.yml (Already Correct!)

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pravasi-backend
    ports:
      - "8000:8000"
    environment:
      MONGO_URL: ${MONGO_URL}
      DB_NAME: ${DB_NAME}
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}
      API_KEY: ${API_KEY}
      CORS_ORIGINS: ${CORS_ORIGINS:-*}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/').read()"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - pravasi-network
    volumes:
      - ./logs:/app/logs

networks:
  pravasi-network:
    driver: bridge
```

**How to use:**
```bash
# Start container
docker-compose --env-file .env up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

---

## ✅ Testing Your Container

```bash
# Check if container is running
docker ps | grep pravasi

# View logs
docker logs pravasi-backend

# Test API endpoint
curl http://localhost:8000/api/

# Expected response:
# {"message":"Pravasi Tours & Travels API is running"}

# Test vehicles endpoint
curl http://localhost:8000/api/vehicles | python -m json.tool | head -20

# Test health check
curl http://localhost:8000/api/health
```

---

## 🔒 Security Best Practices (For Production)

### 1. **Never commit `.env` to Git**
```bash
echo ".env" >> .gitignore
git rm --cached .env  # If already committed
```

### 2. **Use environment variables from your deployment platform**
- **AWS:** Use AWS Secrets Manager or Parameter Store
- **Docker Swarm:** Use Docker Secrets
- **Kubernetes:** Use Kubernetes Secrets
- **Heroku:** Use Config Vars
- **Railway/Render:** Use environment variables UI

### 3. **For production, use stronger secrets**
```bash
# Generate strong API key
openssl rand -hex 32

# Result example:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 4. **Use a secret manager**
```bash
# Example: Using AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id pravasi/production
```

---

## 📊 Docker Build Process Explained

### Step-by-step what happens:

1. **`FROM python:3.11-slim`** - Download base Python image (~150MB)
2. **`WORKDIR /app`** - Create `/app` folder inside container
3. **`ENV ...`** - Set environment variables
4. **`RUN apt-get update && apt-get install gcc`** - Install C compiler
5. **`COPY requirements.txt .`** - Copy your Python dependencies list
6. **`RUN pip install -r requirements.txt`** - Install all Python packages
7. **`COPY server.py .`** - Copy your FastAPI app code
8. **`EXPOSE 8000`** - Tell Docker the app listens on port 8000
9. **`HEALTHCHECK`** - Docker checks if app is healthy
10. **`CMD ["uvicorn", "server:app", ...]`** - Start the app

**Note:** `.env` is NOT copied because we pass it at runtime!

---

## 🛠️ Troubleshooting

### Problem: "Port 8000 already in use"
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use a different port
docker run -d -p 8001:8000 pravasi-backend:fixed
```

### Problem: "Connection refused to MongoDB"
```bash
# Check if MONGO_URL is set correctly
docker exec pravasi-backend env | grep MONGO

# Test MongoDB connection
docker exec pravasi-backend python -c "import pymongo; print('MongoDB OK')"
```

### Problem: "Container exits immediately"
```bash
# Check logs
docker logs pravasi-backend

# Run container in foreground to see errors
docker run --env-file .env -p 8000:8000 pravasi-backend:fixed
```

---

## 📚 Summary

| Before | After |
|--------|-------|
| ❌ `.env` copied into image | ✅ `.env` passed at runtime |
| ❌ Secrets exposed in image | ✅ Secrets secure, only in containers |
| ❌ Build fails without `.env` | ✅ Build works anywhere |
| ❌ Same image for all environments | ✅ One image for dev/prod |

---

## 🎯 Next Steps

1. ✅ Remove `COPY .env .` from Dockerfile (DONE!)
2. ✅ Rebuild Docker image
   ```bash
   docker build -t pravasi-backend:latest .
   ```
3. ✅ Test with docker-compose
   ```bash
   docker-compose --env-file .env up -d
   ```
4. ✅ Verify API works
   ```bash
   curl http://localhost:8000/api/
   ```
5. ✅ Push to GitHub (ready for deployment!)

---

**Questions?** Check Docker docs: https://docs.docker.com/compose/env-file/
