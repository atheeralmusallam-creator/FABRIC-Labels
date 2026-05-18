#!/bin/sh

# Replace BACKEND_URL placeholder in nginx config at runtime
BACKEND_URL="${BACKEND_URL:-https://fabric-labels-production.up.railway.app}"

sed -i "s|BACKEND_URL_PLACEHOLDER|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

echo "Backend URL: ${BACKEND_URL}"

nginx -g 'daemon off;'
