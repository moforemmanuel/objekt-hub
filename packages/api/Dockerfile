# syntax=docker.io/docker/dockerfile:1

FROM node:22.17-alpine AS base
RUN apk add --no-cache libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /monorepo

# Copy monorepo config files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package.json files for all packages
COPY packages/api/package.json ./packages/api/

# Install dependencies for the entire workspace (including root)
RUN corepack enable pnpm && \
    pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /monorepo

# Copy all dependencies
COPY --from=deps /monorepo/node_modules ./node_modules
COPY --from=deps /monorepo/packages/api/node_modules ./packages/api/node_modules

# Copy monorepo config and source files
COPY package.json pnpm-workspace.yaml ./
COPY packages/api ./packages/api

WORKDIR /monorepo/packages/api
RUN corepack enable pnpm && pnpm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy only the API artifacts (built application and dependencies)
COPY --from=builder --chown=nestjs:nodejs \
  /monorepo/packages/api/dist ./dist

COPY --from=builder --chown=nestjs:nodejs \
  /monorepo/packages/api/node_modules ./node_modules

COPY --from=builder --chown=nestjs:nodejs \
  /monorepo/packages/api/package.json ./

USER nestjs

EXPOSE 8000
ENV PORT=8000
ENV HOSTNAME=0.0.0.0

CMD ["node", "dist/main.js"]