# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:24.4.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG BASE_URL_KICKS_API
ENV BASE_URL_KICKS_API=$BASE_URL_KICKS_API

RUN npm run build


# ── Stage 2: Development ──────────────────────────────────────────────────────
FROM node:24.4.0-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# ── Stage 3: Runtime ──────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html/quikstarter
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]