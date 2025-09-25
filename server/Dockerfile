# Stage 1: Build deps
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Stage 2: App
FROM node:22-alpine

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY .env.production .env

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]
