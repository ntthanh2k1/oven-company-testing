FROM node:22.16.0-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build app
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "run", "start:prod"]
