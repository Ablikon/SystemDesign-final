FROM node:16-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=development
ENV PORT=8080

# Run the application
CMD ["npm", "start"] 