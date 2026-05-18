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
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
