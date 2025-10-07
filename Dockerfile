# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --include=dev

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Install Vault CLI, jq, bash, unzip
RUN apk add --no-cache curl jq bash unzip && \
    curl -o /tmp/vault.zip https://releases.hashicorp.com/vault/1.14.4/vault_1.14.4_linux_amd64.zip && \
    unzip /tmp/vault.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/vault && \
    rm -f /tmp/vault.zip

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args for Vault
ARG VAULT_ADDR
ARG VAULT_USERNAME
ARG VAULT_PASSWORD
ARG VAULT_SECRET_PATH=env/frontend

# Fetch build-time secrets from Vault and build Next.js
RUN set -e && \
    echo "🔑 Fetching secrets from Vault..." && \
    VAULT_TOKEN=$(vault login -method=userpass \
        username="$VAULT_USERNAME" \
        password="$VAULT_PASSWORD" \
        -format=json | jq -r .auth.client_token) && \
    export VAULT_ADDR="$VAULT_ADDR" && export VAULT_TOKEN="$VAULT_TOKEN" && \
    # Export Vault secrets temporarily for Next.js build
    vault kv get -format=json "$VAULT_SECRET_PATH" \
        | jq -r '.data.data | to_entries[] | "\(.key)=\(.value)"' > /tmp/.env.vault && \
    set -a && source /tmp/.env.vault && set +a && \
    echo "✅ Secrets loaded, building Next.js..." && \
    npm run build && \
    # Save PORT from Vault to runtime file
    echo "PORT=$PORT" > /tmp/.port.env && \
    rm -f /tmp/.env.vault


# Stage 3: Production Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files for runtime
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /tmp/.port.env /app/.port.env

# Set proper ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose generic port; actual PORT comes from Vault
EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

# Start app reading PORT dynamically
CMD ["/bin/sh", "-c", "export $(cat /app/.port.env | xargs) && node server.js"]
