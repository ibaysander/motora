FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache sqlite sqlite-dev python3 make g++

# Create app directory
WORKDIR /app

# Create database and uploads directories with proper permissions
RUN mkdir -p /app/database /app/uploads && \
    chown -R node:node /app/database /app/uploads && \
    chmod -R 777 /app/database /app/uploads

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