FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY patches/ ./patches/
COPY web/package.json ./web/
COPY mobile/package.json ./mobile/
COPY packages/app/package.json ./packages/app/
COPY packages/ui/package.json ./packages/ui/
RUN npm install --ignore-scripts --no-audit --no-fund

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN npm run build --workspace=web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/web/.next/standalone ./
COPY --from=builder /app/web/.next/static ./web/.next/static
COPY --from=builder /app/web/public ./web/public
RUN node -e "const fs=require('fs');const p='/app/web/.next/server/app/page_client-reference-manifest.js';if(fs.existsSync(p)){const s=fs.readFileSync(p,'utf8');const a='globalThis.__RSC_MANIFEST[\\\"/\\\"]=globalThis.__RSC_MANIFEST[\\\"/page\\\"];';if(s.includes('__RSC_MANIFEST[\\\"/page\\\"]')&&!s.includes('__RSC_MANIFEST[\\\"/\\\"]'))fs.appendFileSync(p,'\\n'+a+'\\n');}"
EXPOSE 3000
CMD ["node", "web/server.js"]
