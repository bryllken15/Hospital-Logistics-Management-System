# Docker Setup Guide for Logistics1 Hospital System

This guide will help you set up your Logistics1 Hospital System with Docker and Supabase database integration.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Git (for cloning the repository)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository (if not already done)
git clone <your-repository-url>
cd Logistics1Hospital

# Copy environment variables template
cp env.docker.example .env

# Edit the .env file with your Supabase credentials
# Update SUPABASE_URL and SUPABASE_ANON_KEY with your actual values
```

### 2. Configure Environment Variables

Edit the `.env` file with your Supabase project details:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_KEY=your-actual-service-key

# Database Configuration (for local development)
POSTGRES_DB=logistics_hospital
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### 3. Run with Docker

#### Option A: Production Build
```bash
# Build and run the production version
docker-compose up --build

# Access the application at http://localhost:3000
```

#### Option B: Development Mode
```bash
# Run in development mode with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Access the application at http://localhost:3000
```

## Docker Services

The Docker setup includes the following services:

### 1. Logistics App (`logistics-app`)
- **Port**: 3000
- **Description**: React application (production or development)
- **Dependencies**: Supabase database

### 2. Supabase Database (`supabase-db`)
- **Port**: 5432
- **Description**: PostgreSQL database for local development
- **Data**: Persisted in Docker volume `postgres_data`

### 3. Supabase Studio (`supabase-studio`)
- **Port**: 54323
- **Description**: Database management UI
- **Access**: http://localhost:54323

### 4. Redis (`redis`)
- **Port**: 6379
- **Description**: Caching layer (optional)
- **Data**: Persisted in Docker volume `redis_data`

### 5. Nginx (`nginx`)
- **Ports**: 80, 443
- **Description**: Reverse proxy (production only)
- **Features**: Load balancing, SSL termination

## Development Workflow

### 1. Start Development Environment

```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### 2. Database Management

```bash
# Access database directly
docker-compose exec supabase-db psql -U postgres -d logistics_hospital

# Run migrations
docker-compose exec supabase-db psql -U postgres -d logistics_hospital -f /docker-entrypoint-initdb.d/001_users_and_auth.sql
```

### 3. Application Development

```bash
# View application logs
docker-compose logs -f logistics-app-dev

# Restart application only
docker-compose restart logistics-app-dev

# Rebuild application
docker-compose build logistics-app-dev
```

## Production Deployment

### 1. Build Production Image

```bash
# Build production image
docker build -t logistics-hospital:latest .

# Tag for registry
docker tag logistics-hospital:latest your-registry/logistics-hospital:latest
```

### 2. Deploy to Production

```bash
# Deploy with production compose
docker-compose -f docker-compose.yml up -d

# Scale application
docker-compose up -d --scale logistics-app=3
```

### 3. Environment Configuration

For production, update your `.env` file with production values:

```bash
# Production Supabase Configuration
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_KEY=your-production-service-key

# Production Database
POSTGRES_HOST=your-production-db-host
POSTGRES_PORT=5432
POSTGRES_DB=logistics_hospital_prod
POSTGRES_USER=your-production-user
POSTGRES_PASSWORD=your-production-password
```

## Database Setup

### 1. Run Migrations

The database migrations are automatically applied when the container starts. However, you can also run them manually:

```bash
# Access the database container
docker-compose exec supabase-db bash

# Run migrations manually
cd /docker-entrypoint-initdb.d
for file in *.sql; do
    echo "Running $file"
    psql -U postgres -d logistics_hospital -f "$file"
done
```

### 2. Seed Data

```bash
# Run seed data
docker-compose exec supabase-db psql -U postgres -d logistics_hospital -f /docker-entrypoint-initdb.d/012_seed_data.sql
```

### 3. Create Users

```bash
# Create initial users
docker-compose exec supabase-db psql -U postgres -d logistics_hospital -f /docker-entrypoint-initdb.d/013_create_initial_users.sql
```

## Monitoring and Debugging

### 1. View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs logistics-app
docker-compose logs supabase-db

# Follow logs in real-time
docker-compose logs -f
```

### 2. Debug Application

```bash
# Access application container
docker-compose exec logistics-app bash

# Check environment variables
docker-compose exec logistics-app env

# Test database connection
docker-compose exec logistics-app npm run test:db
```

### 3. Database Debugging

```bash
# Access database
docker-compose exec supabase-db psql -U postgres -d logistics_hospital

# Check tables
\dt

# Check users
SELECT * FROM users;

# Check migrations
SELECT * FROM supabase_migrations.schema_migrations;
```

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check if ports are in use
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432

# Stop conflicting services
sudo systemctl stop postgresql
sudo systemctl stop nginx
```

#### 2. Database Connection Issues
```bash
# Check database status
docker-compose exec supabase-db pg_isready -U postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

#### 3. Application Build Issues
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker permissions
sudo chmod +x /usr/local/bin/docker-compose
```

### Performance Optimization

#### 1. Resource Limits
Add resource limits to your `docker-compose.yml`:

```yaml
services:
  logistics-app:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

#### 2. Database Optimization
```bash
# Optimize PostgreSQL
docker-compose exec supabase-db psql -U postgres -d logistics_hospital -c "
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
"
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use Docker secrets for sensitive data in production
- Rotate API keys regularly

### 2. Network Security
```yaml
# Add to docker-compose.yml
networks:
  logistics-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### 3. Database Security
```bash
# Create read-only user
docker-compose exec supabase-db psql -U postgres -d logistics_hospital -c "
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE logistics_hospital TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
"
```

## Backup and Recovery

### 1. Database Backup
```bash
# Create backup
docker-compose exec supabase-db pg_dump -U postgres logistics_hospital > backup.sql

# Restore backup
docker-compose exec -T supabase-db psql -U postgres logistics_hospital < backup.sql
```

### 2. Volume Backup
```bash
# Backup volumes
docker run --rm -v logistics-hospital_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v logistics-hospital_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## Scaling

### 1. Horizontal Scaling
```bash
# Scale application
docker-compose up -d --scale logistics-app=3

# Use load balancer
docker-compose up -d nginx
```

### 2. Database Scaling
```bash
# Add read replicas
docker-compose up -d --scale supabase-db=2
```

## Cleanup

### 1. Stop and Remove
```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

### 2. System Cleanup
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a
```

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify environment variables: `docker-compose config`
3. Test database connection: `docker-compose exec supabase-db pg_isready`
4. Check application health: Visit http://localhost:3000

For additional help, refer to:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Supabase Documentation](https://supabase.com/docs)
