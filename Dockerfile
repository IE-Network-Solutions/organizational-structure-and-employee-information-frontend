# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install bash, curl, unzip for Vault later
RUN apk add --no-cache bash curl unzip jq

COPY package.json package-lock.json* ./
RUN npm install --include=dev

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install Vault CLI
RUN curl -o /tmp/vault.zip https://releases.hashicorp.com/vault/1.14.4/vault_1.14.4_linux_amd64.zip && \
    unzip /tmp/vault.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/vault && \
    rm -f /tmp/vault.zip

# Build arguments (passed from Jenkins)
ARG VAULT_ADDR
ARG VAULT_USERNAME
ARG VAULT_PASSWORD
ARG VAULT_SECRET_PATH

# Fetch Vault secrets and write to .env.production
RUN set -e && \
    echo "Fetching secrets from Vault..." && \
    VAULT_TOKEN=$(vault login -method=userpass username="${VAULT_USERNAME}" password="${VAULT_PASSWORD}" -format=json | jq -r .auth.client_token) && \
    vault kv get -format=json "${VAULT_SECRET_PATH}" \
        | jq -r '.data.data | to_entries[] | "\(.key)=\(.value)"' > .env && \
    echo "Secrets written to .env.production"

# Build Next.js app using production environment
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs -G nodejs

USER nextjs

# Copy build output and dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env.production ./.env

# Dynamically read port at runtime if needed
CMD ["/bin/sh", "-c", "echo 'Starting Next.js app...' && npx next start -p ${PORT}"]
