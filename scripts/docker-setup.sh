#!/bin/bash

# Docker Setup Script for Logistics1 Hospital System
# This script automates the Docker setup process

set -e

echo "🏥 Logistics1 Hospital System - Docker Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if Docker is running
check_docker_running() {
    print_status "Checking if Docker is running..."
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Setup environment file
setup_env() {
    print_status "Setting up environment file..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.docker.example" ]; then
            cp env.docker.example .env
            print_success "Created .env file from template"
            print_warning "Please update .env file with your Supabase credentials"
        else
            print_error "env.docker.example file not found"
            exit 1
        fi
    else
        print_warning ".env file already exists"
    fi
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build production image
    docker build -t logistics-hospital:latest .
    print_success "Production image built"
    
    # Build development image
    docker build -f Dockerfile.dev -t logistics-hospital:dev .
    print_success "Development image built"
}

# Start services
start_services() {
    local mode=${1:-"development"}
    
    print_status "Starting services in $mode mode..."
    
    if [ "$mode" = "development" ]; then
        docker-compose -f docker-compose.dev.yml up -d
    else
        docker-compose up -d
    fi
    
    print_success "Services started"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec supabase-db pg_isready -U postgres &> /dev/null; then
            print_success "Database is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Database failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for application
    print_status "Waiting for application..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -s http://localhost:3000 &> /dev/null; then
            print_success "Application is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Application may not be ready yet"
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait a bit more for database to be fully ready
    sleep 5
    
    # Run migrations
    for migration in supabase/migrations/*.sql; do
        if [ -f "$migration" ]; then
            print_status "Running migration: $(basename "$migration")"
            docker-compose exec -T supabase-db psql -U postgres -d logistics_hospital -f "/docker-entrypoint-initdb.d/$(basename "$migration")" || print_warning "Migration $(basename "$migration") may have already been applied"
        fi
    done
    
    print_success "Database migrations completed"
}

# Show service status
show_status() {
    print_status "Service Status:"
    echo "=================="
    
    # Show running containers
    docker-compose ps
    
    echo ""
    print_status "Service URLs:"
    echo "=============="
    echo "Application: http://localhost:3000"
    echo "Database Studio: http://localhost:54323"
    echo "Database: localhost:5432"
    echo "Redis: localhost:6379"
}

# Show logs
show_logs() {
    print_status "Showing service logs..."
    docker-compose logs -f
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped"
}

# Clean up
cleanup() {
    print_status "Cleaning up..."
    docker-compose down -v
    docker system prune -f
    print_success "Cleanup completed"
}

# Main menu
show_menu() {
    echo ""
    echo "Docker Setup Menu:"
    echo "=================="
    echo "1. Setup environment and build images"
    echo "2. Start development environment"
    echo "3. Start production environment"
    echo "4. Stop services"
    echo "5. Show service status"
    echo "6. Show logs"
    echo "7. Run database migrations"
    echo "8. Clean up everything"
    echo "9. Exit"
    echo ""
    read -p "Choose an option (1-9): " choice
}

# Main execution
main() {
    case ${1:-"menu"} in
        "setup")
            check_docker
            check_docker_running
            setup_env
            build_images
            print_success "Setup completed! Run './scripts/docker-setup.sh start' to start services"
            ;;
        "start")
            check_docker
            check_docker_running
            start_services "development"
            wait_for_services
            run_migrations
            show_status
            ;;
        "start-prod")
            check_docker
            check_docker_running
            start_services "production"
            wait_for_services
            show_status
            ;;
        "stop")
            stop_services
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "migrate")
            run_migrations
            ;;
        "cleanup")
            cleanup
            ;;
        "menu"|*)
            while true; do
                show_menu
                case $choice in
                    1)
                        check_docker
                        check_docker_running
                        setup_env
                        build_images
                        ;;
                    2)
                        check_docker
                        check_docker_running
                        start_services "development"
                        wait_for_services
                        run_migrations
                        show_status
                        ;;
                    3)
                        check_docker
                        check_docker_running
                        start_services "production"
                        wait_for_services
                        show_status
                        ;;
                    4)
                        stop_services
                        ;;
                    5)
                        show_status
                        ;;
                    6)
                        show_logs
                        ;;
                    7)
                        run_migrations
                        ;;
                    8)
                        cleanup
                        ;;
                    9)
                        print_success "Goodbye!"
                        exit 0
                        ;;
                    *)
                        print_error "Invalid option. Please choose 1-9."
                        ;;
                esac
                echo ""
                read -p "Press Enter to continue..."
            done
            ;;
    esac
}

# Run main function with all arguments
main "$@"