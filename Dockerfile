# syntax=docker/dockerfile:1

FROM oven/bun:1.1.45-alpine AS frontend-build
WORKDIR /app/frontend
ARG VITE_API_STEP1_BASE_URL=/api/step1
ARG VITE_API_STEP2_BASE_URL=/api/step2
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
ENV VITE_API_STEP1_BASE_URL=${VITE_API_STEP1_BASE_URL}
ENV VITE_API_STEP2_BASE_URL=${VITE_API_STEP2_BASE_URL}
RUN bun run build

FROM oven/bun:1.1.45-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.1.45-alpine
RUN apk add --no-cache nginx
WORKDIR /app

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

COPY --from=backend-deps /app/backend/node_modules /app/backend/node_modules
COPY backend/package.json /app/backend/package.json
COPY backend/db-step1.json /app/backend/db-step1.json
COPY backend/db-step2.json /app/backend/db-step2.json

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000 4001 4002
ENTRYPOINT ["/entrypoint.sh"]
