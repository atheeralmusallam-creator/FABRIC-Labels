# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=build /app/dist/fabric-platform-web/browser /usr/share/nginx/html

# Angular router support (HTML5 history API)
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / { try_files $uri $uri/ /index.html; }\n}\n' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
