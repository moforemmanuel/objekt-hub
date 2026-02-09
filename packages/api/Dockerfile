# syntax=docker.io/docker/dockerfile:1

FROM node:22.17-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Enable pnpm and install dependencies
RUN corepack enable pnpm && \
    pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# Enable pnpm and build
RUN corepack enable pnpm && \
    pnpm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built application and dependencies
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json /app/tsconfig.json ./

USER nestjs

EXPOSE 8000

ENV PORT=8000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "dist/main.js"]
