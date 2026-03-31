# Stage 1: Build the React frontend
FROM node:24-alpine AS build

WORKDIR /app

# Copy root package files
COPY package*.json ./
RUN npm install

# Copy frontend source
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Run the Express server
FROM node:24-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy server source
COPY server/ ./server/

# Copy built frontend from Stage 1
COPY --from=build /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the server
CMD ["node", "server/index.js"]
