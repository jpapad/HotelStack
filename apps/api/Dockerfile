FROM node:20-alpine AS base

WORKDIR /app
RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY apps/api apps/api
RUN pnpm --filter @acme/api build

FROM base AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY .env ./.env

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/.env.local ./apps/api/.env.local
COPY --from=build /app/apps/api/dist ./apps/api/dist

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
