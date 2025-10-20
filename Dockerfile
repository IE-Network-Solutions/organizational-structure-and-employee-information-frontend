# =========================
# Stage 1: Dependencies
# =========================
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --include=dev


# =========================
# Stage 2: Builder
# =========================
FROM node:18-alpine AS builder
WORKDIR /app

# Install Vault CLI and jq
RUN apk add --no-cache curl jq bash unzip && \
    curl -sSLo /tmp/vault.zip https://releases.hashicorp.com/vault/1.14.4/vault_1.14.4_linux_amd64.zip && \
    unzip /tmp/vault.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/vault && \
    rm -f /tmp/vault.zip

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Vault credentials passed as build args
ARG VAULT_ADDR
ARG VAULT_USERNAME
ARG VAULT_PASSWORD
ARG VAULT_SECRET_PATH=env/frontend

# Fetch secrets from Vault, build Next.js, and capture APP_PORT
RUN set -eux; \
    echo "🔐 Logging into Vault..."; \
    export VAULT_ADDR="$VAULT_ADDR"; \
    VAULT_TOKEN=$(vault login -method=userpass username="$VAULT_USERNAME" password="$VAULT_PASSWORD" -format=json | jq -r .auth.client_token); \
    echo "✅ Vault login successful"; \
    echo "📦 Fetching secrets from $VAULT_SECRET_PATH..."; \
    vault kv get -format=json "$VAULT_SECRET_PATH" \
      | jq -r '.data.data | to_entries[] | "\(.key)=\(.value)"' > .env; \
    echo "✅ Secrets written to .env"; \
    export $(cat .env | xargs); \
    echo "🏗️ Building Next.js app..."; \
    npm run format || true && \
    npm run lint -- --fix || true && \
    npm run build; \
    # Write APP_PORT to a file for runtime use (fallback to 3000)
    echo "PORT=${APP_PORT:-3000}" > /tmp/.port.env; \
    rm -f .env


# =========================
# Stage 3: Runner
# =========================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs -G nodejs

USER nextjs

# Copy necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /tmp/.port.env /app/.port.env

# Default expose (informational only)
EXPOSE 3000

# Use the port from Vault at runtime
CMD ["/bin/sh", "-c", "export $(cat /app/.port.env | xargs) && echo \"Starting app on port $PORT\" && node server.js"]
