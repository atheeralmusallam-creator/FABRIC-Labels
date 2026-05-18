# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npx ng build --configuration production

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Angular 17 builder outputs to dist/<name>/browser
COPY --from=build /app/dist/fabric-platform-web/browser /usr/share/nginx/html

# Fallback to index.html for Angular router (HTML5 history API)
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  location /api {\n\
    return 404;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
