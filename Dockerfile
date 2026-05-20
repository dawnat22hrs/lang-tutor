# ── Stage 1: install dependencies (compiles better-sqlite3 native module) ───
FROM node:22-alpine AS deps
RUN apk upgrade --no-cache && apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

# ── Stage 2: build Next.js ──────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN apk upgrade --no-cache
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && yarn build

# ── Stage 3: lean runtime image ─────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk upgrade --no-cache
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
