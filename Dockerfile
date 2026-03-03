FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy root package.json for workspace
COPY package.json ./

# Copy backend source
COPY src/server ./src/server

# Install backend dependencies
RUN cd src/server && npm install

# Copy frontend source 
COPY src/client ./src/client

# Install frontend dependencies and build
RUN cd src/client && npm install && npm run build

# Build the backend typescript
RUN cd src/server && npx prisma generate && npm run build

EXPOSE 3001

ENV NODE_ENV=production

# Run the backend process on start
CMD ["npm", "start", "--prefix", "src/server"]
