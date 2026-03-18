# Docker Quick Reference Card

## 🚀 Quick Start

### Start the Application
```bash
docker-compose --env-file .env.docker up -d
```

### Stop the Application
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f backend
```

### Check Status
```bash
docker-compose ps
```

---

## 📊 Common Commands

### Build Image
```bash
docker build -t pravasi-backend:latest .
```

### Run Container (Direct)
```bash
docker run -d -p 8000:8000 \
  -e MONGO_URL="mongodb+srv://..." \
  -e DB_NAME="luxtravel" \
  -e API_KEY="your-key" \
  -e CORS_ORIGINS="*" \
  pravasi-backend:latest
```

### View Container Logs
```bash
docker logs -f pravasi-backend-test
docker logs --tail 50 pravasi-backend-test
```

### Inspect Container
```bash
docker inspect pravasi-backend-test
docker stats pravasi-backend-test
```

### Enter Container Shell
```bash
docker exec -it pravasi-backend-test /bin/bash
```

### Stop Container
```bash
docker stop pravasi-backend-test
```

### Remove Container
```bash
docker rm pravasi-backend-test
```

---

## 🧪 Test API Endpoints

### Test Root Endpoint
```bash
curl http://localhost:8000/api/
```

### Get All Vehicles
```bash
curl http://localhost:8000/api/vehicles
```

### Get Specific Vehicle
```bash
curl http://localhost:8000/api/vehicles/sedan
```

### Generate Quote
```bash
curl -X POST http://localhost:8000/api/getQuotation \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "sedan",
    "from_location": "Delhi",
    "to_location": "Agra",
    "travel_date": "2026-04-01T10:00:00Z",
    "trip_type": "outstation",
    "distance_km": 230,
    "travelers": 4
  }'
```

### Submit Callback
```bash
curl -X POST http://localhost:8000/api/callback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "message": "Interested in booking",
    "vehicle_id": "sedan"
  }'
```

### Access Swagger Documentation
```
http://localhost:8000/docs
```

---

## 📋 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose down
docker-compose up -d --build

# Check environment
docker-compose config
```

### Port 8000 in Use
```bash
# Find what's using the port
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port in docker-compose.yml
```

### Database Connection Error
```bash
# Test MongoDB connection
docker exec pravasi-backend python << 'EOF'
import asyncio
import motor.motor_asyncio
import certifi

async def test():
    client = motor.motor_asyncio.AsyncIOMotorClient(
        "mongodb+srv://anilgehlotn:anil30@recoil-cluster.5bd16z2.mongodb.net/",
        tlsCAFile=certifi.where()
    )
    result = await client.admin.command('ping')
    print("✅ MongoDB Connected:", result)

asyncio.run(test())
EOF
```

### View Environment Variables
```bash
docker-compose config | grep -A 10 "environment:"
docker exec pravasi-backend env | grep -i mongo
```

---

## 🔍 Monitoring

### Real-time Container Stats
```bash
docker stats pravasi-backend-test
```

### Health Check Status
```bash
docker inspect pravasi-backend-test --format='{{.State.Health.Status}}'
```

### List All Containers
```bash
docker ps -a
```

### List All Images
```bash
docker images
```

---

## 🔄 Update & Restart

### Rebuild with Latest Code
```bash
docker-compose down
docker build -t pravasi-backend:latest .
docker-compose up -d --build
```

### Just Restart Container
```bash
docker-compose restart backend
```

### Restart with Fresh Start
```bash
docker-compose down -v
docker-compose up -d
```

---

## 💾 Backup & Clean Up

### View Images & Containers
```bash
docker images | grep pravasi
docker ps -a | grep pravasi
```

### Export Image
```bash
docker save pravasi-backend:latest > pravasi-backend-latest.tar
```

### Load Image
```bash
docker load < pravasi-backend-latest.tar
```

### Remove Unused Images
```bash
docker image prune

# Remove specific image
docker rmi pravasi-backend:latest
```

### Remove All Stopped Containers
```bash
docker container prune
```

---

## 🔐 Security

### Rotate API Key
Edit `.env.docker`:
```bash
API_KEY=$(openssl rand -hex 32)
# Update the .env.docker file with new key
docker-compose restart backend
```

### View Secrets in Container
```bash
docker exec pravasi-backend env | grep -i key
```

### Verify CORS Settings
```bash
docker exec pravasi-backend curl -i -X OPTIONS http://localhost:8000/api/
```

---

## 📝 Environment Variables Reference

| Variable | Example | Required |
|----------|---------|----------|
| MONGO_URL | mongodb+srv://user:pass@cluster.mongodb.net/ | ✅ Yes |
| DB_NAME | luxtravel | ✅ Yes |
| GOOGLE_API_KEY | AIzaSy... | ⚠️ Optional* |
| API_KEY | secret-key-here | ✅ Yes |
| CORS_ORIGINS | * or http://localhost:3000 | ⚠️ Optional |

*Google API Key is optional; system uses fallback distances if not provided.

---

## 📚 Useful Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Container image definition |
| `docker-compose.yml` | Service orchestration |
| `requirements.txt` | Python dependencies |
| `server.py` | FastAPI application |
| `.env.docker` | Environment configuration |
| `DOCKER_VERIFICATION_REPORT.md` | Test results |
| `DOCKER_COMPOSE_GUIDE.md` | Deployment guide |
| `DOCKER_DEPLOYMENT_SUMMARY.md` | Overview & next steps |

---

## 🎯 One-Command Deployment

### Development
```bash
docker-compose up -d && sleep 5 && curl http://localhost:8000/api/
```

### Full Reset & Start
```bash
docker-compose down -v && docker build -t pravasi-backend:latest . && docker-compose --env-file .env.docker up -d
```

### Health Check Loop
```bash
while true; do 
  echo "$(date): $(curl -s http://localhost:8000/api/ | jq -r '.message')"
  sleep 10
done
```

---

## 📱 Docker Compose Cheat Sheet

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# View services status
docker-compose ps

# View configuration
docker-compose config

# Rebuild
docker-compose build

# Rebuild and restart
docker-compose up -d --build

# Execute command in service
docker-compose exec backend bash

# View service resources
docker-compose stats
```

---

## ✅ Pre-Production Checklist

- [ ] `.env.docker` file created with production values
- [ ] API_KEY updated from default placeholder
- [ ] MONGO_URL verified (can connect)
- [ ] CORS_ORIGINS set to production domain
- [ ] GOOGLE_API_KEY configured (or fallback tested)
- [ ] Logs directory created and mounted
- [ ] Health checks passing
- [ ] All 8 API endpoints responding
- [ ] Database contains 15 vehicles
- [ ] Documentation reviewed

---

**Last Updated:** March 18, 2026  
**Docker Status:** ✅ Fully Operational  
**API Status:** ✅ All Endpoints Working
