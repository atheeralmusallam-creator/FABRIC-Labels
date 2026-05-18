#!/bin/sh

# Strip https:// and use http:// for nginx proxy_pass (nginx handles SSL upstream separately)
RAW="${BACKEND_URL:-https://fabric-labels-production.up.railway.app}"
# Convert https:// to http:// for nginx compatibility
BACKEND_HTTP=$(echo "$RAW" | sed 's|https://|http://|g')

sed -i "s|BACKEND_URL_PLACEHOLDER|${BACKEND_HTTP}|g" /etc/nginx/conf.d/default.conf

echo "Proxying /api to: ${BACKEND_HTTP}/api"

nginx -g 'daemon off;'
