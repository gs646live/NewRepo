# Murasaki in one image: the Express API serving the built React app.
# Used by `docker compose up` (see docker-compose.yml).

# ---- 1. Build the React app -------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Copy only the manifests first so `npm ci` is cached until dependencies change.
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --no-audit --no-fund

COPY shared shared
COPY client client
RUN npm run build -w client

# ---- 2. Runtime: server + shared, production dependencies only ---------------
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --omit=dev --workspace server --no-audit --no-fund && npm cache clean --force

COPY shared shared
COPY server server
COPY --from=build /app/client/dist client/dist

USER node
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3001) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "server/server.js"]
