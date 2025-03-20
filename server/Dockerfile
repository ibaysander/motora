FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache sqlite sqlite-dev python3 make g++

# Create app directory
WORKDIR /app

# Create database directory with proper permissions
RUN mkdir -p /app/database && \
    chown -R node:node /app/database && \
    chmod -R 777 /app/database

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm install sqlite3

# Copy app source
COPY . .

# Set proper permissions
RUN chown -R node:node /app && \
    chmod -R 777 /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev"] 