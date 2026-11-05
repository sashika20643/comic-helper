FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine AS run
RUN apk add --no-cache su-exec
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 UPLOAD_DIR=/app/uploads
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/scripts ./scripts
RUN mkdir -p /app/uploads && chown node:node /app/uploads
EXPOSE 3000
# Uploaded images are stored here; mount a volume at /app/uploads.
VOLUME ["/app/uploads"]
CMD ["sh", "scripts/docker-entrypoint.sh"]
