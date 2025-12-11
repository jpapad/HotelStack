FROM node:20-alpine AS base

WORKDIR /app
RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY apps/web apps/web
RUN pnpm --filter @acme/web build

FROM base AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/web ./apps/web

EXPOSE 3000

CMD ["sh", "-c", "cd apps/web && /app/node_modules/.bin/next start -p 3000"]
