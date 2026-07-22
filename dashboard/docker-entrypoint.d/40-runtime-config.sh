#!/bin/sh
set -eu

escape_js() {
  printf '%s' "$1" | sed 's/[\\]/\\\\/g; s/"/\\"/g'
}

api_url=$(escape_js "${VITE_API_URL:-}")
common_socket_url=$(escape_js "${VITE_COMMON_SOCKET_URL:-}")
payment_socket_url=$(escape_js "${VITE_PAYMENT_SOCKET_URL:-}")
attack_socket_url=$(escape_js "${VITE_ATTACK_SOCKET_URL:-}")

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__LOADSERVICE_CONFIG__ = {
  apiUrl: "$api_url",
  commonSocketUrl: "$common_socket_url",
  paymentSocketUrl: "$payment_socket_url",
  attackSocketUrl: "$attack_socket_url"
};
EOF
