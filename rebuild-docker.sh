#!/bin/bash

echo "Stopping existing containers..."
docker-compose down

# Update package.json to include required dependencies if needed
if ! grep -q '"axios":' package.json; then
  echo "Adding axios dependency to package.json..."
  sed -i 's/"dependencies": {/"dependencies": {\n    "axios": "^1.6.2",/' package.json
fi

if ! grep -q '"@types/node":' package.json; then
  echo "Adding @types/node dependency to package.json..."
  sed -i 's/"dependencies": {/"dependencies": {\n    "@types\/node": "^18.15.0",/' package.json
fi

# Make sure tsconfig.json has node types included
if ! grep -q '"types": \["node"' tsconfig.json; then
  echo "Adding node types to tsconfig.json..."
  sed -i 's/"compilerOptions": {/"compilerOptions": {\n    "types": ["node", "react", "react-dom"],/' tsconfig.json
fi

echo "Building frontend container..."
docker-compose build frontend

echo "Starting containers..."
docker-compose up -d

echo "Done! API implementation has been updated." 