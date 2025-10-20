# =========================
# Stage 1: Dependencies (Build dependencies only)
# =========================
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
# Only install deps needed for build
RUN npm ci


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

ARG VAULT_ADDR
ARG VAULT_USERNAME
ARG VAULT_PASSWORD
ARG VAULT_SECRET_PATH=env/frontend

# Fetch secrets and build app
RUN set -eux; \
    export VAULT_ADDR="$VAULT_ADDR"; \
    VAULT_TOKEN=$(vault login -method=userpass username="$VAULT_USERNAME" password="$VAULT_PASSWORD" -format=json | jq -r .auth.client_token); \
    vault kv get -format=json "$VAULT_SECRET_PATH" | jq -r '.data.data | to_entries[] | "\(.key)=\(.value)"' > .env; \
    export $(cat .env | xargs); \
    NODE_OPTIONS="--max-old-space-size=2048" npm run build; \
    echo "PORT=${APP_PORT:-3000}" > /tmp/.port.env; \
    rm -rf .env node_modules /usr/local/bin/vault /tmp/*


# =========================
# Stage 3: Production Dependencies
# =========================
FROM node:18-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json* ./
# Install ONLY production dependencies
RUN npm ci --omit=dev


# =========================
# Stage 4: Runner (Final lightweight image)
# =========================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs -G nodejs
USER nextjs

# Copy production node_modules only
COPY --from=prod-deps /app/node_modules ./node_modules
# Copy the build output and assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /tmp/.port.env /app/.port.env

# Default port (dynamic at runtime)
EXPOSE 3000

# Run app using the Vault-defined port
CMD ["/bin/sh", "-c", "export $(cat /app/.port.env | xargs) && echo \"Starting on port $PORT
