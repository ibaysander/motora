FROM node:18-alpine

WORKDIR /app

# Install sqlite3 and its dependencies
RUN apk add --no-cache sqlite sqlite-dev python3 make g++

# Create database directory and set permissions
RUN mkdir -p /app/database && \
    chown -R node:node /app/database && \
    chmod 755 /app/database

# Copy package files
COPY package*.json ./

# Install dependencies and explicitly install sqlite3
RUN npm install && npm install sqlite3

# Copy source code
COPY . .

# Set proper ownership
RUN chown -R node:node /app && \
    chmod -R 755 /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev"] 