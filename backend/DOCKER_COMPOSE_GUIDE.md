# Docker Compose Production Deployment Guide

## Setup Instructions

### Step 1: Create Production Environment File

Create `.env.docker` in the backend directory:

```bash
cat > .env.docker << 'EOF'
# MongoDB Configuration
MONGO_URL=mongodb+srv://anilgehlotn:anil30@recoil-cluster.5bd16z2.mongodb.net/
DB_NAME=luxtravel

# Google Maps API (Optional - has fallbacks)
GOOGLE_API_KEY=AIzaSyBOYMtfiP_j6WuRMC2R4nXCJjitQ12tXp8

# API Authentication
API_KEY=your-secure-api-key-here-change-in-production

# CORS Configuration
CORS_ORIGINS=*
EOF
```

### Step 2: Start Services

```bash
# Build and start the service
docker-compose --env-file .env.docker up -d

# Or rebuild from scratch
docker-compose --env-file .env.docker up -d --build
```

### Step 3: Verify Deployment

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend

# Test API
curl http://localhost:8000/api/
curl http://localhost:8000/api/vehicles
```

### Step 4: Stop Services

```bash
# Stop running services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Advanced Configuration

### Custom Port Mapping

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Change 8001 to your desired port
```

### Volume Management for Logs

```yaml
services:
  backend:
    volumes:
      - ./logs:/app/logs
      - /var/log/pravasi:/app/logs  # For persistent logging
```

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Database Service (Optional - if using local MongoDB)

```yaml
services:
  mongodb:
    image: mongo:latest
    container_name: pravasi-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    networks:
      - pravasi-network

  backend:
    depends_on:
      - mongodb
    environment:
      MONGO_URL: mongodb://root:password@mongodb:27017/

volumes:
  mongodb_data:
```

---

## Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose logs backend

# Verify environment variables
docker-compose config

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Port already in use

```bash
# Find process using port 8000
lsof -i :8000

# Kill process (if needed)
kill -9 <PID>

# Or use different port in docker-compose.yml
```

### Database connection error

```bash
# Verify MongoDB is accessible
docker exec pravasi-backend ping mongodb

# Check connection string
docker exec pravasi-backend env | grep MONGO_URL

# Test MongoDB connection
docker exec pravasi-backend python -c "
import motor.motor_asyncio
import asyncio
client = motor.motor_asyncio.AsyncIOMotorClient('mongodb+srv://...')
asyncio.run(client.admin.command('ping'))
"
```

---

## Monitoring

### View Real-time Metrics

```bash
docker stats pravasi-backend
```

### View Container Logs with Timestamps

```bash
docker-compose logs --timestamps -f backend
```

### Export Logs to File

```bash
docker-compose logs backend > backend_logs.txt
```

---

## Backup & Restore

### Backup Database

```bash
# Export MongoDB collections
docker exec pravasi-mongodb mongodump --uri "mongodb://root:password@localhost:27017/" --out ./backup
```

### Restore Database

```bash
# Restore MongoDB collections
docker exec pravasi-mongodb mongorestore --uri "mongodb://root:password@localhost:27017/" ./backup
```

---

## Security Hardening

### Update API Key

Before production, update the API_KEY in .env.docker:

```bash
# Generate secure API key
openssl rand -hex 32

# Update .env.docker
API_KEY=<generated_key>
```

### Use Secrets File Instead of Env File (Docker Swarm)

Create `secrets/api_key.txt`:

```
your-secret-api-key
```

Update `docker-compose.yml`:

```yaml
services:
  backend:
    secrets:
      - api_key
    environment:
      API_KEY: /run/secrets/api_key

secrets:
  api_key:
    file: ./secrets/api_key.txt
```

### Enable HTTPS (via Nginx Reverse Proxy)

Create `nginx/nginx.conf`:

```nginx
upstream backend {
    server backend:8000;
}

server {
    listen 443 ssl;
    server_name api.pravasi-tours.com;

    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Add to docker-compose.yml:

```yaml
services:
  nginx:
    image: nginx:latest
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - backend
```

---

## Performance Tuning

### Increase Connection Pool Size

Update `server.py`:

```python
client = AsyncIOMotorClient(
    mongo_url,
    maxPoolSize=50,
    minPoolSize=10,
    tlsCAFile=certifi.where()
)
```

### Enable Uvicorn Workers

Update docker-compose.yml:

```yaml
services:
  backend:
    command: uvicorn server:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Production Checklist

- [ ] Environment file (.env.docker) created
- [ ] API_KEY updated from default
- [ ] MongoDB credentials verified
- [ ] CORS_ORIGINS configured for frontend domain
- [ ] Health checks verified
- [ ] Logs directory created (./logs)
- [ ] Backup strategy implemented
- [ ] Monitoring system configured
- [ ] Incident response plan ready
- [ ] Documentation updated

---

## Support

For issues or questions:
1. Check DOCKER_VERIFICATION_REPORT.md
2. Review Docker logs: `docker-compose logs -f backend`
3. Verify environment variables: `docker-compose config`
4. Test endpoints manually with curl

