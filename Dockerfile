# ─── Build Stage ──────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    cp -R node_modules node_modules_prod

# Install dev deps for build
RUN npm ci

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# ─── Production Stage ─────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 naoii && \
    adduser --system --uid 1001 naoii

# Copy production dependencies
COPY --from=builder /app/node_modules_prod ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/next.config.ts ./

# Install runtime deps needed for Prisma adapter
RUN npm install --omit=dev @prisma/client @prisma/adapter-pg dotenv

USER naoii
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "node_modules/.bin/next", "start"]
