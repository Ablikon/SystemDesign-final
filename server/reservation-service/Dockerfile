FROM node:16-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3003

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3003

# Run the application
CMD ["npm", "start"] 