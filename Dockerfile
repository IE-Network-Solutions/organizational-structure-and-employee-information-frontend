# =========================
# Stage 1: Dependencies
# =========================
FROM node:18-alpine AS deps
WORKDIR /app

# Only copy package manifests for better layer caching
COPY package.json package-lock.json* ./

# Install deps (no dev dependencies in production image)
RUN npm ci --include=dev

# =========================
# Stage 2: Builder
# =========================
FROM node:18-alpine AS builder
WORKDIR /app

# Install required tools for Vault
RUN apk add --no-cache curl jq bash unzip

# Install Vault CLI
RUN curl -sSLo /tmp/vault.zip https://releases.hashicorp.com/vault/1.14.4/vault_1.14.4_linux_amd64.zip && \
    unzip /tmp/vault.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/vault && \
    rm -f /tmp/vault.zip

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for Vault
ARG VAULT_ADDR
ARG VAULT_USERNAME
ARG VAULT_PASSWORD
ARG VAULT_SECRET_PATH=env/frontend

# Use Node memory limit control
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Fetch secrets, lint, format, and build
RUN set -eux; \
    echo "🔐 Logging into Vault..."; \
    export VAULT_ADDR="$VAULT_ADDR"; \
    VAULT_TOKEN=$(vault login -method=userpass \
        username="$VAULT_USERNAME" \
        password="$VAULT_PASSWORD" \
        -format=json | jq -r .auth.client_token); \
    echo "✅ Vault login successful"; \
    echo "📦 Fetching secrets from $VAULT_SECRET_PATH..."; \
    vault kv get -format=json "$VAULT_SECRET_PATH" \
        | jq -r '.data.data | to_entries[] | "\(.key)=\(.value)"' > .env; \
    export $(cat .env | xargs); \
    echo "🧹 Running Prettier and ESLint..."; \
    npm run format || true; \
    npm run lint || true; \
    echo "🏗️ Building Next.js app..."; \
    npm run build; \
    echo "PORT=${APP_PORT:-3000}" > /tmp/.port.env; \
    rm -f .env

# =========================
# Stage 3: Pruner
# =========================
# Strip out unnecessary dev deps to shrink image
FROM node:18-alpine AS pruner
WORKDIR /app
COPY --from=deps /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# =========================
# Stage 4: Runner
# =========================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs -G nodejs

USER nextjs

# Copy minimal runtime files
COPY --from=pruner /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /tmp/.port.env /app/.port.env

# Informational default port
EXPOSE 3000

# Run app using dynamic port from Vault
CMD ["/bin/sh", "-c", "export $(cat /app/.port.env | xargs) && echo \"🚀 Starting app on port $PORT\" && node server.js"]
