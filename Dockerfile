# =========================
# Stage 1: Dependencies
# =========================
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --include=dev


# =========================
# Stage 2: Builder
# =========================
FROM node:18-alpine AS builder
WORKDIR /app

# Install Vault CLI and jq
RUN apk add --no-cache curl jq bash unzip && \
    curl -o /tmp/vault.zip https://releases.hashicorp.com/vault/1.14.4/vault_1.14.4_linux_amd64.zip && \
    unzip /tmp/vault.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/vault && \
    rm -f /tmp/vault.zip

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Fetch secrets from Vault (no ARG declared)
# Expect build args to be passed inline with `--build-arg`
RUN set -e && \
    echo "🔑 Fetching secrets from Vault..." && \
    VAULT_TOKEN=$(vault login -method=userpass \
        username="${VAULT_USERNAME}" \
        password="${VAULT_PASSWORD}" \
        -format=json | jq -r .auth.client_token) && \
    export VAULT_ADDR="${VAULT_ADDR}" && export VAULT_TOKEN="$VAULT_TOKEN" && \
    vault kv get -format=json "${VAULT_SECRET_PATH:-env/frontend}" \
        | jq -r '.data.data | to_entries[] | "\(.key)=\(.value)"' > /tmp/.env.vault && \
    set -a && source /tmp/.env.vault && set +a && \
    echo "✅ Secrets loaded, building Next.js..." && \
    npm run build && \
    echo "PORT=$PORT" > /tmp/.port.env && \
    rm -f /tmp/.env.vault


# =========================
# Stage 3: Runner
# =========================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /tmp/.port.env /app/.port.env

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"

CMD ["/bin/sh", "-c", "export $(cat /app/.port.env | xargs) && node server.js"]
