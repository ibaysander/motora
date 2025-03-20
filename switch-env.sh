#!/bin/bash

# Function to display usage
show_usage() {
    echo "Usage: ./switch-env.sh [dev|prod]"
    echo "  dev  - Switch to development environment"
    echo "  prod - Switch to production environment"
    exit 1
}

# Check if argument is provided
if [ $# -eq 0 ]; then
    show_usage
fi

# Stop existing containers
echo "Stopping existing containers..."
docker compose down

# Switch based on argument
case "$1" in
    "dev")
        echo "Switching to development environment..."
        export NODE_ENV=development
        export REACT_APP_API_URL=http://labrat-vm:3001/api
        ;;
    "prod")
        echo "Switching to production environment..."
        export NODE_ENV=production
        export REACT_APP_API_URL=http://103.150.190.62:3001/api
        ;;
    *)
        show_usage
        ;;
esac

# Start containers with new environment
echo "Starting containers with $1 environment..."
docker compose up --build -d

# Show logs
echo "Showing logs..."
docker compose logs -f 