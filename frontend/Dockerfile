# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build:prod

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=build /app/dist/fabric-platform-web/browser /usr/share/nginx/html

# nginx config: serve Angular + proxy /api to backend
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
\n\
  location /api {\n\
    proxy_pass https://fabric-labels-production.up.railway.app;\n\
    proxy_http_version 1.1;\n\
    proxy_set_header Host fabric-labels-production.up.railway.app;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    proxy_set_header X-Forwarded-Proto $scheme;\n\
  }\n\
\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
