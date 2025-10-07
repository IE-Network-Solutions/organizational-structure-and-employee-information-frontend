# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --include=dev

# Stage 2: Builder (fetch secrets and build)
FROM node:18-alpine AS builder
WORKDIR /app

# Install Vault CLI and jq
RUN apk add --no-cache curl jq bash unzip && \
    curl -o /tmp/vault.zip https://releases.hashicorp.com/vault/1.14.4/vault_1.14.4_linux_amd64.zip && \
    unzip /tmp/vault.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/vault && \
    rm -f /tmp/vault.zip

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args for Vault connection
ARG VAULT_ADDR
ARG VAULT_USERNAME
ARG VAULT_PASSWORD
ARG VAULT_SECRET_PATH=env/frontend

# Fetch secrets from Vault and build Next.js
RUN set -e && \
    echo "🔑 Fetching secrets from Vault..." && \
    export VAULT_ADDR=$VAULT_ADDR && \
    VAULT_TOKEN=$(vault login -method=userpass \
        username="$VAULT_USERNAME" \
        password="$VAULT_PASSWORD" \
        -format=json | jq -r .auth.client_token) && \
    export VAULT_TOKEN && \
    vault kv get -format=json $VAULT_SECRET_PATH \
    | jq -r '.data.data | to_entries[] | "\(.key)=\(.value)"' > /tmp/.env.vault && \
    set -a && source /tmp/.env.vault && set +a && \
    echo "✅ Secrets loaded, building Next.js..." && \
    npm run build && \
    echo "PORT=${PORT:-3020}" > /tmp/.port.env && \
    rm -f /tmp/.env.vault
    

# Stage 3: Production Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /tmp/.port.env /app/.port.env

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Port will be set from Vault at runtime
EXPOSE 3020

ENV HOSTNAME "0.0.0.0"

# Read PORT from file and start the app
CMD ["/bin/sh", "-c", "export $(cat /app/.port.env | xargs) && node server.js"]
